import { prisma } from "@/lib/server/db/prisma";
import { getOrCreateWallet } from "./wallet";
import { getPortfolioValue } from "./getBalances";
import type { Ecosystem } from "@/types/wallet";
import type { PortfolioSnapshotView } from "@/types/portfolio";

/**
 * Value/PnL-over-time series. Backed by SEEDED_MOCK rows until the
 * cost-basis engine exists; the most recent point is overwritten with the
 * real, live-computed portfolio value so it never visibly disagrees with the
 * current-value card.
 */
export async function getSnapshots(ecosystem: Ecosystem, address: string): Promise<PortfolioSnapshotView[]> {
  const wallet = await getOrCreateWallet(ecosystem, address);

  const rows = await prisma.portfolioSnapshot.findMany({
    where: { walletId: wallet.id },
    orderBy: { capturedAt: "asc" },
  });

  const views: PortfolioSnapshotView[] = rows.map((r) => ({
    capturedAt: r.capturedAt.toISOString(),
    totalUsdValue: Number(r.totalUsdValue),
    realizedPnlUsd: Number(r.realizedPnlUsd),
    unrealizedPnlUsd: Number(r.unrealizedPnlUsd),
    source: r.source,
  }));

  const liveValue = await getPortfolioValue(ecosystem, address).catch(() => null);
  if (liveValue !== null && views.length > 0) {
    const last = views[views.length - 1];
    const delta = liveValue - last.totalUsdValue;
    views[views.length - 1] = { ...last, totalUsdValue: liveValue, unrealizedPnlUsd: last.unrealizedPnlUsd + delta };
  }

  return views;
}

export async function getPnlSummary(ecosystem: Ecosystem, address: string) {
  const series = await getSnapshots(ecosystem, address);
  const latest = series[series.length - 1];
  return {
    realizedPnlUsd: latest?.realizedPnlUsd ?? 0,
    unrealizedPnlUsd: latest?.unrealizedPnlUsd ?? 0,
    totalUsdValue: latest?.totalUsdValue ?? 0,
    source: latest?.source ?? "SEEDED_MOCK",
  };
}
