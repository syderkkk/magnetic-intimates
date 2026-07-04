-- Correlativo del Libro de Reclamaciones (CLAUDE.md §8 regla 9, §11.2).
-- Igual que order_number_seq: secuencia de Postgres para que dos reclamos
-- simultáneos nunca compitan por el mismo número.
CREATE SEQUENCE IF NOT EXISTS complaint_code_seq START 1;
