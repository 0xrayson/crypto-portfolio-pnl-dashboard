/**
 * Generates a deterministic-looking but randomized daily portfolio history.
 * Used only by prisma/seed.ts to seed demo PortfolioSnapshot rows — the
 * Overview page itself now sources real PnL/value history from the swap
 * engine and transaction-based value reconstruction instead of this table.
 * Every row it produces is written with `source: "SEEDED_MOCK"`.
 */
export interface MockSnapshotPoint {
  capturedAt: Date;
  totalUsdValue: number;
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
}

export function generateMockSnapshotSeries(opts: {
  days: number;
  startingValue: number;
  endingValue: number;
  volatility?: number;
}): MockSnapshotPoint[] {
  const { days, startingValue, endingValue, volatility = 0.04 } = opts;
  const points: MockSnapshotPoint[] = [];
  const now = new Date();
  let value = startingValue;
  let cumulativeRealized = 0;

  for (let i = days; i >= 0; i--) {
    const progress = 1 - i / days;
    const trendTarget = startingValue + (endingValue - startingValue) * progress;
    const noise = (Math.random() - 0.5) * 2 * volatility * trendTarget;
    value = Math.max(0, trendTarget + noise);

    if (Math.random() < 0.08) {
      cumulativeRealized += (Math.random() - 0.3) * 0.05 * value;
    }

    const capturedAt = new Date(now);
    capturedAt.setDate(now.getDate() - i);

    points.push({
      capturedAt,
      totalUsdValue: Math.round(value * 100) / 100,
      realizedPnlUsd: Math.round(cumulativeRealized * 100) / 100,
      unrealizedPnlUsd: Math.round((value - startingValue - cumulativeRealized) * 100) / 100,
    });
  }

  // Pin the final point to the exact ending value so a live "today" number
  // (real portfolio value) never visibly disagrees with the mock series.
  if (points.length > 0) {
    const last = points[points.length - 1];
    last.totalUsdValue = endingValue;
    last.unrealizedPnlUsd = Math.round((endingValue - startingValue - cumulativeRealized) * 100) / 100;
  }

  return points;
}
