-- CreateTable
CREATE TABLE "financial_fund_transactions" (
    "id" TEXT NOT NULL,
    "transaction_date" DATE NOT NULL,
    "amount_credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amount_debit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "additional_description" VARCHAR(100),
    "ledger_id" TEXT NOT NULL,
    "financial_description_id" TEXT NOT NULL,
    "financial_fund_id" TEXT NOT NULL,
    "financial_category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_fund_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_fund_transactions_ledger_id_idx" ON "financial_fund_transactions"("ledger_id");

-- CreateIndex
CREATE INDEX "financial_fund_transactions_financial_description_id_idx" ON "financial_fund_transactions"("financial_description_id");

-- CreateIndex
CREATE INDEX "financial_fund_transactions_financial_fund_id_idx" ON "financial_fund_transactions"("financial_fund_id");

-- CreateIndex
CREATE INDEX "financial_fund_transactions_financial_category_id_idx" ON "financial_fund_transactions"("financial_category_id");

-- AddForeignKey
ALTER TABLE "financial_fund_transactions" ADD CONSTRAINT "financial_fund_transactions_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_fund_transactions" ADD CONSTRAINT "financial_fund_transactions_financial_description_id_fkey" FOREIGN KEY ("financial_description_id") REFERENCES "financial_descriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_fund_transactions" ADD CONSTRAINT "financial_fund_transactions_financial_fund_id_fkey" FOREIGN KEY ("financial_fund_id") REFERENCES "financial_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_fund_transactions" ADD CONSTRAINT "financial_fund_transactions_financial_category_id_fkey" FOREIGN KEY ("financial_category_id") REFERENCES "financial_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
