#!/usr/bin/env node
import { createInterface } from "node:readline";
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname);

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const NC = "\x1b[0m";

function banner() {
  console.log();
  console.log(`${CYAN}${BOLD}  ♪  Orchestra Dev Loop${NC}`);
  console.log(`${DIM}  ─────────────────────────${NC}`);
  console.log();
  console.log(`  ${GREEN}1)${NC} Host mode ${DIM}— API + Admin on host, MongoDB in Docker${NC}`);
  console.log(`  ${GREEN}2)${NC} Docker mode ${DIM}— API + Admin + MongoDB all in Docker${NC}`);
  console.log(`  ${GREEN}3)${NC} Install deps ${DIM}— pnpm install across all workspace apps${NC}`);
  console.log();
}

function prompt() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => {
    rl.question(`${YELLOW}  Choose [1/2/3]:${NC}`, (answer) => {
      rl.close();
      res(answer.trim());
    });
  });
}

async function main() {
  banner();

  const choice = await prompt();

  if (choice === "3") {
    console.log(`\n${CYAN}  Installing dependencies across all workspace apps…${NC}\n`);
    const child = spawn("pnpm", ["install"], { cwd: ROOT, stdio: "inherit" });
    child.on("close", (code) => process.exit(code ?? 0));
    return;
  }

  let script;
  if (choice === "1") {
    script = resolve(ROOT, "scripts/dev-start.mjs");
  } else if (choice === "2") {
    script = resolve(ROOT, "scripts/docker-deploy.mjs");
  } else {
    console.log(`\n  Invalid choice. Use 1, 2, or 3.\n`);
    process.exit(1);
  }

  console.log();
  const child = spawn("node", [script], { cwd: ROOT, stdio: "inherit" });
  child.on("close", (code) => process.exit(code ?? 0));
}

main();
