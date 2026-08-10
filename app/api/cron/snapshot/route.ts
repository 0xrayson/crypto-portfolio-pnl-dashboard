import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { getPortfolioValue } from "@/lib/server/portfolio/getBalances";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Writes one real PortfolioSnapshot per known wallet, capturing the live
 * total USD value. realized/unrealizedPnlUsd are left at 0 — computing them
 * for real requires the cost-basis engine (consumes Transaction.amountUsdAtTx),
 * which is a follow-up task. Once that engine exists, replace the 0s below
 * and flip `source` to COMPUTED with real figures.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallets = await prisma.wallet.findMany();
  let written = 0;

  for (const wallet of wallets) {
    const totalUsdValue = await getPortfolioValue(wallet.ecosystem, wallet.address).catch(() => null);
    if (totalUsdValue === null) continue;

    await prisma.portfolioSnapshot.create({
      data: {
        walletId: wallet.id,
        capturedAt: new Date(),
        totalUsdValue,
        realizedPnlUsd: 0,
        unrealizedPnlUsd: 0,
        source: "COMPUTED",
      },
    });
    written++;
  }

  return NextResponse.json({ walletsChecked: wallets.length, written });
}
