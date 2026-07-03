import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** Config de Vitest para el flujo crítico de compra (CLAUDE.md §7.10). */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "server-only" solo existe como alias del bundler de Next; fuera de él
      // (aquí, en Vitest) no se resuelve — se sustituye por un módulo vacío.
      "server-only": fileURLToPath(
        new URL("./src/test/server-only-mock.ts", import.meta.url),
      ),
    },
  },
  test: {
    // "node" por defecto: la mayoría de los tests son de lógica de servidor
    // (totales, stock, máquina de estados) e importan `server-only`, que
    // revienta si `window` existe. Los tests de componentes que lo necesiten
    // pueden pedir jsdom con `// @vitest-environment jsdom` al inicio del archivo.
    environment: "node",
    globals: true,
  },
});
