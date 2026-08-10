import { create } from "zustand";
import type { ActiveWallet } from "@/types/wallet";

interface ActiveWalletState {
  wallet: ActiveWallet | null;
  setWallet: (wallet: ActiveWallet | null) => void;
}

export const useActiveWalletStore = create<ActiveWalletState>((set) => ({
  wallet: null,
  setWallet: (wallet) => set({ wallet }),
}));
