import { NextRequest, NextResponse } from "next/server";
import { refreshTransactions } from "@/lib/server/portfolio/getTransactions";
import { getValueHistory } from "@/lib/server/portfolio/getValueHistory";
import { parseEcosystem } from "@/lib/server/api/ecosystem";

const ALLOWED_DAYS = new Set([7, 30, 90]);

export async function GET(req: NextRequest, { params }: { params: Promise<{ ecosystem: string; address: string }> }) {
  const { ecosystem: rawEcosystem, address } = await params;
  const ecosystem = parseEcosystem(rawEcosystem);
  if (!ecosystem) {
    return NextResponse.json({ error: "Invalid ecosystem" }, { status: 400 });
  }

  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  if (!ALLOWED_DAYS.has(days)) {
    return NextResponse.json({ error: "days must be one of 7, 30, 90" }, { status: 400 });
  }

  try {
    await refreshTransactions(ecosystem, address);
    const points = await getValueHistory(ecosystem, address, days);
    return NextResponse.json({ points });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
