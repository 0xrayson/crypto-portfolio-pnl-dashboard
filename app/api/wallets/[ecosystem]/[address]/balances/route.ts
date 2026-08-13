import { NextRequest, NextResponse } from "next/server";
import { getBalances } from "@/lib/server/portfolio/getBalances";
import { parseEcosystem } from "@/lib/server/api/ecosystem";

// Fans out across 5 EVM chains + CoinGecko; a cold serverless instance can
// exceed Vercel's default execution limit before finishing.
export const maxDuration = 60;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ecosystem: string; address: string }> }) {
  const { ecosystem: rawEcosystem, address } = await params;
  const ecosystem = parseEcosystem(rawEcosystem);
  if (!ecosystem) {
    return NextResponse.json({ error: "Invalid ecosystem" }, { status: 400 });
  }

  try {
    const balances = await getBalances(ecosystem, address);
    return NextResponse.json({ balances });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
