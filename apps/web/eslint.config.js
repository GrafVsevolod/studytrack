import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // ✅ не линтим артефакты сборки/покрытия/Playwright
  globalIgnores([
    "dist",
    "coverage",
    "playwright-report",
    "test-results",
    "node_modules",
  ]),

  // основной линт для TS/TSX
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },

  // ✅ послабления только для тестов
  {
    files: [
      "**/*.test.{ts,tsx}",
      "src/**/*.test.{ts,tsx}",
      "tests/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
