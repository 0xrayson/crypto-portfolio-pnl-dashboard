import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateMockSnapshotSeries } from "../lib/server/mock/seedSnapshots";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_WALLET = { ecosystem: "EVM" as const, address: "0x0000000000000000000000000000000000dEaD" };

const DEMO_TOKENS = [
  { chain: "ETHEREUM" as const, address: "native", symbol: "ETH", name: "Ethereum", decimals: 18, isNative: true, coingeckoId: "ethereum" },
  { chain: "ETHEREUM" as const, address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", name: "USD Coin", decimals: 6, isNative: false, coingeckoId: "usd-coin" },
  { chain: "ETHEREUM" as const, address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", symbol: "WBTC", name: "Wrapped Bitcoin", decimals: 8, isNative: false, coingeckoId: "wrapped-bitcoin" },
];

async function main() {
  console.log("Seeding demo wallet, tokens, and mock portfolio history…");

  const wallet = await prisma.wallet.upsert({
    where: { ecosystem_address: DEMO_WALLET },
    update: {},
    create: DEMO_WALLET,
  });

  for (const t of DEMO_TOKENS) {
    await prisma.token.upsert({
      where: { chain_address: { chain: t.chain, address: t.address } },
      update: {},
      create: t,
    });
  }

  const existing = await prisma.portfolioSnapshot.count({ where: { walletId: wallet.id } });
  if (existing > 0) {
    console.log(`Wallet already has ${existing} snapshots, skipping snapshot seed.`);
  } else {
    const series = generateMockSnapshotSeries({ days: 90, startingValue: 8_000, endingValue: 14_250 });
    await prisma.portfolioSnapshot.createMany({
      data: series.map((p) => ({
        walletId: wallet.id,
        capturedAt: p.capturedAt,
        totalUsdValue: p.totalUsdValue,
        realizedPnlUsd: p.realizedPnlUsd,
        unrealizedPnlUsd: p.unrealizedPnlUsd,
        source: "SEEDED_MOCK",
      })),
    });
    console.log(`Created ${series.length} mock portfolio snapshots.`);
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
