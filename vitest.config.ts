import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    environment: "node",
    exclude: ["node_modules/**", "e2e/**"],
    include: [
      "src/**/*.test.ts",
      "src/**/*.spec.ts",
      "test/**/*.test.ts",
      "test/**/*.spec.ts",
    ],
    mockReset: true,
    restoreMocks: true,
  },
});
