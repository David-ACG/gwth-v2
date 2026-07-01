# Evidence — Exclude `remotion/` from main tsc typecheck

**Intent:** Exclude the standalone `remotion/` sub-project from the main `tsc`
typecheck so the CI `Typecheck` step passes and Coolify deploys (gated by
`needs: check`) stop being skipped.

The CI `check` job runs `npm run typecheck` → `tsc --noEmit`
(`.github/workflows/ci.yml:34-35`). Both `deploy-hetzner` and `deploy-p520`
declare `needs: check`, so a failing typecheck skips every deploy.

## WITH the fix — `exclude: ["node_modules", "docs/old-site", "remotion"]`

```
$ npm run typecheck
> gwth-v2@0.1.0 typecheck
> tsc --noEmit
EXIT: 0
```

Typecheck passes cleanly → CI `check` succeeds → deploy jobs run.

## WITHOUT the fix — `exclude` reverted to `["node_modules", "docs/old-site"]`

Reverting the one-line change reproduces the 13 `Cannot find module` errors the
commit message describes — all originating from `remotion/`, which imports the
`remotion` package that is not a main-project dependency:

```
remotion/remotion.config.ts(1,24): error TS2307: Cannot find module '@remotion/cli/config' or its corresponding type declarations.
remotion/src/Explainer.tsx(2,87): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/Root.tsx(8,8): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/components/primitives.tsx(2,30): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/index.ts(1,30): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/motion/presets.ts(12,45): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/slides/ComparisonTwoUp.tsx(2,33): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/slides/CtaDispatch.tsx(2,33): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/slides/Feature.tsx(2,33): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/slides/SingleStatement.tsx(2,33): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/slides/TitleCover.tsx(2,33): error TS2307: Cannot find module 'remotion' or its corresponding type declarations.
remotion/src/theme/fonts.ts(10,39): error TS2307: Cannot find module '@remotion/google-fonts/SourceSerif4' or its corresponding type declarations.
remotion/src/theme/fonts.ts(11,38): error TS2307: Cannot find module '@remotion/google-fonts/JetBrainsMono' or its corresponding type declarations.
```

13 errors, every one under `remotion/`. This is the exact failure the fix
prevents. The tsconfig was restored to the committed state after this check
(working tree clean).

## Conclusion

The single-line `exclude` addition makes `npm run typecheck` exit 0 while the
`remotion/` sub-project (which has its own config/deps) is no longer pulled into
the main typecheck. CI `check` passes end-to-end, so the deploy jobs are no
longer skipped — intent satisfied.
