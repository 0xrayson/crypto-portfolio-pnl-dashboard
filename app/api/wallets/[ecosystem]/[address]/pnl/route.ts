import { NextRequest, NextResponse } from "next/server";
import { refreshTransactions } from "@/lib/server/portfolio/getTransactions";
import { getPortfolioPnl } from "@/lib/server/portfolio/getPortfolioPnl";

// Refreshes transactions + fetches balances (5 chains + CoinGecko each); a
// cold serverless instance can exceed Vercel's default execution limit.
export const maxDuration = 60;
import { parseEcosystem } from "@/lib/server/api/ecosystem";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ecosystem: string; address: string }> }) {
  const { ecosystem: rawEcosystem, address } = await params;
  const ecosystem = parseEcosystem(rawEcosystem);
  if (!ecosystem) {
    return NextResponse.json({ error: "Invalid ecosystem" }, { status: 400 });
  }

  try {
    await refreshTransactions(ecosystem, address);
    const pnl = await getPortfolioPnl(ecosystem, address);
    return NextResponse.json(pnl);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
