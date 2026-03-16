#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
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
    return execSync(cmd, { encoding: "utf-8", stdio: "pipe", cwd: ROOT, ...opts }).trim();
  } catch {
    return "";
  }
}

function killPort(port) {
  const pids = run(`lsof -ti:${port}`);
  if (pids) run(`kill -9 ${pids.split("\n").join(" ")}`);
}

function portInUse(port) {
  return run(`lsof -ti:${port}`).length > 0;
}

function httpCheck(url, timeout = 5000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on("error", () => resolve(0));
    req.setTimeout(timeout, () => { req.destroy(); resolve(0); });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  process.chdir(ROOT);

  // Ensure Docker is running
  if (!run("docker info")) {
    warn("Docker not running — launching Docker Desktop...");
    run("open -a Docker");
    for (let i = 0; i < 30; i++) {
      if (run("docker info")) break;
      await sleep(2000);
    }
    if (!run("docker info")) { err("Docker failed to start"); process.exit(1); }
  }

  // Kill host processes on target ports
  log("Clearing ports...");
  for (const port of [3001, 5173, 8081, 27017]) killPort(port);

  // Remove existing containers
  log("Removing old containers...");
  run("docker rm -f orchestra-api orchestra-admin orchestra-db");

  // Create network
  run("docker network create orchestra-net");

  // Build shared package
  log("Building shared packages...");
  execSync("npx tsc --project packages/shared/tsconfig.json", { cwd: ROOT, stdio: "inherit" });

  // Start MongoDB
  log("Starting MongoDB...");
  run(
    `docker run -d --name orchestra-db --network orchestra-net -p 27017:27017 -v mongodata:/data/db mongo:7 --replSet rs0 --bind_ip_all --noauth`
  );

  await sleep(3000);
  run(
    `docker exec orchestra-db mongosh --quiet --eval "try{rs.status().ok}catch(e){rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]}).ok}"`
  );
  log("MongoDB replica set initialized");

  // Build Docker images in parallel
  log("Building Docker images (API + Admin)...");
  const apiBuild = new Promise((res, rej) => {
    const p = spawn("docker", ["build", "-t", "orchestra-api", "-f", "apps/api/Dockerfile", "."], { cwd: ROOT, stdio: "inherit" });
    p.on("close", (code) => (code === 0 ? res() : rej(new Error("API build failed"))));
  });
  const adminBuild = new Promise((res, rej) => {
    const p = spawn("docker", ["build", "-t", "orchestra-admin", "--build-arg", "VITE_API_URL=http://localhost:3001", "-f", "apps/admin/Dockerfile", "."], { cwd: ROOT, stdio: "inherit" });
    p.on("close", (code) => (code === 0 ? res() : rej(new Error("Admin build failed"))));
  });

  try {
    await Promise.all([apiBuild, adminBuild]);
  } catch (e) {
    err(e.message);
    process.exit(1);
  }
  log("Docker images built");

  // Start API container
  log("Starting API container...");
  run(
    `docker run -d --name orchestra-api --network orchestra-net -p 3001:3001 ` +
    `-e DATABASE_URL="mongodb://orchestra-db:27017/orchestra?replicaSet=rs0&directConnection=true" ` +
    `-e NEXTAUTH_URL="http://localhost:3001" ` +
    `-e NEXTAUTH_SECRET="dev-secret-change-in-production" ` +
    `orchestra-api`
  );

  // Start Admin container
  log("Starting Admin container...");
  run(
    `docker run -d --name orchestra-admin --network orchestra-net -p 5173:5173 ` +
    `-e VITE_API_URL="http://localhost:3001" ` +
    `orchestra-admin`
  );

  // Start Expo on host
  if (portInUse(8081)) {
    log("Expo already running on port 8081");
  } else {
    log("Starting Expo web on port 8081...");
    const expo = spawn("npx", ["expo", "start", "--web", "--port", "8081"], {
      cwd: resolve(ROOT, "apps/mobile"),
      stdio: "ignore",
      detached: true,
      env: { ...process.env, EXPO_PUBLIC_API_URL: "http://localhost:3001" },
    });
    expo.unref();
  }

  // Verify
  log("Waiting for services...");
  await sleep(8000);

  log("Docker containers:");
  execSync("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' --filter name=orchestra", { cwd: ROOT, stdio: "inherit" });
  console.log();

  let errors = 0;

  const apiStatus = await httpCheck("http://localhost:3001/api/templates");
  if (apiStatus === 200) log("API .......... OK");
  else { err("API .......... FAILED"); errors++; }

  const adminStatus = await httpCheck("http://localhost:5173");
  if (adminStatus === 200) log("Admin ........ OK");
  else { err("Admin ........ FAILED"); errors++; }

  const expoStatus = await httpCheck("http://localhost:8081");
  if (expoStatus === 200) log("Expo ......... OK");
  else { err("Expo ......... FAILED"); errors++; }

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
