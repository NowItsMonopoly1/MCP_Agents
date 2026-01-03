import { planNextAction } from "./planner.js";

export async function runAgent() {
  console.log("PrimusPlanner: Starting reasoning loop...");

  try {
    const plan = await planNextAction("prioritize_next_project");
    console.log("🧠 PrimusPlanner recommendation:", JSON.stringify(plan, null, 2));
  } catch (error) {
    console.error("Agent error:", error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAgent();
}