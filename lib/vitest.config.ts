/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      all: true,
      exclude: [
        ".turbo/**",
        "dist/**",
        "coverage/**",
        "node_modules/**",
        "src/core/**", // TODO: e2e Unleash client tests
      ],
    },
  },
});
