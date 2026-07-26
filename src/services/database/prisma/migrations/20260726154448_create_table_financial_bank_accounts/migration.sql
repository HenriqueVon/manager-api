-- CreateEnum
CREATE TYPE "FinancialBankAccountType" AS ENUM ('PERSONAL', 'BUSINESS');

-- CreateTable
CREATE TABLE "financial_bank_accounts" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "FinancialBankAccountType" NOT NULL,
    "balance" DECIMAL(18,2),
    "financial_currency_id" TEXT NOT NULL,
    "ledger_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_bank_accounts_name_key" ON "financial_bank_accounts"("name");

-- CreateIndex
CREATE INDEX "financial_bank_accounts_financial_currency_id_idx" ON "financial_bank_accounts"("financial_currency_id");

-- CreateIndex
CREATE INDEX "financial_bank_accounts_ledger_id_idx" ON "financial_bank_accounts"("ledger_id");

-- AddForeignKey
ALTER TABLE "financial_bank_accounts" ADD CONSTRAINT "financial_bank_accounts_financial_currency_id_fkey" FOREIGN KEY ("financial_currency_id") REFERENCES "financial_currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_bank_accounts" ADD CONSTRAINT "financial_bank_accounts_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
