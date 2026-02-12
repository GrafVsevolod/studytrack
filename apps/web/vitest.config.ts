// apps/web/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,

    // ✅ Vitest запускает только unit-тесты из src/
    include: ["src/**/*.test.{ts,tsx}"],
    // ✅ Игнорируем Playwright e2e-тесты и артефакты
    exclude: [
      "tests/**",
      "node_modules/**",
      "dist/**",
      "playwright-report/**",
      "test-results/**",
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // считаем покрытие только по "логике", а не по React-страницам
      include: [
        "src/app/store/**/*.ts",
        "src/shared/**/*.ts",
        "src/app/workers/**/*.ts",
      ],
      exclude: [
        "src/app/store/hooks.ts",
        "src/**/*.d.ts",
        "src/**/*.tsx", // страницы/компоненты не считаем
        "src/app/router/**",
        "src/app/layout/**",
        "src/App.tsx",
        "src/app/store/store.ts", // ✅ добавлено — исключаем wiring store
      ],
      // пороги под CI (можешь начать с 70 и потом поднять)
      lines: 80,
      statements: 80,
      functions: 80,
      branches: 60,
    },
  },
});
