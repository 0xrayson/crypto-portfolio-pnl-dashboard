import { NextRequest, NextResponse } from "next/server";
import { listTransactions, refreshTransactions } from "@/lib/server/portfolio/getTransactions";
import { parseEcosystem } from "@/lib/server/api/ecosystem";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ecosystem: string; address: string }> }) {
  const { ecosystem: rawEcosystem, address } = await params;
  const ecosystem = parseEcosystem(rawEcosystem);
  if (!ecosystem) {
    return NextResponse.json({ error: "Invalid ecosystem" }, { status: 400 });
  }

  try {
    await refreshTransactions(ecosystem, address);
    const transactions = await listTransactions(ecosystem, address);
    return NextResponse.json({ transactions });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
