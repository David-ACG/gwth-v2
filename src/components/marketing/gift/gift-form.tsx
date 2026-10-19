"use client"

import { useState } from "react"
import { GIFT_COPY as C } from "./gift-copy"
import form from "@/components/marketing/contact-fde/contact-fde.module.css"
import styles from "./gift.module.css"

type Product = "course" | "month1"

export type GiftFormProps = {
  /** Display prices at the moment the page rendered, e.g. "£69". */
  prices: Record<Product, string>
  /** The struck-through full price while the sale runs, else null. */
  courseWasPrice: string | null
  /** "6 January 2027" while the sale runs, else null. */
  saleEndsOn: string | null
  /** "25 December, 7am" while Christmas morning is still ahead, else null. */
  christmasLabel: string | null
  /** Today in UK time, YYYY-MM-DD, the earliest date the picker allows. */
  today: string
  /** A year from today, the latest send date. */
  lastDay: string
}

type Delivery = "christmas" | "now" | "date"

/**
 * The gift order form (bead gwth-launch-v1uj.5). Posts to
 * /api/passes/checkout, which decides the real price and opens Stripe. The
 * prices shown here are for reading only.
 */
export function GiftForm({ prices, courseWasPrice, saleEndsOn, christmasLabel, today, lastDay }: GiftFormProps) {
  const [product, setProduct] = useState<Product>("course")
  const [delivery, setDelivery] = useState<Delivery>(christmasLabel ? "christmas" : "now")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (name: string) => String(data.get(name) ?? "").trim()

    const next: Record<string, string> = {}
    if (!value("recipientName")) next.recipientName = C.errors.recipientName
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("recipientEmail"))) next.recipientEmail = C.errors.recipientEmail
    if (!value("buyerName")) next.buyerName = C.errors.buyerName
    if (delivery === "date" && !value("date")) next.date = C.errors.date
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    setServerError(null)
    try {
      const res = await fetch("/api/passes/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gift: true,
          product,
          recipientName: value("recipientName"),
          recipientEmail: value("recipientEmail"),
          buyerName: value("buyerName"),
          message: value("message"),
          delivery: delivery === "date" ? { kind: "date", date: value("date") } : { kind: delivery },
        }),
      })
      const result = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !result.url) throw new Error(result.error ?? C.errors.generic)
      window.location.href = result.url
    } catch (err) {
      setServerError(err instanceof Error ? err.message : C.errors.generic)
      setBusy(false)
    }
  }

  const fieldError = (name: string) =>
    errors[name] ? (
      <p className={form.error} id={`${name}-error`}>
        {errors[name]}
      </p>
    ) : null

  return (
    <form className={styles.formWide} onSubmit={onSubmit} noValidate data-testid="gift-form">
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{C.products.legend}</legend>
        <div className={styles.products}>
          {(["course", "month1"] as const).map((key) => (
            <label key={key} className={styles.product} data-testid={`gift-product-${key}`}>
              <input
                type="radio"
                name="product"
                value={key}
                checked={product === key}
                onChange={() => setProduct(key)}
              />
              <span className={styles.productTitle}>{C.products[key].title}</span>
              <span className={styles.productPrice}>
                {prices[key]}
                {key === "course" && courseWasPrice && <span className={styles.productWas}>{courseWasPrice}</span>}
              </span>
              <span className={styles.productNote}>
                {key === "course" ? C.products.course.note(saleEndsOn) : C.products.month1.note}
              </span>
              <span className={styles.checked} aria-hidden="true">
                ✓ {C.products.selected}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={form.panel}>
        <div className={styles.stack}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{C.recipient.legend}</legend>
            <div className={styles.twoCol}>
              <div className={form.field}>
                <label className={form.label} htmlFor="recipientName">{C.recipient.name}</label>
                <input
                  id="recipientName"
                  name="recipientName"
                  className={form.input}
                  maxLength={80}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.recipientName)}
                  aria-describedby={errors.recipientName ? "recipientName-error" : undefined}
                />
                {fieldError("recipientName")}
              </div>
              <div className={form.field}>
                <label className={form.label} htmlFor="recipientEmail">{C.recipient.email}</label>
                <input
                  id="recipientEmail"
                  name="recipientEmail"
                  type="email"
                  className={form.input}
                  maxLength={254}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.recipientEmail)}
                  aria-describedby={errors.recipientEmail ? "recipientEmail-error" : "recipientEmail-hint"}
                />
                <p className={styles.hint} id="recipientEmail-hint">{C.recipient.emailHint}</p>
                {fieldError("recipientEmail")}
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{C.from.legend}</legend>
            <div className={form.field}>
              <label className={form.label} htmlFor="buyerName">{C.from.name}</label>
              <input
                id="buyerName"
                name="buyerName"
                className={form.input}
                maxLength={80}
                autoComplete="name"
                aria-invalid={Boolean(errors.buyerName)}
                aria-describedby={errors.buyerName ? "buyerName-error" : undefined}
              />
              {fieldError("buyerName")}
            </div>
            <div className={form.field}>
              <label className={form.label} htmlFor="message">{C.from.message}</label>
              <textarea id="message" name="message" className={form.textarea} maxLength={500} aria-describedby="message-hint" />
              <p className={styles.hint} id="message-hint">{C.from.messageHint}</p>
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{C.delivery.legend}</legend>
            <div className={styles.choices}>
              {christmasLabel && (
                <label className={styles.choice}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === "christmas"}
                    onChange={() => setDelivery("christmas")}
                  />
                  {C.delivery.christmas(christmasLabel)}
                </label>
              )}
              <label className={styles.choice}>
                <input type="radio" name="delivery" checked={delivery === "now"} onChange={() => setDelivery("now")} />
                {C.delivery.now}
              </label>
              <label className={styles.choice}>
                <input type="radio" name="delivery" checked={delivery === "date"} onChange={() => setDelivery("date")} />
                {C.delivery.date}
              </label>
            </div>
            {delivery === "date" && (
              <div className={form.field}>
                <label className={form.label} htmlFor="date">{C.delivery.dateLabel}</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  min={today}
                  max={lastDay}
                  className={form.input}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? "date-error" : undefined}
                />
                {fieldError("date")}
              </div>
            )}
          </fieldset>

          <div className={styles.stack}>
            <button
              type="submit"
              className={`${form.buttonSolid} ${form.buttonFull}`}
              disabled={busy}
              aria-busy={busy}
              data-testid="gift-pay"
            >
              {busy ? "Opening the payment page" : C.pay.button(prices[product])}
            </button>
            {serverError && (
              <p className={form.error} role="alert">
                {serverError}
              </p>
            )}
            <p className={styles.hint}>{C.pay.note}</p>
          </div>
        </div>
      </div>
    </form>
  )
}
