#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import { symlinkSync, unlinkSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const NC = "\x1b[0m";

const log = (msg) => console.log(`${GREEN}[orchestra]${NC} ${msg}`);
const warn = (msg) => console.log(`${YELLOW}[orchestra]${NC} ${msg}`);
const err = (msg) => console.log(`${RED}[orchestra]${NC} ${msg}`);

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: "pipe", ...opts }).trim();
  } catch {
    return "";
  }
}

function portInUse(port) {
  return run(`lsof -ti:${port}`).length > 0;
}

function killPort(port) {
  const pids = run(`lsof -ti:${port}`);
  if (pids) {
    run(`kill -9 ${pids.split("\n").join(" ")}`);
  }
}

function dockerRunning() {
  return run("docker info") !== "";
}

function containerRunning(name) {
  return run("docker ps --format '{{.Names}}'").split("\n").includes(name);
}

function spawnBg(cmd, args, opts = {}) {
  const child = spawn(cmd, args, {
    cwd: ROOT,
    stdio: "ignore",
    detached: true,
    ...opts,
  });
  child.unref();
  return child;
}

function httpCheck(url, timeout = 5000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on("error", () => resolve(0));
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve(0);
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  process.chdir(ROOT);

  // ---------- MongoDB ----------
  if (containerRunning("orchestra-db")) {
    log("MongoDB already running (orchestra-db container)");
  } else {
    if (!dockerRunning()) {
      warn("Docker not running — launching Docker Desktop...");
      run("open -a Docker");
      for (let i = 0; i < 30; i++) {
        if (dockerRunning()) break;
        await sleep(2000);
      }
      if (!dockerRunning()) {
        err("Docker failed to start");
        process.exit(1);
      }
    }

    run("docker rm -f orchestra-db");
    killPort(27017);

    log("Starting MongoDB...");
    run(
      `docker run --rm -d --name orchestra-db -p 27017:27017 mongo:7 --replSet rs0 --bind_ip_all --noauth`
    );

    await sleep(3000);
    run(
      `docker exec orchestra-db mongosh --quiet --eval "try{rs.status().ok}catch(e){rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]}).ok}"`
    );
    log("MongoDB replica set initialized");
  }

  // ---------- Env symlink ----------
  const envTarget = resolve(ROOT, ".env");
  const envLink = resolve(ROOT, "apps/api/.env");
  try {
    unlinkSync(envLink);
  } catch {}
  symlinkSync(envTarget, envLink);

  // ---------- Build packages ----------
  log("Building shared packages...");
  execSync("npx tsc --project packages/shared/tsconfig.json", {
    cwd: ROOT,
    stdio: "inherit",
  });
  execSync("npm run build:database", { cwd: ROOT, stdio: "inherit" });
  log("Packages built");

  // ---------- API (port 3001) ----------
  if (portInUse(3001)) {
    log("API already running on port 3001");
  } else {
    log("Starting API on port 3001...");
    spawnBg("npm", ["run", "dev:api"]);
  }

  // ---------- Admin (port 5173) ----------
  if (portInUse(5173)) {
    log("Admin already running on port 5173");
  } else {
    log("Starting Admin on port 5173...");
    spawnBg("npm", ["run", "dev:admin"]);
  }

  // ---------- Expo Web (port 8081) ----------
  if (portInUse(8081)) {
    log("Expo already running on port 8081");
  } else {
    log("Starting Expo web on port 8081...");
    spawnBg("npx", ["expo", "start", "--web", "--port", "8081"], {
      cwd: resolve(ROOT, "apps/mobile"),
    });
  }

  // ---------- Verify ----------
  log("Waiting for services...");
  await sleep(8000);

  let errors = 0;

  const apiStatus = await httpCheck("http://localhost:3001/api/templates");
  if (apiStatus === 200) {
    log("API .......... OK");
  } else {
    err("API .......... FAILED (check /tmp/orchestra-api.log)");
    errors++;
  }

  const adminStatus = await httpCheck("http://localhost:5173");
  if (adminStatus === 200) {
    log("Admin ........ OK");
  } else {
    err("Admin ........ FAILED (check /tmp/orchestra-admin.log)");
    errors++;
  }

  const expoStatus = await httpCheck("http://localhost:8081");
  if (expoStatus === 200) {
    log("Expo ......... OK");
  } else {
    err("Expo ......... FAILED (check /tmp/orchestra-expo.log)");
    errors++;
  }

  console.log();
  if (errors === 0) {
    log("All services running!");
    log("  API:   http://localhost:3001");
    log("  Admin: http://localhost:5173");
    log("  Expo:  http://localhost:8081");
  } else {
    err(`${errors} service(s) failed to start`);
    process.exit(1);
  }
}

main();
