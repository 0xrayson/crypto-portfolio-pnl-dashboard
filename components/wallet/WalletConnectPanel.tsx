"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn } from "@/lib/utils";

type Ecosystem = "EVM" | "SOLANA";

const TABS: { id: Ecosystem; label: string }[] = [
  { id: "EVM", label: "Ethereum & L2s" },
  { id: "SOLANA", label: "Solana" },
];

export function WalletConnectPanel() {
  const [tab, setTab] = useState<Ecosystem>("EVM");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="inline-flex rounded-lg border border-border bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-10">{tab === "EVM" ? <ConnectButton /> : <WalletMultiButton />}</div>
    </div>
  );
}
