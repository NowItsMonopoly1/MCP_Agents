// Run the Primus Quant Council

import { COUNCIL_CONFIG } from "../os/council.config.js";

export const quant = {
  description: "Run Primus Quant Council",

  inputSchema: {
    type: "object",
    properties: {
      inputs: {
        type: "object",
        additionalProperties: { type: "string" }
      }
    },
    required: ["inputs"]
  },

  async execute({ inputs }) {
    // Handle both object (Inspector) and string (CLI)
    const parsedInputs = typeof inputs === 'string' ? JSON.parse(inputs) : inputs;
    // council logic already exists
    const result = COUNCIL_CONFIG.aggregate(Object.values(parsedInputs));
    return {
      actions: [
        { type: "council_verdict", decision: result.action }
      ]
    };
  }
};