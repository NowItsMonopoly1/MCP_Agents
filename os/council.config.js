// Primus Quant Council Configuration
// Decision aggregation engine for Primus OS

export const COUNCIL_CONFIG = {
  members: [
    {
      name: "Technical Readiness",
      weight: 1.2,
      type: "readiness"
    },
    {
      name: "Revenue Readiness",
      weight: 1.5,
      type: "revenue"
    },
    {
      name: "Market Timing",
      weight: 1.1,
      type: "timing"
    },
    {
      name: "Scope Risk",
      weight: -1.3, // negative weight
      type: "risk"
    },
    {
      name: "Operator Leverage",
      weight: 1.4,
      type: "leverage"
    },
    {
      name: "Risk Governor",
      weight: 2.0, // Higher weight, can override ties
      type: "governor"
    }
  ],

  // Aggregation logic
  aggregate: function(signals) {
    const riskGovernor = signals["Risk Governor"];
    if (riskGovernor === "veto") {
      return null; // Vetoed
    }
    const riskModifier = riskGovernor === "hold" ? 0.6 : 1.0;

    let score = 0;
    for (const member of this.members) {
      if (member.name === "Risk Governor") continue;
      const signal = signals[member.name];
      if (typeof signal === "number") {
        score += signal * member.weight;
      }
    }
    score *= riskModifier;

    // Placeholder reason and next_steps
    let reason = "Balanced prioritization";
    if (score > 10) reason = "High potential with low risk";
    else if (score < 5) reason = "Needs improvement before prioritization";

    const next_steps = [
      "Finalize MVP scope",
      "Create landing page",
      "Enable pricing + Stripe"
    ];

    return { score: Math.round(score * 10) / 10, reason, next_steps };
  }
};