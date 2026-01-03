export const shipCriteria = {
  saas: {
    required: [
      "offer_clarity",
      "delivery_surface_exists",
      "monetization_defined",
      "customer_path_tested",
      "minimum_value_delivered"
    ],
    optional: [
      "feedback_loop_ready"
    ]
  },

  trading: {
    required: [
      "strategy_defined",
      "risk_limits_set",
      "backtest_results_present",
      "paper_trading_verified"
    ],
    optional: [
      "live_switch_guarded",
      "monitoring_dashboard"
    ]
  }
};