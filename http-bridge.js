import express from 'express';
import cors from 'cors';
import { tools } from './tools/index.js';
import { writeJournal } from './journal/write.js';
import { PrimusOS } from './os/primus.os.js';

const app = express();
const PORT = process.env.MCP_HTTP_PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'online', tools: Object.keys(tools) });
});

// Change Order Draft endpoint
app.post('/change-order-draft', async (req, res) => {
  const { notes, projectId } = req.body;

  writeJournal({
    phase: 'http_request',
    endpoint: '/change-order-draft',
    body: { notes, projectId }
  });

  try {
    const tool = tools.change_order_draft;
    if (!tool) {
      throw new Error('Tool not found: change_order_draft');
    }

    const result = await tool.execute({ notes, projectId });

    // Governance validation
    PrimusOS.validateDecision(result);

    writeJournal({
      phase: 'http_response',
      endpoint: '/change-order-draft',
      result
    });

    res.json(result);
  } catch (error) {
    writeJournal({
      phase: 'http_error',
      endpoint: '/change-order-draft',
      error: error.message
    });

    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Primus MCP HTTP Bridge running on port ${PORT}`);
});

// Change Order Approve endpoint
app.post('/change-order-approve', async (req, res) => {
  const { draftId, projectId, approvedBy, draftSnapshot } = req.body;

  writeJournal({
    phase: 'http_request',
    endpoint: '/change-order-approve',
    body: { draftId, projectId, approvedBy }
  });

  try {
    const tool = tools.change_order_approve;
    if (!tool) {
      throw new Error('Tool not found: change_order_approve');
    }

    const result = await tool.execute({ draftId, projectId, approvedBy, draftSnapshot });

    PrimusOS.validateDecision(result);

    writeJournal({
      phase: 'http_response',
      endpoint: '/change-order-approve',
      result
    });

    res.json(result);
  } catch (error) {
    writeJournal({
      phase: 'http_error',
      endpoint: '/change-order-approve',
      error: error.message
    });

    res.status(500).json({
      error: error.message
    });
  }
});
