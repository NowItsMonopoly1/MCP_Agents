// Primus OS Operating Law
// Non-negotiable rules for Primus OS execution

import { ProductionLock } from "./production.lock.js";

export const PRIMUS_OS_RULES = {
  // Risk limits
  MAX_RISK_PER_OPERATION: 0.1, // 10% max risk
  MAX_TOTAL_RISK: 0.5, // 50% total portfolio risk

  // Execution requirements
  REQUIRE_EXECUTABLE_ACTIONS: true, // All outputs must contain executable actions
  REJECT_NON_ACTION_OUTPUTS: true, // Reject outputs without actions

  // Line limits
  MAX_LINES_PER_TOOL: 60, // Tools under ~60 lines
  MAX_COMPLEXITY: 'simple', // Prefer simple, explicit code

  // Enforcement
  ENFORCE_DECISIONS: true, // Enforce disciplined decision-making
  MAINTAIN_PARITY: true // Strict parity across machines
};

// Validation function
export function validateOutput(output) {
  if (PRIMUS_OS_RULES.REQUIRE_EXECUTABLE_ACTIONS && !hasExecutableActions(output)) {
    throw new Error("Primus OS: Output must contain executable actions");
  }
  return true;
}

// Helper to check for executable actions
function hasExecutableActions(output) {
  // TODO: Implement logic to check for actions in output
  return true; // Placeholder
}

export const PrimusOS = {
  validateDecision: (result) => {
    if (!result.actions || !Array.isArray(result.actions) || result.actions.length === 0) {
      throw new Error("Primus OS: Decision must contain executable actions");
    }
    for (const a of result.actions) {
      if (a.type === "code_applied") {
        const f = (a.file || "").replace(/\\/g, "/");
        const isProtected =
          f === "server.js" || f.startsWith("os/") || f.startsWith("council/");

        if (isProtected && a.risk_override !== true) {
          throw new Error("PrimusOS: RiskGovernor veto (protected file write without override)");
        }
      }
    }
    if (ProductionLock.enabled) {
      for (const a of result.actions) {
        if (a.type === "code_applied") {
          const f = (a.file || "").replace(/\\/g, "/");
          const isProtected =
            f === "server.js" ||
            f.startsWith("os/") ||
            f.startsWith("council/");

          if (isProtected && a.risk_override !== true) {
            throw new Error("PrimusOS: ProductionLock veto (core is frozen)");
          }
        }
      }
    }
  }
};