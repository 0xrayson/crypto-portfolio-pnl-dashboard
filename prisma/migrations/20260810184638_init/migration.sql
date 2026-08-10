-- CreateEnum
CREATE TYPE "Ecosystem" AS ENUM ('EVM', 'SOLANA');

-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('ETHEREUM', 'POLYGON', 'ARBITRUM', 'OPTIMISM', 'BASE', 'SOLANA');

-- CreateEnum
CREATE TYPE "TxDirection" AS ENUM ('IN', 'OUT', 'SELF');

-- CreateEnum
CREATE TYPE "TxType" AS ENUM ('TRANSFER', 'SWAP', 'MINT', 'BURN', 'APPROVAL', 'CONTRACT_CALL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SnapshotSource" AS ENUM ('SEEDED_MOCK', 'COMPUTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ecosystem" "Ecosystem" NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "address" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "logoUrl" TEXT,
    "coingeckoId" TEXT,
    "isNative" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenBalance" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "balance" DECIMAL(38,18) NOT NULL,
    "usdValue" DECIMAL(38,18) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "totalUsdValue" DECIMAL(38,18) NOT NULL,
    "realizedPnlUsd" DECIMAL(38,18) NOT NULL,
    "unrealizedPnlUsd" DECIMAL(38,18) NOT NULL,
    "source" "SnapshotSource" NOT NULL DEFAULT 'SEEDED_MOCK',

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenBalanceSnapshot" (
    "id" TEXT NOT NULL,
    "portfolioSnapshotId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "quantity" DECIMAL(38,18) NOT NULL,
    "usdValue" DECIMAL(38,18) NOT NULL,

    CONSTRAINT "TokenBalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER,
    "blockTimestamp" TIMESTAMP(3) NOT NULL,
    "direction" "TxDirection" NOT NULL,
    "type" "TxType" NOT NULL,
    "tokenId" TEXT,
    "amount" DECIMAL(38,18) NOT NULL,
    "amountUsdAtTx" DECIMAL(38,18),
    "feeAmount" DECIMAL(38,18),
    "feeUsdAtTx" DECIMAL(38,18),
    "counterpartyAddress" TEXT,
    "rawMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenPrice" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "price" DECIMAL(38,18) NOT NULL,
    "asOf" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenPriceHistory" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "date" DATE NOT NULL,
    "price" DECIMAL(38,18) NOT NULL,

    CONSTRAINT "TokenPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_ecosystem_address_key" ON "Wallet"("ecosystem", "address");

-- CreateIndex
CREATE UNIQUE INDEX "Token_chain_address_key" ON "Token"("chain", "address");

-- CreateIndex
CREATE INDEX "TokenBalance_walletId_idx" ON "TokenBalance"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenBalance_walletId_tokenId_key" ON "TokenBalance"("walletId", "tokenId");

-- CreateIndex
CREATE INDEX "PortfolioSnapshot_walletId_capturedAt_idx" ON "PortfolioSnapshot"("walletId", "capturedAt");

-- CreateIndex
CREATE INDEX "TokenBalanceSnapshot_portfolioSnapshotId_idx" ON "TokenBalanceSnapshot"("portfolioSnapshotId");

-- CreateIndex
CREATE INDEX "Transaction_walletId_blockTimestamp_idx" ON "Transaction"("walletId", "blockTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_chain_txHash_walletId_logIndex_key" ON "Transaction"("chain", "txHash", "walletId", "logIndex");

-- CreateIndex
CREATE UNIQUE INDEX "TokenPrice_tokenId_key" ON "TokenPrice"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenPriceHistory_tokenId_currency_date_key" ON "TokenPriceHistory"("tokenId", "currency", "date");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenBalance" ADD CONSTRAINT "TokenBalance_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenBalance" ADD CONSTRAINT "TokenBalance_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenBalanceSnapshot" ADD CONSTRAINT "TokenBalanceSnapshot_portfolioSnapshotId_fkey" FOREIGN KEY ("portfolioSnapshotId") REFERENCES "PortfolioSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenBalanceSnapshot" ADD CONSTRAINT "TokenBalanceSnapshot_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenPrice" ADD CONSTRAINT "TokenPrice_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenPriceHistory" ADD CONSTRAINT "TokenPriceHistory_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
