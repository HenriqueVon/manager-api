/*
  Ledger-scoped referential integrity (issues #20, #23).

  Records that belong to a ledger may only reference funds, categories and bank accounts
  of the same ledger. The single-column foreign keys are replaced by composite foreign keys
  on (<reference>_id, ledger_id), which require the pair to exist in the referenced table.

  Warnings:

  - This migration fails if existing rows already reference a fund, category or bank account
    of another ledger. Before applying it, these queries must return no rows:

      SELECT e.id FROM financial_entries e
        JOIN financial_funds f ON f.id = e.financial_fund_id
        JOIN financial_categories c ON c.id = e.financial_category_id
       WHERE f.ledger_id <> e.ledger_id OR c.ledger_id <> e.ledger_id;

      SELECT t.id FROM financial_fund_transactions t
        JOIN financial_funds f ON f.id = t.financial_fund_id
        JOIN financial_categories c ON c.id = t.financial_category_id
        JOIN financial_bank_accounts b ON b.id = t.financial_bank_account_id
       WHERE f.ledger_id <> t.ledger_id OR c.ledger_id <> t.ledger_id OR b.ledger_id <> t.ledger_id;

      SELECT c.id FROM financial_categories c
        JOIN financial_categories p ON p.id = c.parent_category_id
       WHERE p.ledger_id <> c.ledger_id;
  - financial_categories.parent_category_id changes from ON DELETE SET NULL to ON DELETE RESTRICT:
    SET NULL would also null ledger_id, which is part of the composite key and NOT NULL.
    Deleting a category that has subcategories is now rejected.
  - ON UPDATE RESTRICT: a fund, category or bank account cannot be moved to another ledger
    while it is referenced.

  The new constraints are added before the old ones are dropped, so the tables are never
  left without foreign keys.
*/

-- CreateIndex
CREATE UNIQUE INDEX "financial_bank_accounts_id_ledger_id_key" ON "financial_bank_accounts"("id", "ledger_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_funds_id_ledger_id_key" ON "financial_funds"("id", "ledger_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_categories_id_ledger_id_key" ON "financial_categories"("id", "ledger_id");

-- AddForeignKey
ALTER TABLE "financial_categories" ADD CONSTRAINT "financial_categories_parent_category_id_ledger_id_fkey" FOREIGN KEY ("parent_category_id", "ledger_id") REFERENCES "financial_categories"("id", "ledger_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_financial_fund_id_ledger_id_fkey" FOREIGN KEY ("financial_fund_id", "ledger_id") REFERENCES "financial_funds"("id", "ledger_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_financial_category_id_ledger_id_fkey" FOREIGN KEY ("financial_category_id", "ledger_id") REFERENCES "financial_categories"("id", "ledger_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "financial_fund_transactions" ADD CONSTRAINT "financial_fund_transactions_financial_fund_id_ledger_id_fkey" FOREIGN KEY ("financial_fund_id", "ledger_id") REFERENCES "financial_funds"("id", "ledger_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "financial_fund_transactions" ADD CONSTRAINT "financial_fund_transactions_financial_category_id_ledger_i_fkey" FOREIGN KEY ("financial_category_id", "ledger_id") REFERENCES "financial_categories"("id", "ledger_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "financial_fund_transactions" ADD CONSTRAINT "financial_fund_transactions_financial_bank_account_id_ledg_fkey" FOREIGN KEY ("financial_bank_account_id", "ledger_id") REFERENCES "financial_bank_accounts"("id", "ledger_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- DropForeignKey
ALTER TABLE "financial_categories" DROP CONSTRAINT "financial_categories_parent_category_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_entries" DROP CONSTRAINT "financial_entries_financial_fund_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_entries" DROP CONSTRAINT "financial_entries_financial_category_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_fund_transactions" DROP CONSTRAINT "financial_fund_transactions_financial_fund_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_fund_transactions" DROP CONSTRAINT "financial_fund_transactions_financial_category_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_fund_transactions" DROP CONSTRAINT "financial_fund_transactions_financial_bank_account_id_fkey";
