/**
 * Test-environment stub for the `server-only` package.
 *
 * The real package throws on import outside a React Server Component, which
 * is exactly what makes it useful in the Next build — and exactly what stops
 * vitest from importing a server module to test its SQL. Next's own bundler
 * never sees this file (it resolves the real package); only
 * `vitest.config.ts` aliases to it. Marking a module `server-only` therefore
 * keeps its build-time guarantee AND stays testable.
 */
export {}
