import { callTool } from "./mcpClient.js";

export async function planNextAction(goal) {
  // Observe projects
  const projects = await callTool("projects", { action: "list" });
  const projectNames = projects.actions[0].projects;

  // Inspect each
  const inspections = [];
  for (const name of projectNames) {
    const inspect = await callTool("projects", { action: "inspect", name });
    inspections.push(inspect.actions[0]);
  }

  // Propose priority: prefer boring businesses, exclude trading by default
  // Priority order: saas, services, analytics, dashboards (anything except trading)
  const boringProjects = inspections.filter(
    i => i.summary.revenue_ready && i.summary.domain !== "trading"
  );
  const priority = boringProjects[0] || inspections.find(i => i.summary.revenue_ready);

  if (!priority) {
    return { action: "none_ready", reason: "No revenue-ready projects" };
  }

  // Run council
  const council = await callTool("project_council", {
    project: priority.name,
    signals: {
      "Technical Readiness": 4,
      "Revenue Readiness": 5,
      "Market Timing": 3,
      "Scope Risk": 2,
      "Operator Leverage": 4,
      "Risk Governor": "approve"
    }
  });

  // Check ship
  const ship = await callTool("ship", {
    project: priority.name,
    domain: priority.summary.domain,
    checks: {
      // Placeholder checks based on domain
      ...(priority.summary.domain === "trading" ? {
        strategy_defined: true,
        risk_limits_set: true,
        backtest_results_present: true,
        paper_trading_verified: false
      } : {})
    }
  });

  return {
    priority: council.actions[0],
    ship_status: ship.actions[0],
    next_action: ship.actions[0].ready ? "handoff_to_ops" : "complete_blockers"
  };
}