import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  Layers,
  LineChart,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Reveal } from "./_components/Reveal";
import { FaqAccordion } from "./_components/FaqAccordion";
import { LivePreviewChart } from "./_components/LivePreviewChart";
import { ChainMarquee } from "./_components/ChainMarquee";

export const metadata: Metadata = {
  title: "Retrace — Track your crypto portfolio",
  description: "Connect a wallet and watch balances, profit and loss, and activity update across every chain you hold.",
};

const PRIMARY_CTA_LABEL = "Get Started";

const stats = [
  { value: "6", label: "chains tracked in one view" },
  { value: "2", label: "wallet ecosystems, EVM and Solana" },
  { value: "0", label: "spreadsheets required" },
];

const steps = [
  {
    title: "Connect a wallet",
    body: "Link a wallet from any supported chain in a few seconds. The seed phrase never leaves your device.",
  },
  {
    title: "Watch balances settle",
    body: "Balances, prices, and profit and loss recalculate the moment a transaction confirms on chain.",
  },
  {
    title: "Understand the full picture",
    body: "See allocation, performance, and activity together instead of piecing it together across explorers.",
  },
];

const faqItems = [
  {
    question: "Which chains can I track",
    body: "Ethereum, Polygon, Arbitrum, Optimism, and Base on the EVM side, plus Solana. More chains are added as demand grows.",
  },
  {
    question: "Do you ever hold my funds",
    body: "No. The tracker only reads public wallet data. Nothing is custodied, and nothing is ever signed on your behalf.",
  },
  {
    question: "How is profit and loss calculated",
    body: "Every transfer, swap, and price update feeds a running cost basis, so realized and unrealized profit and loss stay current.",
  },
  {
    question: "Can I disconnect at any time",
    body: "Yes. Remove a wallet from the switcher and its data stops syncing immediately.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Retrace
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
            <a href="#capabilities" className="transition-colors hover:text-foreground">
              Capabilities
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              render={<Link href="/dashboard" prefetch={false} />}
              nativeButton={false}
              size="sm"
              className="hidden bg-emerald-700 text-white hover:bg-emerald-600 sm:inline-flex dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300"
            >
              {PRIMARY_CTA_LABEL}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* 1. Hero , asymmetric split */}
        <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:pt-16">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              One dashboard for every chain you hold.
            </h1>
            <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground">
              Connect any wallet across Ethereum, Solana, and more to see balances, profit and loss, and activity
              update live.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                render={<Link href="/dashboard" prefetch={false} />}
                nativeButton={false}
                size="lg"
                className="bg-emerald-700 text-white hover:bg-emerald-600 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300"
              >
                {PRIMARY_CTA_LABEL}
                <ArrowRight strokeWidth={1.5} className="size-4" />
              </Button>
              <Button render={<a href="#how-it-works" />} nativeButton={false} variant="outline" size="lg">
                See how it works
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:aspect-[5/4]">
            <Image
              src="https://picsum.photos/seed/tradermonitors/1200/1200"
              alt="Multiple monitors showing market charts on a trading desk"
              fill
              priority
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        {/* 2. Chain trust marquee */}
        <section aria-label="Supported chains" className="border-y border-border/70 bg-muted/20">
          <Reveal>
            <ChainMarquee />
          </Reveal>
        </section>

        {/* 3. Stat strip */}
        <section className="border-b border-border/70">
          <Reveal>
            <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1 px-6 py-12 text-center sm:text-left">
                  <span className="font-mono text-4xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* 4. Capabilities , bento grid */}
        <section id="capabilities" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="max-w-[24ch] text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything a trader checks in one place.
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-rows-2 lg:[grid-template-columns:2fr_1fr_1fr]">
            <Reveal className="lg:col-span-1 lg:row-span-2">
              <div className="relative flex h-full min-h-72 flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent p-8">
                <div>
                  <LineChart strokeWidth={1.5} className="size-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="mt-4 text-xl font-medium">Balances that update as chains do</h3>
                  <p className="mt-2 max-w-[38ch] text-sm text-muted-foreground">
                    No manual refresh. New confirmations flow straight into the totals you see.
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  {[40, 65, 50, 80, 60, 95, 72].map((height, index) => (
                    <span
                      key={index}
                      style={{ height: `${height}%` }}
                      className="w-6 rounded-t-sm bg-emerald-600/70 dark:bg-emerald-400/70"
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={80} className="lg:col-span-1 lg:row-span-1">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border/70 p-8">
                <Wallet strokeWidth={1.5} className="size-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="mt-4 text-xl font-medium">Profit and loss by asset</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Realized and unrealized results, broken down per token, not just as one total.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={140} className="lg:col-span-1 lg:row-span-1">
              <div className="relative h-full min-h-48 overflow-hidden rounded-2xl border border-border/70">
                <Image
                  src="https://picsum.photos/seed/chainnetwork/800/800"
                  alt="Abstract network of connected nodes"
                  fill
                  sizes="(min-width: 1024px) 240px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 text-lg font-medium text-white">Multi chain by default</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80} className="mt-4">
            <div className="flex flex-col items-start gap-6 rounded-2xl border border-border/70 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Bell strokeWidth={1.5} className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-xl font-medium">Alerts when a position moves</h3>
                  <p className="mt-1 max-w-[46ch] text-sm text-muted-foreground">
                    Set a threshold once and get notified when a balance or price crosses it.
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[11px]">
                In active development
              </Badge>
            </div>
          </Reveal>
        </section>

        {/* 5. How it works , vertical process list */}
        <section id="how-it-works" className="border-t border-border/70 bg-muted/20">
          <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Three moves, then it runs itself.</h2>
            </Reveal>
            <div className="mt-12 flex flex-col divide-y divide-border/70 border-t border-border/70">
              {steps.map((step, index) => (
                <Reveal key={step.title} delay={index * 80}>
                  <div
                    className="flex flex-col gap-2 py-8"
                    style={{ marginLeft: `${index * 12}px` }}
                  >
                    <h3 className="text-xl font-medium">{step.title}</h3>
                    <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Live preview , real chart component */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="rounded-2xl border border-border/70 p-6 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">A live look at the tracker</h2>
                <Badge variant="secondary" className="text-[11px]">
                  Sample data
                </Badge>
              </div>
              <p className="mt-2 max-w-[52ch] text-sm text-muted-foreground">
                This is what a portfolio looks like once every wallet is connected.
              </p>
              <div className="mt-8">
                <LivePreviewChart />
              </div>
            </div>
          </Reveal>
        </section>

        {/* 7. Security , media and text split */}
        <section className="border-t border-border/70">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2">
            <Reveal className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
              <Image
                src="https://picsum.photos/seed/walletsecurity/900/1100"
                alt="Close up of a metal padlock against a dark background"
                fill
                sizes="(min-width: 768px) 420px, 100vw"
                className="object-cover"
              />
            </Reveal>
            <Reveal delay={80} className="flex flex-col gap-5">
              <ShieldCheck strokeWidth={1.5} className="size-7 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your keys stay yours.</h2>
              <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground">
                The tracker only reads public wallet data. Nothing is custodied, and access can be revoked at any
                time.
              </p>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check strokeWidth={1.5} className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  No withdrawal permissions, ever
                </li>
                <li className="flex items-center gap-2">
                  <Check strokeWidth={1.5} className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  Read only access you can remove in one click
                </li>
              </ul>
            </Reveal>
          </div>
        </section>

        {/* 8. Testimonial , single quote block */}
        <section className="border-t border-border/70 bg-muted/20">
          <div className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6">
            <Reveal>
              <Layers strokeWidth={1.5} className="mx-auto size-6 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-6 text-2xl leading-snug font-medium text-balance sm:text-3xl">
                I finally stopped exporting spreadsheets to see if I was actually up or down.
              </p>
              <p className="mt-6 text-sm text-muted-foreground">Priya Raman, options trader</p>
            </Reveal>
          </div>
        </section>

        {/* 9. FAQ , accordion */}
        <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Common questions</h2>
          </Reveal>
          <Reveal delay={80} className="mt-8">
            <FaqAccordion items={faqItems.map((item) => ({ question: item.question, answer: item.body }))} />
          </Reveal>
        </section>

        {/* 10. Final CTA banner */}
        <section className="border-t border-border/70">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <Reveal>
              <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/70 bg-muted/30 px-8 py-16 text-center">
                <h2 className="max-w-[24ch] text-3xl font-semibold tracking-tight sm:text-4xl">
                  Ready to see your full portfolio.
                </h2>
                <Button
                  render={<Link href="/dashboard" prefetch={false} />}
                  nativeButton={false}
                  size="lg"
                  className="bg-emerald-700 text-white hover:bg-emerald-600 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300"
                >
                  {PRIMARY_CTA_LABEL}
                  <ArrowRight strokeWidth={1.5} className="size-4" />
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span className="font-medium text-foreground">Retrace</span>
          <nav className="flex items-center gap-6">
            <a href="#capabilities" className="transition-colors hover:text-foreground">
              Capabilities
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
            <Link href="/dashboard" prefetch={false} className="transition-colors hover:text-foreground">
              Open tracker
            </Link>
          </nav>
          <span>Retrace, 2026</span>
        </div>
      </footer>
    </div>
  );
}
