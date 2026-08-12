import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CHAIN_LABELS } from "@/lib/constants";
import { formatTokenAmount, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SwapView } from "@/types/portfolio";

export function SwapTable({ swaps }: { swaps: SwapView[] }) {
  if (swaps.length === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">No swaps found for this wallet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead>Sold</TableHead>
          <TableHead>Bought</TableHead>
          <TableHead className="text-right">Proceeds</TableHead>
          <TableHead className="text-right">Cost basis</TableHead>
          <TableHead className="text-right">Realized PnL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {swaps.map((swap) => (
          <TableRow key={`${swap.txHash}:${swap.soldToken?.id ?? "unknown"}`}>
            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
              {new Date(swap.blockTimestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">{CHAIN_LABELS[swap.chain]}</TableCell>
            <TableCell className="tabular-nums">
              {formatTokenAmount(swap.soldAmount)} {swap.soldToken?.symbol ?? "?"}
            </TableCell>
            <TableCell className="tabular-nums">
              {formatTokenAmount(swap.boughtAmount)} {swap.boughtToken?.symbol ?? "?"}
            </TableCell>
            <TableCell className="text-right tabular-nums">{swap.proceedsUsd != null ? formatUsd(swap.proceedsUsd) : "—"}</TableCell>
            <TableCell className="text-right tabular-nums">{swap.costBasisUsd != null ? formatUsd(swap.costBasisUsd) : "—"}</TableCell>
            <TableCell className="text-right">
              {swap.costBasisUnknown ? (
                <Badge variant="secondary" className="text-[10px]">
                  Unknown
                </Badge>
              ) : (
                <span
                  className={cn(
                    "tabular-nums font-medium",
                    (swap.realizedPnlUsd ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {(swap.realizedPnlUsd ?? 0) >= 0 ? "+" : ""}
                  {formatUsd(swap.realizedPnlUsd ?? 0)}
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
