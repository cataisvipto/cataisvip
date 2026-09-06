import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Dynamic i18n keys (e.g. tCategories(cat as any)) are safe at runtime
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone Node.js scripts (CommonJS, not part of Next.js app)
    "scripts/**",
    // 本地内部目录（gitignore，不存在于 CI；2026-09-06 加入避免本地 lint 噪音淹没）
    "sandbox-*/**",
    ".qoder/**",
    "_internal/**",
    "_cfp_*/**",
    "_preview_shots/**",
    ".agents/**",
    ".zcode/**",
  ]),
]);

export default eslintConfig;
