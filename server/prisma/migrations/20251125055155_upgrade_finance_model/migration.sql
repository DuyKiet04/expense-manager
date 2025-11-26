-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CategoryType" ADD VALUE 'DEBT_LENT';
ALTER TYPE "CategoryType" ADD VALUE 'DEBT_BORROWED';
ALTER TYPE "CategoryType" ADD VALUE 'SAVING';

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "isFamily" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);
