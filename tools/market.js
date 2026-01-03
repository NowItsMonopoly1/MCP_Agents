import { getMarketSnapshot } from "../feeds/market.stub.js";

export const market = {
  description: "Read-only market snapshot for Quant Council inputs",

  inputSchema: {
    type: "object",
    properties: {
      asset: { type: "string", default: "BTC" }
    },
    required: ["asset"]
  },

  async execute({ asset }) {
    const snap = getMarketSnapshot();
    return {
      actions: [{
        type: "market_snapshot",
        asset,
        data: snap
      }]
    };
  }
};