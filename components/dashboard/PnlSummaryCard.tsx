import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  source: "SEEDED_MOCK" | "COMPUTED";
  isLoading: boolean;
}

function PnlValue({ value }: { value: number }) {
  return (
    <p className={cn("text-xl font-semibold tracking-tight", value >= 0 ? "text-emerald-500" : "text-red-500")}>
      {value >= 0 ? "+" : ""}
      {formatUsd(value)}
    </p>
  );
}

export function PnlSummaryCard({ realizedPnlUsd, unrealizedPnlUsd, source, isLoading }: Props) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-muted-foreground text-sm font-medium">Profit & loss</CardTitle>
        {source === "SEEDED_MOCK" && (
          <Badge variant="secondary" className="text-[10px]">
            Simulated
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="bg-muted h-9 w-40 animate-pulse rounded" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs">Realized</p>
              <PnlValue value={realizedPnlUsd} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Unrealized</p>
              <PnlValue value={unrealizedPnlUsd} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
