-- CreateTable
CREATE TABLE "financial_funds" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "balance" DECIMAL(18,2),
    "financial_currency_id" TEXT NOT NULL,
    "ledger_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_funds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_funds_name_key" ON "financial_funds"("name");

-- CreateIndex
CREATE INDEX "financial_funds_financial_currency_id_idx" ON "financial_funds"("financial_currency_id");

-- CreateIndex
CREATE INDEX "financial_funds_ledger_id_idx" ON "financial_funds"("ledger_id");

-- AddForeignKey
ALTER TABLE "financial_funds" ADD CONSTRAINT "financial_funds_financial_currency_id_fkey" FOREIGN KEY ("financial_currency_id") REFERENCES "financial_currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_funds" ADD CONSTRAINT "financial_funds_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
