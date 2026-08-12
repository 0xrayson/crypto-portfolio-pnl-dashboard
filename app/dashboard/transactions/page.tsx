"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveWalletStore } from "@/lib/client/activeWalletStore";
import { useTransactions } from "@/lib/client/hooks/useTransactions";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QueryError } from "@/components/dashboard/QueryError";

export default function TransactionsPage() {
  const wallet = useActiveWalletStore((s) => s.wallet);
  const { data: transactions, isLoading, error } = useTransactions(wallet);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-500">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <QueryError message={`Couldn't load transactions: ${(error as Error).message}`} />
          ) : isLoading ? (
            <div className="bg-muted h-96 w-full animate-pulse rounded" />
          ) : (
            <Tabs defaultValue="table" className="motion-safe:animate-in motion-safe:fade-in duration-300">
              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="feed">Feed</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                <TransactionTable transactions={transactions ?? []} />
              </TabsContent>
              <TabsContent value="feed">
                <ActivityFeed transactions={transactions ?? []} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
