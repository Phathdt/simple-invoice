-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "base_currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "exchange_rate" DECIMAL(18,8) NOT NULL DEFAULT 1,
ADD COLUMN     "total_amount_base" DECIMAL(18,6) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "invoices_total_amount_base_idx" ON "invoices"("total_amount_base");
