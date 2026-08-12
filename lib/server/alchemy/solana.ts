import { Connection, LAMPORTS_PER_SOL, PublicKey, type TokenBalance } from "@solana/web3.js";
import { getSolanaRpcUrl } from "./client";
import { NATIVE_TOKEN_ADDRESS } from "@/lib/constants";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

let connection: Connection | null = null;
function getConnection(): Connection {
  if (!connection) connection = new Connection(getSolanaRpcUrl(), "confirmed");
  return connection;
}

export interface RawSolanaBalance {
  mint: string;
  isNative: boolean;
  rawBalance: string;
  decimals: number;
}

/** Native SOL balance + all non-zero SPL token balances for an address. */
export async function getSolanaTokenBalances(address: string): Promise<RawSolanaBalance[]> {
  const conn = getConnection();
  const owner = new PublicKey(address);

  const [lamports, tokenAccounts] = await Promise.all([
    conn.getBalance(owner),
    conn.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }),
  ]);

  const splBalances: RawSolanaBalance[] = tokenAccounts.value
    .map((account) => {
      const info = account.account.data.parsed.info;
      const amount = info.tokenAmount;
      return {
        mint: info.mint as string,
        isNative: false,
        rawBalance: amount.amount as string,
        decimals: amount.decimals as number,
      };
    })
    .filter((b) => BigInt(b.rawBalance) > 0n);

  const native: RawSolanaBalance = {
    mint: NATIVE_TOKEN_ADDRESS,
    isNative: true,
    rawBalance: lamports.toString(),
    decimals: 9,
  };

  return [native, ...splBalances];
}

export interface RawSolanaTransaction {
  signature: string;
  blockTime: number | null;
  fee: number;
  slot: number;
}

/** Most recent confirmed signatures for an address, paginated by `before`. */
export async function getSolanaSignatures(
  address: string,
  opts: { before?: string; limit?: number } = {}
): Promise<RawSolanaTransaction[]> {
  const conn = getConnection();
  const owner = new PublicKey(address);

  const signatures = await conn.getSignaturesForAddress(owner, {
    before: opts.before,
    limit: opts.limit ?? 25,
  });

  return signatures.map((s) => ({
    signature: s.signature,
    blockTime: s.blockTime ?? null,
    fee: 0,
    slot: s.slot,
  }));
}

export async function getSolanaParsedTransaction(signature: string) {
  const conn = getConnection();
  return conn.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
}

export function lamportsToSol(lamports: string | number): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

export interface SplBalanceDelta {
  mint: string;
  decimals: number;
  rawDelta: bigint;
}

/**
 * Diffs a parsed transaction's pre/post SPL token balances for one owner,
 * returning only the mints whose balance actually changed. This is how a
 * Solana swap shows up (the wallet's SOL balance alone doesn't capture it).
 */
export function diffTokenBalances(
  pre: TokenBalance[] | null | undefined,
  post: TokenBalance[] | null | undefined,
  owner: string
): SplBalanceDelta[] {
  const preByMint = new Map((pre ?? []).filter((b) => b.owner === owner).map((b) => [b.mint, b]));
  const postByMint = new Map((post ?? []).filter((b) => b.owner === owner).map((b) => [b.mint, b]));
  const mints = new Set([...preByMint.keys(), ...postByMint.keys()]);

  const deltas: SplBalanceDelta[] = [];
  for (const mint of mints) {
    const preEntry = preByMint.get(mint);
    const postEntry = postByMint.get(mint);
    const preAmt = BigInt(preEntry?.uiTokenAmount.amount ?? "0");
    const postAmt = BigInt(postEntry?.uiTokenAmount.amount ?? "0");
    const decimals = postEntry?.uiTokenAmount.decimals ?? preEntry?.uiTokenAmount.decimals ?? 0;
    const rawDelta = postAmt - preAmt;
    if (rawDelta !== 0n) deltas.push({ mint, decimals, rawDelta });
  }
  return deltas;
}
