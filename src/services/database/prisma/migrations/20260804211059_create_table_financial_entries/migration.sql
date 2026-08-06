-- CreateEnum
CREATE TYPE "FinancialEntryType" AS ENUM ('PAYABLE', 'RECEIVABLE');

-- CreateTable
CREATE TABLE "financial_entries" (
    "id" TEXT NOT NULL,
    "type" "FinancialEntryType" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "payment_date" TIMESTAMP(3),
    "amount" DECIMAL(18,2) NOT NULL,
    "amount_paid" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "additional_description" VARCHAR(100),
    "is_monthly" BOOLEAN NOT NULL DEFAULT false,
    "ledger_id" TEXT NOT NULL,
    "financial_description_id" TEXT NOT NULL,
    "financial_fund_id" TEXT NOT NULL,
    "financial_category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_entries_ledger_id_idx" ON "financial_entries"("ledger_id");

-- CreateIndex
CREATE INDEX "financial_entries_financial_description_id_idx" ON "financial_entries"("financial_description_id");

-- CreateIndex
CREATE INDEX "financial_entries_financial_fund_id_idx" ON "financial_entries"("financial_fund_id");

-- CreateIndex
CREATE INDEX "financial_entries_financial_category_id_idx" ON "financial_entries"("financial_category_id");

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_financial_description_id_fkey" FOREIGN KEY ("financial_description_id") REFERENCES "financial_descriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_financial_fund_id_fkey" FOREIGN KEY ("financial_fund_id") REFERENCES "financial_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_financial_category_id_fkey" FOREIGN KEY ("financial_category_id") REFERENCES "financial_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
