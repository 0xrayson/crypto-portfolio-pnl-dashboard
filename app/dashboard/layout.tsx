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
        <header className="border-border sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-6">
              <Link href="/dashboard" className="shrink-0 text-sm font-semibold tracking-tight">
                Retrace
              </Link>
              <DashboardNav className="hidden sm:flex" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <WalletSwitcher />
            </div>
          </div>
          <div className="border-border/70 border-t px-4 py-1.5 sm:hidden">
            <DashboardNav />
          </div>
        </header>
        <main className="flex flex-1 flex-col">
          <WalletGate>{children}</WalletGate>
        </main>
      </div>
    </Providers>
  );
}
