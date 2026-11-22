import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Testes que conversam com o Supabase real usando a chave pública (anon).
// Localmente, lê as variáveis do .env.local; na CI, dos secrets do GitHub.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    include: ["tests/seguranca/**/*.test.ts"],
    testTimeout: 20_000,
    env: loadEnv("", process.cwd(), "NEXT_PUBLIC_"),
  },
});
