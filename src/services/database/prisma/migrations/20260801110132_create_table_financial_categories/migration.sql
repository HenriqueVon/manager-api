-- CreateEnum
CREATE TYPE "FinancialCategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "financial_categories" (
    "id" TEXT NOT NULL,
    "ledger_id" TEXT NOT NULL,
    "parent_category_id" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "type" "FinancialCategoryType" NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_categories_ledger_id_idx" ON "financial_categories"("ledger_id");

-- CreateIndex
CREATE INDEX "financial_categories_parent_category_id_idx" ON "financial_categories"("parent_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_categories_ledger_id_parent_category_id_name_key" ON "financial_categories"("ledger_id", "parent_category_id", "name");

-- AddForeignKey
ALTER TABLE "financial_categories" ADD CONSTRAINT "financial_categories_ledger_id_fkey" FOREIGN KEY ("ledger_id") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_categories" ADD CONSTRAINT "financial_categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
