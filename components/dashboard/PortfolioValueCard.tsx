import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsd } from "@/lib/format";

export function PortfolioValueCard({ value, isLoading }: { value: number; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-medium">Portfolio value</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="bg-muted h-9 w-32 animate-pulse rounded" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight">{formatUsd(value)}</p>
        )}
      </CardContent>
    </Card>
  );
}
