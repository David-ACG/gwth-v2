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
    // Old site scripts are archived docs, not production code
    "docs/old-site/**",
    // Kanban design artefacts (concept JSX, baseline scripts) are research files, not shipped code
    "kanban/**",
    // Unrelated sub-project, has its own toolchain
    "gwth_projects/**",
  ]),
]);

export default eslintConfig;
