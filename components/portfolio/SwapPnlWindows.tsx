import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SwapPnlWindow, SwapPnlWindowLabel } from "@/types/portfolio";

interface Props {
  windows: SwapPnlWindow[] | undefined;
  isLoading: boolean;
  selected: SwapPnlWindowLabel;
  onSelect: (label: SwapPnlWindowLabel) => void;
}

export function SwapPnlWindows({ windows, isLoading, selected, onSelect }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-medium">Realized PnL by period</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !windows ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted h-16 w-full animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {windows.map((w) => {
              const active = w.label === selected;
              return (
                <button
                  key={w.label}
                  type="button"
                  onClick={() => onSelect(w.label)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    active ? "border-primary ring-primary/50 ring-1" : "border-border hover:bg-muted/50"
                  )}
                >
                  <p className="text-muted-foreground text-xs">{w.label}</p>
                  <p
                    className={cn(
                      "text-lg font-semibold tracking-tight",
                      w.realizedPnlUsd >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {w.realizedPnlUsd >= 0 ? "+" : ""}
                    {formatUsd(w.realizedPnlUsd)}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {w.swapCount} swap{w.swapCount === 1 ? "" : "s"}
                    {w.unknownCostBasisCount > 0 ? ` · ${w.unknownCostBasisCount} unknown` : ""}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
