"use client";

import type { ReactNode } from "react";
import { useActiveWalletStore } from "@/lib/client/activeWalletStore";
import { useSyncActiveWallet } from "@/lib/client/hooks/useSyncActiveWallet";
import { WalletConnectPanel } from "./WalletConnectPanel";

export function WalletGate({ children }: { children: ReactNode }) {
  useSyncActiveWallet();
  const wallet = useActiveWalletStore((s) => s.wallet);

  if (!wallet) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Connect a wallet</h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            View your token balances, portfolio value, PnL, and transaction history across Ethereum, major L2s, and Solana.
          </p>
        </div>
        <WalletConnectPanel />
      </div>
    );
  }

  return <>{children}</>;
}
