import { useEffect } from "react";
import { useConnectedWallets } from "./useConnectedWallets";
import { useActiveWalletStore } from "@/lib/client/activeWalletStore";

/**
 * Keeps the active-wallet store honest against real connection state: picks a
 * connected wallet when none is active yet, and clears/reassigns it if the
 * active wallet disconnects. Mount once, near the app root.
 */
export function useSyncActiveWallet() {
  const connected = useConnectedWallets();
  const wallet = useActiveWalletStore((s) => s.wallet);
  const setWallet = useActiveWalletStore((s) => s.setWallet);

  useEffect(() => {
    const stillConnected = wallet && connected.some((w) => w.ecosystem === wallet.ecosystem && w.address === wallet.address);

    if (!stillConnected) {
      setWallet(connected[0] ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected.map((w) => `${w.ecosystem}:${w.address}`).join(","), wallet]);
}
