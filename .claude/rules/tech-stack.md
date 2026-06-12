---
paths:
  - "next.config.ts"
  - "tsconfig.json"
  - "eslint.config.mjs"
  - "postcss.config.mjs"
  - "package.json"
---

<!-- SENTINEL: rule=tech-stack, salt=ts-7K2x -->

# Tech Stack — Configuration Detail

Loaded automatically when editing config files. The high-level stack summary lives in `CLAUDE.md`.

## next.config.ts

```ts
const nextConfig: NextConfig = {
  output: "standalone", // Docker-ready for Coolify deployment
  images: {
    remotePatterns: [
      // Add patterns as external image sources are identified
      // e.g. course thumbnails, user avatars from CDN
    ],
  },
};
```

## ESLint

Use modern flat config matching the ACG project:

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

## TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## Environment Variables

```bash
# .env.local (gitignored — backend secrets only)
# No env vars needed for Phase 1 (mock data)
# Future: NEXT_PUBLIC_* for client-side config, everything else server-only
```

Create a `.env.local.example` committed to git showing what vars are needed (without values).
