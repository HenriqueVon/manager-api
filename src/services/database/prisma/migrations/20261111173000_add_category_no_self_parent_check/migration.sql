/*
  Category hierarchy integrity (issue #42, epic #23).

  A category cannot be its own parent. Prisma has no native CHECK constraint, so it is
  declared only here. Cycles longer than one level are not blocked by the database: they are
  checked by UpdateFinancialCategoryUseCase.

  Warnings:

  - This migration fails if a category already is its own parent. Before applying it,
    this query must return no rows:

      SELECT id FROM financial_categories WHERE parent_category_id = id;

  - Not enforced by this migration, but by the new use case rule (a child has the same type
    as its parent). Existing rows may already break it. To list them:

      SELECT c.id FROM financial_categories c
        JOIN financial_categories p ON p.id = c.parent_category_id
       WHERE p.type <> c.type;
*/

BEGIN;

-- AddCheckConstraint
ALTER TABLE "financial_categories"
  ADD CONSTRAINT "financial_categories_no_self_parent_check"
  CHECK ("parent_category_id" IS NULL OR "parent_category_id" <> "id");

COMMIT;
