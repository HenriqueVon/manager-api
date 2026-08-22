/*
  Warnings:

  - A unique constraint covering the columns `[ledger_id,name]` on the table `financial_funds` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "financial_funds_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "financial_funds_ledger_id_name_key" ON "financial_funds"("ledger_id", "name");
