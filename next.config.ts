import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project so Turbopack doesn't walk up to
  // an unrelated package-lock.json sitting in the parent home directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // RainbowKit's Coinbase Wallet connector pulls in @coinbase/cdp-sdk, which
  // ships optional x402 payment-scheme imports that aren't installed and
  // aren't needed for wallet connection. Excluding it from server bundling
  // avoids Next trying (and failing) to statically resolve those imports.
  serverExternalPackages: ["@coinbase/cdp-sdk"],
};

export default nextConfig;
