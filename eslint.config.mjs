import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // React 19's lint flags the long-standing "load data in an effect, then set state" pattern used across the admin
      // forms and pages (about thirty places). They work correctly; rewriting them all is a separate refactor, so they
      // stay visible as warnings instead of failing the lint.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
