import type { ReactElement, SVGProps } from "react";
import { ALL_CHAINS, CHAIN_LABELS, type ChainName } from "@/lib/constants";

type ReactSvg = (props: SVGProps<SVGSVGElement>) => ReactElement;

// Minimal, abstract geometric marks. Not traced from official brand logos.
const CHAIN_GLYPH: Record<ChainName, ReactSvg> = {
  ETHEREUM: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 2 L19 12 L12 16 L5 12 Z" />
      <path d="M12 16 L19 13 L12 22 L5 13 Z" />
    </svg>
  ),
  POLYGON: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 2 L20 7 V17 L12 22 L4 17 V7 Z" />
    </svg>
  ),
  ARBITRUM: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 15 L12 8 L15 15" />
    </svg>
  ),
  OPTIMISM: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  ),
  BASE: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="8" />
    </svg>
  ),
  SOLANA: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M4 7 L20 7" />
      <path d="M4 12 L20 12" />
      <path d="M4 17 L20 17" />
    </svg>
  ),
};

function MarqueeRow() {
  return (
    <>
      {ALL_CHAINS.map((chain) => {
        const Glyph = CHAIN_GLYPH[chain];
        return (
          <span key={chain} className="flex shrink-0 items-center gap-3 pr-16">
            <Glyph className="size-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-lg font-medium tracking-tight text-foreground">{CHAIN_LABELS[chain]}</span>
          </span>
        );
      })}
    </>
  );
}

export function ChainMarquee() {
  return (
    <div className="relative overflow-hidden py-2" role="list" aria-label="Supported chains">
      <div className="animate-track-marquee flex w-max items-center">
        <MarqueeRow />
        <MarqueeRow />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
