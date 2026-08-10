# Crypto Portfolio & PnL Dashboard

Connect an Ethereum/L2 or Solana wallet and see token balances, portfolio value, PnL, transaction history, token allocation, wallet activity, price charts, and portfolio value over time.

**Stack:** Next.js (App Router) + TypeScript + Tailwind + PostgreSQL + Prisma + wagmi/RainbowKit + Solana wallet-adapter + Alchemy + CoinGecko.

## Setup

1. **Database** — a local Postgres 16 is already running via Homebrew (`brew services start postgresql@16`) with a `crypto_dashboard` database. To use a hosted instance instead (Neon, Supabase), just swap `DATABASE_URL` in `.env.local`.
2. **API keys** — copy real values into `.env.local` (see `.env.example` for the full list):
   - `ALCHEMY_API_KEY` / `NEXT_PUBLIC_ALCHEMY_API_KEY` — [alchemy.com](https://alchemy.com), needed for real token balances and transaction history.
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — [cloud.walletconnect.com](https://cloud.walletconnect.com), needed for the WalletConnect QR connector (MetaMask/Coinbase Wallet browser extensions work without it).
   - `COINGECKO_API_KEY` is optional — CoinGecko's public tier works without a key at low volume.
3. Install deps and run migrations (already done for this scaffold):
   ```bash
   npm install
   npx prisma migrate dev
   npx prisma db seed
   ```
4. `npm run dev` and open http://localhost:3000.

## What's real vs. simulated

| Feature | Source |
|---|---|
| Token balances | **Real** — Alchemy |
| Portfolio value (current) | **Real** — live balances × CoinGecko price |
| Transaction history | **Real** — Alchemy transfers (EVM) / signatures (Solana) |
| Token allocation | **Real** — derived from current balances |
| Wallet activity feed | **Real** — same transaction data, feed-styled |
| Price charts (per token) | **Real** — CoinGecko market history |
| PnL (realized/unrealized) | **Simulated** — seeded mock history until a cost-basis engine exists |
| Portfolio value over time | **Simulated** — seeded mock history; the most recent point is pinned to the real current value |

Simulated data is labeled with a "Simulated" badge in the UI. `Transaction.amountUsdAtTx` is already captured for every real transaction so a future cost-basis/PnL engine can compute realized/unrealized PnL without re-ingesting history.

## Architecture notes

- **No login in v1** — connecting a wallet (EVM via RainbowKit/wagmi, Solana via wallet-adapter) is enough to use the dashboard. A `User` model exists in the Prisma schema for a future SIWE/SIWS auth layer, but nothing wires it up yet.
- **Data flow** — dashboard pages are Client Components that read the active wallet from a small Zustand store and fetch through `/api/wallets/[ecosystem]/[address]/...` route handlers (React Query), since there's no server-side session to key off of. Route handlers call orchestrators in `lib/server/portfolio/*`, which hit Alchemy/CoinGecko and persist to Postgres via Prisma.
- **Solana transaction parsing** is best-effort in this pass: it reads the wallet's native SOL lamport delta per transaction (real signature, timestamp, fee) but doesn't yet break out SPL token transfers. EVM transaction parsing is complete via Alchemy's asset-transfers API.
- **Cron endpoints** — `/api/cron/refresh-prices` and `/api/cron/snapshot` are protected by a `CRON_SECRET` bearer token and meant to be triggered by an external scheduler (Vercel Cron, etc.). The snapshot writer records real portfolio value but leaves PnL fields at 0 pending the cost-basis engine — see the comment in `app/api/cron/snapshot/route.ts`.

## Local Postgres

```bash
brew services start postgresql@16   # start
brew services stop postgresql@16    # stop
psql crypto_dashboard               # connect
```

A `docker-compose.yml` is also included if you'd rather run Postgres in a container.
