-- CreateTable
CREATE TABLE "financial_descriptions" (
    "id" TEXT NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_descriptions_description_key" ON "financial_descriptions"("description");
