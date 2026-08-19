import type { ReactElement, SVGProps } from "react";
import { CHAIN_LABELS, type ChainName } from "@/lib/constants";

type ReactSvg = (props: SVGProps<SVGSVGElement>) => ReactElement;

const DISPLAYED_CHAINS: ChainName[] = ["ETHEREUM", "SOLANA"];

// Minimal, abstract geometric marks. Not traced from official brand logos.
const CHAIN_GLYPH: Partial<Record<ChainName, ReactSvg>> = {
  ETHEREUM: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 2 L19 12 L12 16 L5 12 Z" />
      <path d="M12 16 L19 13 L12 22 L5 13 Z" />
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

export function ChainMarquee() {
  return (
    <div className="flex items-center justify-center gap-16 py-6" role="list" aria-label="Supported chains">
      {DISPLAYED_CHAINS.map((chain) => {
        const Glyph = CHAIN_GLYPH[chain]!;
        return (
          <span key={chain} className="flex items-center gap-3" role="listitem">
            <Glyph className="size-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-lg font-medium tracking-tight text-foreground">{CHAIN_LABELS[chain]}</span>
          </span>
        );
      })}
    </div>
  );
}
