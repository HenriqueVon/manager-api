/*
  Warnings:

  - Added the required column `financial_bank_account_id` to the `financial_fund_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "financial_fund_transactions" ADD COLUMN     "financial_bank_account_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "financial_fund_transactions_financial_bank_account_id_idx" ON "financial_fund_transactions"("financial_bank_account_id");

-- AddForeignKey
ALTER TABLE "financial_fund_transactions" ADD CONSTRAINT "financial_fund_transactions_financial_bank_account_id_fkey" FOREIGN KEY ("financial_bank_account_id") REFERENCES "financial_bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
