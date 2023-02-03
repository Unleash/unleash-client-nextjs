/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      all: true,
      include: ["src/**/*.ts*"],
      exclude: [
        "src/**/*.test.ts*",
        "src/core/**", // TODO: e2e Unleash client tests
      ],
    },
  },
});
