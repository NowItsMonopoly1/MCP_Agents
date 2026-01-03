// Project Council: portfolio prioritization engine

import { COUNCIL_CONFIG } from "../os/council.config.js";

export const project_council = {
  description: "Project Council: portfolio prioritization and completion planning",

  inputSchema: {
    type: "object",
    properties: {
      project: { type: "string" },
      signals: {
        type: "object",
        additionalProperties: { oneOf: [{ type: "number" }, { type: "string" }] }
      }
    },
    required: ["project", "signals"]
  },

  async execute({ project, signals }) {
    const result = COUNCIL_CONFIG.aggregate(signals);
    if (!result) {
      return {
        actions: [{
          type: "reject",
          reason: "Project vetoed by Risk Governor"
        }]
      };
    }
    return {
      actions: [{
        type: "prioritize_project",
        project,
        score: result.score,
        reason: result.reason,
        next_steps: result.next_steps
      }]
    };
  }
};