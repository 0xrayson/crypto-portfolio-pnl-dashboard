"use client";

import { useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useActiveWalletStore } from "@/lib/client/activeWalletStore";
import { useConnectedWallets } from "@/lib/client/hooks/useConnectedWallets";
import { truncateAddress } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function WalletSwitcher() {
  const connected = useConnectedWallets();
  const wallet = useActiveWalletStore((s) => s.wallet);
  const setWallet = useActiveWalletStore((s) => s.setWallet);
  const { disconnect: disconnectEvm } = useDisconnect();
  const { disconnect: disconnectSolana } = useWallet();

  if (!wallet) return null;

  const label = wallet.ecosystem === "EVM" ? "Ethereum & L2s" : "Solana";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <span className="inline-block size-2 rounded-full bg-emerald-500" />
        {truncateAddress(wallet.address)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
            {label}
          </DropdownMenuLabel>
          {connected.map((w) => (
            <DropdownMenuItem key={`${w.ecosystem}:${w.address}`} onClick={() => setWallet(w)}>
              <span className="flex-1 truncate font-mono text-xs">{truncateAddress(w.address, 6)}</span>
              {w.ecosystem === wallet.ecosystem && w.address === wallet.address ? (
                <span className="text-xs text-emerald-500">Active</span>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            disconnectEvm();
            disconnectSolana();
            setWallet(null);
          }}
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
