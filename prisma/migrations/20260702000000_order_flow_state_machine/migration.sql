-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', 'reembolsado');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pendiente', 'aprobado', 'rechazado');

-- AlterTable
-- (conversión con USING en vez de drop+add: preserva el historial ya guardado
-- en audit_logs.changes, que siempre fue JSON.stringify válido)
ALTER TABLE "audit_logs" ALTER COLUMN "changes" TYPE JSONB USING "changes"::jsonb;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "idempotency_key" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'pendiente';

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL,
DROP COLUMN "gateway_response",
ADD COLUMN     "gateway_response" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_transaction_id_key" ON "payments"("order_id", "transaction_id");

-- CreateSequence
-- Correlativo del pedido (docs/08-implementacion-flujo-venta.md, paso 1.4).
-- Arranca en 1001 para que el número no delate el volumen real de ventas.
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

