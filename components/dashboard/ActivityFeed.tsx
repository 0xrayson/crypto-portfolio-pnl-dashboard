import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CHAIN_LABELS } from "@/lib/constants";
import { formatRelativeTime, formatTokenAmount, truncateAddress } from "@/lib/format";
import type { TransactionView } from "@/types/portfolio";

function describe(tx: TransactionView): string {
  const symbol = tx.token?.symbol ?? "tokens";
  const amount = formatTokenAmount(tx.amount);
  if (tx.type === "SWAP") {
    return tx.direction === "IN" ? `Swapped into ${amount} ${symbol}` : `Swapped out ${amount} ${symbol}`;
  }
  if (tx.direction === "IN") return `Received ${amount} ${symbol}`;
  if (tx.direction === "OUT") return `Sent ${amount} ${symbol}`;
  return `Moved ${amount} ${symbol}`;
}

export function ActivityFeed({ transactions }: { transactions: TransactionView[] }) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">No wallet activity yet.</p>;
  }

  return (
    <ul className="divide-border divide-y">
      {transactions.map((tx) => (
        <li key={tx.id} className="flex items-center gap-3 py-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{tx.token?.symbol?.slice(0, 3) ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{describe(tx)}</p>
            <p className="text-muted-foreground text-xs">
              {CHAIN_LABELS[tx.chain]}
              {tx.counterpartyAddress ? ` · ${truncateAddress(tx.counterpartyAddress)}` : ""}
            </p>
          </div>
          <span className="text-muted-foreground shrink-0 text-xs">{formatRelativeTime(new Date(tx.blockTimestamp))}</span>
        </li>
      ))}
    </ul>
  );
}
