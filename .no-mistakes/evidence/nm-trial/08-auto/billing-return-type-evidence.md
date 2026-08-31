# Evidence: explicit return type on `billingDisabledForBetaBody()`

## Change
`src/lib/billing/stripe.ts` — the function now declares an explicit return type:

```ts
export function billingDisabledForBetaBody(): { error: string; code: string } {
  return {
    error: BILLING_DISABLED_FOR_BETA_MESSAGE,   // "Billing disabled for beta"
    code: "billing_disabled_for_beta",
  }
}
```

## Runtime shape conforms to the declared type
Invoked the function and assigned its result to a variable typed `{ error: string; code: string }`
(the declared return type). It compiles and the runtime object matches exactly:

```
Runtime body returned by billingDisabledForBetaBody():
{
  "error": "Billing disabled for beta",
  "code": "billing_disabled_for_beta"
}

Keys: error, code
typeof error: string | typeof code: string
```

## End-to-end: the type-annotated body is what API consumers receive
`billingDisabledForBetaBody()` is the 503 response body returned by all three Stripe
API routes when billing is disabled for beta (`/api/stripe/checkout`, `/portal`, `/webhook`).
The route-level tests assert the exact body shape an API client would receive:

```
$ npx vitest run src/lib/billing/access.test.ts
 ✓ src/lib/billing/access.test.ts (7 tests) 300ms
   - returns 503 from checkout when BILLING_ENABLED is not set
   - returns 503 from portal   when BILLING_ENABLED is not set
   - returns 503 from webhook  when BILLING_ENABLED is not set
     → response.status === 503
     → body matches { code: "billing_disabled_for_beta", error: "Billing disabled for beta" }
```

The explicit return type matches the actual runtime output and the shape every
Stripe route hands back to clients, so the added annotation is accurate and type-safe.
