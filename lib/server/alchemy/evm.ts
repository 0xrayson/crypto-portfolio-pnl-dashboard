import { AssetTransfersCategory, type SortingOrder } from "alchemy-sdk";
import { getAlchemyClient } from "./client";
import type { EvmChain } from "@/lib/constants";
import { NATIVE_TOKEN_ADDRESS } from "@/lib/constants";

export interface RawEvmTokenBalance {
  contractAddress: string;
  isNative: boolean;
  rawBalance: string;
  decimals: number | null;
  symbol: string | null;
  name: string | null;
  logo: string | null;
}

/** Native balance + all non-zero ERC-20 balances for an address on one chain. */
export async function getEvmTokenBalances(chain: EvmChain, address: string): Promise<RawEvmTokenBalance[]> {
  const alchemy = getAlchemyClient(chain);

  const [nativeWei, erc20Response] = await Promise.all([
    alchemy.core.getBalance(address),
    alchemy.core.getTokenBalances(address),
  ]);

  const nonZeroErc20 = erc20Response.tokenBalances.filter(
    (t) => t.tokenBalance && t.tokenBalance !== "0x0" && BigInt(t.tokenBalance) > 0n
  );

  const metadata = await Promise.all(
    nonZeroErc20.map((t) => alchemy.core.getTokenMetadata(t.contractAddress))
  );

  const erc20Balances: RawEvmTokenBalance[] = nonZeroErc20.map((t, i) => ({
    contractAddress: t.contractAddress,
    isNative: false,
    rawBalance: t.tokenBalance ?? "0",
    decimals: metadata[i].decimals,
    symbol: metadata[i].symbol,
    name: metadata[i].name,
    logo: metadata[i].logo,
  }));

  const native: RawEvmTokenBalance = {
    contractAddress: NATIVE_TOKEN_ADDRESS,
    isNative: true,
    rawBalance: nativeWei.toString(),
    decimals: 18,
    symbol: nativeSymbolFor(chain),
    name: nativeNameFor(chain),
    logo: null,
  };

  return [native, ...erc20Balances];
}

export interface RawEvmTokenMetadata {
  decimals: number | null;
  symbol: string | null;
  name: string | null;
  logo: string | null;
}

/**
 * Reads a token's symbol/name/decimals directly from Alchemy's on-chain
 * indexing. Unlike a transfer's `asset` field (often null) or a CoinGecko
 * lookup (fails for tokens too new/obscure to be listed), this works for any
 * contract that implements the standard metadata calls — including
 * brand-new memecoins with no CoinGecko listing yet.
 */
export async function getEvmTokenMetadata(chain: EvmChain, contractAddress: string): Promise<RawEvmTokenMetadata> {
  const alchemy = getAlchemyClient(chain);
  const metadata = await alchemy.core.getTokenMetadata(contractAddress);
  return { decimals: metadata.decimals, symbol: metadata.symbol, name: metadata.name, logo: metadata.logo };
}

export interface RawEvmTransfer {
  hash: string;
  uniqueId: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  rawContract: { address: string | null; decimal: string | null };
  category: string;
  blockNum: string;
  metadata: { blockTimestamp?: string };
}

/** Combined in + out transfers for an address, most recent first, paginated. */
export async function getEvmAssetTransfers(
  chain: EvmChain,
  address: string,
  opts: { pageKey?: string; maxCount?: number } = {}
): Promise<{ transfers: RawEvmTransfer[]; pageKey?: string }> {
  const alchemy = getAlchemyClient(chain);

  const shared = {
    category: [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.ERC721,
      AssetTransfersCategory.ERC1155,
    ],
    withMetadata: true,
    order: "desc" as SortingOrder,
    maxCount: opts.maxCount ?? 25,
    pageKey: opts.pageKey,
  };

  const [outgoing, incoming] = await Promise.all([
    alchemy.core.getAssetTransfers({ ...shared, fromAddress: address }),
    alchemy.core.getAssetTransfers({ ...shared, toAddress: address }),
  ]);

  const merged = [...outgoing.transfers, ...incoming.transfers]
    .sort((a, b) => Number(b.blockNum) - Number(a.blockNum))
    .slice(0, opts.maxCount ?? 25) as unknown as RawEvmTransfer[];

  return { transfers: merged, pageKey: outgoing.pageKey ?? incoming.pageKey };
}

function nativeSymbolFor(chain: EvmChain): string {
  return chain === "POLYGON" ? "MATIC" : "ETH";
}

function nativeNameFor(chain: EvmChain): string {
  return chain === "POLYGON" ? "Polygon" : "Ethereum";
}
