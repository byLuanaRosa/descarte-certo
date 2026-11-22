import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testes que conversam com o Supabase real usando a chave pública (anon).
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    include: ["tests/seguranca/**/*.test.ts"],
    testTimeout: 20_000,
  },
});
