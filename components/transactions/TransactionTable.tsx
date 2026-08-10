import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CHAIN_LABELS } from "@/lib/constants";
import { formatTokenAmount, formatUsd, truncateAddress } from "@/lib/format";
import type { TransactionView } from "@/types/portfolio";

const DIRECTION_STYLE: Record<TransactionView["direction"], string> = {
  IN: "text-emerald-500",
  OUT: "text-red-500",
  SELF: "text-muted-foreground",
};

export function TransactionTable({ transactions }: { transactions: TransactionView[] }) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">No transactions found for this wallet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead>Counterparty</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
              {new Date(tx.blockTimestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={DIRECTION_STYLE[tx.direction]}>
                {tx.direction === "IN" ? "Received" : tx.direction === "OUT" ? "Sent" : "Self"}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">{CHAIN_LABELS[tx.chain]}</TableCell>
            <TableCell className="font-mono text-xs">{tx.counterpartyAddress ? truncateAddress(tx.counterpartyAddress) : "—"}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatTokenAmount(tx.amount)} {tx.token?.symbol ?? ""}
            </TableCell>
            <TableCell className="text-right tabular-nums">{tx.amountUsdAtTx != null ? formatUsd(tx.amountUsdAtTx) : "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
