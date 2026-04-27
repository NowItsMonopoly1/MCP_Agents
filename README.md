# MCP Agents

Public MCP and agent workflow experiments focused on tool routing, safe automation, and inspectable agent behavior.

This repo presents a small Model Context Protocol server surface for Primus OS-style agent workflows. The portfolio story is not autonomous execution for its own sake; it is controlled tool access, deterministic constraints, and operator-visible behavior.

## What This Demonstrates

- MCP server structure for exposing agent-accessible tools.
- Tool routing for document audit, operations, and decision-support workflows.
- A modular execution layer that can be reviewed and constrained.
- Public-safe framing for agent/tool interfaces.
- The control pattern: `ACTION -> VALIDATE -> APPROVE -> EXECUTE -> LOG -> REPLAY`.

## What This Does Not Claim

- It is not a production-grade agent platform.
- It does not grant agents unrestricted authority.
- It does not include private memory, credentials, customer records, or production runtime logs.
- It does not prove compliance or financial safety by itself.

## Architecture

- `server.js` - kernel MCP server.
- `os/primus.os.js` - operating rules and constraints.
- `os/council.config.js` - council-style decision configuration.
- `tools/*.js` - MCP tools for audit, quant, and operations workflows.
- `memory/` - local operator context; keep real memory private.

## Safe Demo Path

```bash
npm install
node server.js
```

Use synthetic prompts and sample inputs only. Do not connect this public demo to private systems, secrets, production tools, wallets, customer files, or live execution surfaces.

## Public/Private Boundary

Public code should show the tool interface and governance pattern. Private deployments should keep real operator memory, runtime journals, credentials, and production integrations outside the repo.

## Topic Recommendations

`mcp-agents`, `ai-governance`, `agent-safety`, `human-in-the-loop`, `tool-routing`, `workflow-automation`, `public-safe-demo`
