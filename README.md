# Primus OS MCP Server

This is the Model Context Protocol (MCP) server for Primus OS, a real execution layer for AI agents.

## Architecture

- **server.js**: The kernel MCP server
- **os/primus.os.js**: Operating law with non-negotiable rules
- **os/council.config.js**: Primus Quant Council configuration
- **tools/*.js**: MCP tools (docaudit, quant, ops)
- **memory/primus.memory.json**: Persistent operator context

## Setup

1. Install dependencies: `npm install`
2. Run the server: `node server.js`

## Usage

This MCP server exposes tools for document audit, quant council decisions, and operations.

## Development

Follow Primus OS constraints:
- ESM only ("type": "module")
- Tools under ~60 lines
- Deterministic, modular, executable
- Enforce executable actions in outputs