#!/usr/bin/env node
import { spawn } from "child_process";

const [, , tool, action, ...rest] = process.argv;

if (tool === "journal" && action === "tail") {
  const { tailJournal } = await import("../journal/read.js");
  tailJournal(Number(rest[0]) || 20);
  process.exit(0);
}

if (!tool || !action) {
  console.error("Usage: primus <tool> <action> [--key value]");
  process.exit(1);
}

// Parse --key value args into JSON
const args = {};
for (let i = 0; i < rest.length; i += 2) {
  const key = rest[i]?.replace(/^--/, "");
  const val = rest[i + 1];
  if (key) args[key] = val;
}

// Build MCP Inspector command
const mcpArgs = JSON.stringify({
  name: tool,
  arguments: {
    mode: action,
    ...args
  }
});

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ["@modelcontextprotocol/inspector", "node", "server.js"],
  { stdio: ["pipe", "inherit", "inherit"] }
);

// Send tool call via stdin
child.stdin.write(mcpArgs);
child.stdin.end();