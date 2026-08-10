import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { getCurrentPrices } from "@/lib/server/coingecko/prices";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Refreshes the short-TTL TokenPrice cache for every token with a known CoinGecko id. */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokens = await prisma.token.findMany({ where: { coingeckoId: { not: null } } });
  const prices = await getCurrentPrices(tokens.map((t) => t.coingeckoId as string));
  const priceById = new Map(prices.map((p) => [p.coingeckoId, p]));

  let updated = 0;
  for (const token of tokens) {
    const price = token.coingeckoId ? priceById.get(token.coingeckoId) : undefined;
    if (!price) continue;

    await prisma.tokenPrice.upsert({
      where: { tokenId: token.id },
      update: { price: price.usd, asOf: new Date() },
      create: { tokenId: token.id, price: price.usd, asOf: new Date() },
    });
    updated++;
  }

  return NextResponse.json({ tokensChecked: tokens.length, updated });
}
