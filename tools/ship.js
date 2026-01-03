import { shipCriteria } from "../contracts/ship.criteria.js";

export const ship = {
  description: "Evaluate whether a project meets ship criteria",

  inputSchema: {
    type: "object",
    properties: {
      project: { type: "string" },
      domain: { type: "string" },
      checks: { type: "object" }
    },
    required: ["project", "domain", "checks"]
  },

  async execute({ project, domain, checks }) {
    const criteria = shipCriteria[domain];
    if (!criteria) {
      return {
        actions: [{ type: "reject", reason: "Unknown domain" }]
      };
    }

    const missing = criteria.required.filter(r => !checks[r]);

    return {
      actions: [{
        type: "ship_evaluation",
        project,
        domain,
        ready: missing.length === 0,
        missing,
        next_step: missing.length === 0
          ? "handoff_to_ops"
          : "complete_missing_items"
      }]
    };
  }
};