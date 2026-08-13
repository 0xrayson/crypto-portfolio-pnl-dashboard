import { useEffect, useState } from "react";

/**
 * True only after the first client-side render. next-themes doesn't know the
 * resolved theme until after hydration, so theme-dependent UI (icon choice,
 * RainbowKit's theme prop) needs to wait for this to avoid a hydration
 * mismatch / flash of the wrong theme. There's no pure alternative — "are we
 * past hydration" is inherently effect-only information, not derived state.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration-mount flag
  useEffect(() => setMounted(true), []);
  return mounted;
}
