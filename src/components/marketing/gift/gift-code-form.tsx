"use client"

import { useState } from "react"
import { OPEN_COPY as C } from "./gift-copy"
import form from "@/components/marketing/contact-fde/contact-fde.module.css"

/**
 * The "Gift code" box on /gift/open. A plain GET form, so it still works with
 * no JavaScript (the page then shows the same empty-code message from the
 * server). With JavaScript, an empty submit stays on the page and says what to
 * enter, as the gift form does for its fields (launch readiness review,
 * 2026-10-20: an empty submit used to reload the page and say nothing).
 */
export function GiftCodeForm({ value, error }: { value?: string; error?: string }) {
  const [message, setMessage] = useState<string | undefined>(error)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim()
    if (!code) {
      event.preventDefault()
      setMessage(C.enter.empty)
    }
  }

  return (
    <form method="get" action="/gift/open" className={form.form} onSubmit={onSubmit} noValidate>
      <div className={form.field}>
        <label className={form.label} htmlFor="code">{C.enter.label}</label>
        <input
          id="code"
          name="code"
          className={form.input}
          defaultValue={value}
          placeholder={C.enter.placeholder}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          aria-invalid={Boolean(message)}
          aria-describedby={message ? "code-error" : undefined}
          onInput={() => message === C.enter.empty && setMessage(undefined)}
        />
        {message && (
          <p className={form.error} id="code-error" role="alert">
            {message}
          </p>
        )}
      </div>
      <button type="submit" className={form.buttonSolid}>
        {C.enter.button}
      </button>
    </form>
  )
}
