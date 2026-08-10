import { prisma } from "@/lib/server/db/prisma";
import type { Ecosystem } from "@/types/wallet";

export async function getOrCreateWallet(ecosystem: Ecosystem, address: string) {
  return prisma.wallet.upsert({
    where: { ecosystem_address: { ecosystem, address } },
    update: {},
    create: { ecosystem, address },
  });
}
