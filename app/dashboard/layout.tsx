import type { ReactNode } from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { WalletSwitcher } from "@/components/wallet/WalletSwitcher";
import { WalletGate } from "@/components/wallet/WalletGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Providers } from "../providers";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col">
        <header className="border-border sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
              Retrace
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <WalletSwitcher />
          </div>
        </header>
        <main className="flex flex-1 flex-col">
          <WalletGate>{children}</WalletGate>
        </main>
      </div>
    </Providers>
  );
}
