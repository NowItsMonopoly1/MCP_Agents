// PrimusCoder: controlled code-execution tool

import fs from 'fs/promises';
import path from 'path';

export const coder = {
  description: "PrimusCoder: controlled code-execution tool for planning and applying small, auditable code changes",

  inputSchema: {
    type: "object",
    properties: {
      mode: { type: "string", enum: ["plan", "apply"] },
      file: { type: "string" },
      patch: { type: "string" },
      note: { type: "string" },
      risk_override: { type: "boolean" },
      risk_reason: { type: "string" }
    },
    required: ["mode", "file"]
  },

  async execute({ mode, file, patch = "", note = "", risk_override = false, risk_reason = "" }) {
    // Path normalization and validation
    const abs = path.resolve(file);
    if (!abs.startsWith(process.cwd())) {
      return { actions: [{ type: "reject", reason: "Edits outside project root not allowed" }] };
    }

    const normalized = file.replace(/\\/g, "/");
    const isProtected =
      normalized === "server.js" ||
      normalized.startsWith("os/") ||
      normalized.startsWith("council/");

    if (isProtected && mode === "apply") {
      if (risk_override !== true || !risk_reason?.trim()) {
        return {
          actions: [{
            type: "reject",
            reason: "RiskGovernor: protected file requires risk_override=true and risk_reason"
          }]
        };
      }
    }

    if (mode === "plan") {
      if (!note) {
        return { actions: [{ type: "reject", reason: "Plan mode requires note" }] };
      }
      return {
        actions: [
          {
            type: "plan_described",
            description: note,
            constraints: "One file per invocation, ≤60 lines changed, no refactors, no architectural changes, no framework introduction, no edits outside project root"
          }
        ]
      };
    } else if (mode === "apply") {
      if (!patch) {
        return { actions: [{ type: "reject", reason: "Apply mode requires patch" }] };
      }
      try {
        const content = await fs.readFile(file, 'utf8');
        const newContent = patch;
        const oldLines = content.split('\n').length;
        const newLines = newContent.split('\n').length;
        const linesChanged = Math.abs(newLines - oldLines);
        if (linesChanged > 60) {
          return { actions: [{ type: "reject", reason: `Change exceeds 60 lines: ${linesChanged} lines changed` }] };
        }
        await fs.writeFile(file, newContent, 'utf8');
        // Simple diff
        const diff = `--- ${file}\n+++ ${file}\n@@ -1,${oldLines} +1,${newLines} @@\n-${content}\n+${newContent}`;
        return {
          actions: [
            {
              type: "code_applied",
              file,
              risk_override: risk_override === true,
              production_lock: true,
              lines_changed: linesChanged,
              diff
            }
          ]
        };
      } catch (error) {
        return { actions: [{ type: "reject", reason: error.message }] };
      }
    } else {
      return { actions: [{ type: "reject", reason: "Invalid mode" }] };
    }
  }
};