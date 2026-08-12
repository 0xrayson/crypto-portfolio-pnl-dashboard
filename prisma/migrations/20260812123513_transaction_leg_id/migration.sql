-- Rename Transaction.logIndex (Int?) to Transaction.legId (String), since
-- multi-leg transactions (e.g. both sides of a swap) need a stable string
-- identifier (Alchemy's own uniqueId on EVM, a synthetic tag on Solana),
-- not a bare integer index.

-- DropIndex
DROP INDEX "Transaction_chain_txHash_walletId_logIndex_key";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "legId" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "Transaction" DROP COLUMN "logIndex";

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_chain_txHash_walletId_legId_key" ON "Transaction"("chain", "txHash", "walletId", "legId");
