"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CHAIN_LABELS } from "@/lib/constants";
import { formatPercent, formatTokenAmount, formatUsd } from "@/lib/format";
import type { TokenBalanceView } from "@/types/portfolio";

interface Props {
  balances: TokenBalanceView[];
  onSelectToken?: (token: TokenBalanceView) => void;
}

export function TokenBalanceTable({ balances, onSelectToken }: Props) {
  if (balances.length === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">No token balances found for this wallet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">24h</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {balances.map((b) => (
          <TableRow
            key={b.token.id}
            className={onSelectToken ? "cursor-pointer" : undefined}
            onClick={() => onSelectToken?.(b)}
          >
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{b.token.symbol}</span>
                <span className="text-muted-foreground text-xs">{b.token.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">{CHAIN_LABELS[b.token.chain]}</TableCell>
            <TableCell className="text-right tabular-nums">{formatTokenAmount(b.balance)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatUsd(b.usdPrice)}</TableCell>
            <TableCell
              className={`text-right tabular-nums ${
                b.priceChange24h == null ? "text-muted-foreground" : b.priceChange24h >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {b.priceChange24h == null ? "—" : formatPercent(b.priceChange24h)}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">{formatUsd(b.usdValue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
