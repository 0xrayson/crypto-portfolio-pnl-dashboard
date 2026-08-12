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
  //
  // alchemy-sdk (built on ethers.js) is excluded for a different reason:
  // Next's bundled/patched fetch interferes with ethers' internal request
  // handling and causes intermittent "missing response" errors from Alchemy
  // calls. Marking it external makes it use Node's native fetch untouched.
  serverExternalPackages: ["@coinbase/cdp-sdk", "alchemy-sdk"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
