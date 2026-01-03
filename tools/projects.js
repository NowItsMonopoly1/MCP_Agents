import path from "path";
import { loadRegistry, createProjectAdapter } from "../adapters/project.adapter.js";

const REGISTRY = loadRegistry(path.resolve("registry/projects.json"));
const adapters = Object.fromEntries(
  Object.entries(REGISTRY).map(([k, v]) => [k, createProjectAdapter(v)])
);

export const projects = {
  description: "Read-only project registry and workspace access",

  inputSchema: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["list", "inspect", "read"] },
      name: { type: "string" },
      path: { type: "string" }
    },
    required: ["action"]
  },

  async execute({ action, name, path }) {
    if (action === "list") {
      return { actions: [{ type: "projects_list", projects: Object.keys(adapters) }] };
    }

    const p = adapters[name];
    if (!p) return { actions: [{ type: "reject", reason: "Unknown project" }] };

    if (action === "inspect") {
      return { actions: [{ type: "project_inspect", name, summary: p.summarize() }] };
    }

    if (action === "read") {
      if (!path) return { actions: [{ type: "reject", reason: "Path required" }] };
      return {
        actions: [{ type: "project_read", name, path, content: p.readFile(path) }]
      };
    }

    return { actions: [{ type: "reject", reason: "Invalid action" }] };
  }
};