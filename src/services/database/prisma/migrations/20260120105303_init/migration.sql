-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('FIAT', 'CRYPTO', 'MIXED');

-- CreateTable
CREATE TABLE "ledgers" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "LedgerType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ledgers_name_key" ON "ledgers"("name");
