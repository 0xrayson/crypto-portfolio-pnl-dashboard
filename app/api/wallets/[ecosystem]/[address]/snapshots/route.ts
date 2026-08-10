import { NextRequest, NextResponse } from "next/server";
import { getSnapshots } from "@/lib/server/portfolio/getSnapshots";
import { parseEcosystem } from "@/lib/server/api/ecosystem";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ecosystem: string; address: string }> }) {
  const { ecosystem: rawEcosystem, address } = await params;
  const ecosystem = parseEcosystem(rawEcosystem);
  if (!ecosystem) {
    return NextResponse.json({ error: "Invalid ecosystem" }, { status: 400 });
  }

  try {
    const snapshots = await getSnapshots(ecosystem, address);
    return NextResponse.json({ snapshots });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
