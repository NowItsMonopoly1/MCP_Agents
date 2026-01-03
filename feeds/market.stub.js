export function getMarketSnapshot() {
  // Deterministic stub (replace later with real feeds)
  return {
    source: "stub",
    ts: new Date().toISOString(),
    price: 67250.0,
    volume_24h: 1_250_000_000,
    funding_rate: 0.0004,
    volatility_24h: 0.021
  };
}