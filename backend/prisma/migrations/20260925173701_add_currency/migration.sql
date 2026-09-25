-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'INR');

-- DropIndex
DROP INDEX "budgets_userId_categoryId_month_year_key";

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';

-- CreateIndex
CREATE UNIQUE INDEX "budgets_userId_categoryId_month_year_currency_key" ON "budgets"("userId", "categoryId", "month", "year", "currency");

