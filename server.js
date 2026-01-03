import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { tools } from "./tools/index.js";
import { PrimusOS } from "./os/primus.os.js";
import { writeJournal } from "./journal/write.js";
import express from "express";
import cors from "cors";

// Create server instance
const server = new Server(
  {
    name: "primus-os-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Set handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.entries(tools).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const tool = tools[name];
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }

  writeJournal({
    phase: "request",
    tool: name,
    args
  });

  try {
    const result = await tool.execute(args);

    // 🔒 PRIMUS OS ENFORCEMENT
    PrimusOS.validateDecision(result);

    writeJournal({
      phase: "result",
      tool: name,
      result
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result)
        }
      ]
    };
  } catch (err) {
    writeJournal({
      phase: "rejected",
      tool: name,
      error: err.message
    });
    throw err;
  }
});

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Store transports by session ID
const transports = {};

// SSE endpoint
app.get('/mcp', async (req, res) => {
  try {
    const transport = new SSEServerTransport('/messages', res);
    const sessionId = transport.sessionId;
    transports[sessionId] = transport;

    transport.onclose = () => {
      delete transports[sessionId];
    };

    await server.connect(transport);

    console.error(`SSE connection established for session ${sessionId}`);
  } catch (error) {
    console.error('Error establishing SSE connection:', error);
    if (!res.headersSent) {
      res.status(500).send('Error establishing SSE connection');
    }
  }
});

// Messages endpoint
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId || !transports[sessionId]) {
    res.status(404).send('Session not found');
    return;
  }

  const transport = transports[sessionId];
  try {
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error('Error handling message:', error);
    if (!res.headersSent) {
      res.status(500).send('Error handling message');
    }
  }
});

// Main function
async function main() {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.error(`🧠 Primus MCP online on port ${port}`);
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});