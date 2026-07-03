import { describe, expect, it } from "vitest";

import type { OrderStatus } from "@/generated/prisma/client";
import { canTransition, RESTOCK_ON_CANCEL } from "@/lib/order-status";

const ALL_STATUSES: OrderStatus[] = [
  "pendiente",
  "pagado",
  "enviado",
  "entregado",
  "cancelado",
  "reembolsado",
];

/** Transiciones válidas según CLAUDE.md §11.2. */
const VALID: Record<OrderStatus, OrderStatus[]> = {
  pendiente: ["pagado", "cancelado"],
  pagado: ["enviado", "reembolsado"],
  enviado: ["entregado", "reembolsado"],
  entregado: ["reembolsado"],
  cancelado: [],
  reembolsado: [],
};

describe("canTransition", () => {
  for (const from of ALL_STATUSES) {
    for (const to of ALL_STATUSES) {
      const expected = VALID[from].includes(to);
      it(`${from} → ${to} es ${expected ? "válida" : "inválida"}`, () => {
        expect(canTransition(from, to)).toBe(expected);
      });
    }
  }

  it("rechaza saltos inválidos como pendiente → entregado", () => {
    expect(canTransition("pendiente", "entregado")).toBe(false);
  });

  it("los estados finales no tienen salida (cancelado, salvo reembolsado desde otros)", () => {
    expect(canTransition("cancelado", "pendiente")).toBe(false);
    expect(canTransition("cancelado", "pagado")).toBe(false);
  });
});

describe("RESTOCK_ON_CANCEL", () => {
  it("incluye solo los estados donde ya se reservó stock", () => {
    expect(RESTOCK_ON_CANCEL).toEqual(["pendiente", "pagado"]);
  });
});
