import { NextRequest, NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/server/portfolio/getPriceHistory";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");

  try {
    const points = await getPriceHistory(tokenId, days);
    return NextResponse.json({ points });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
