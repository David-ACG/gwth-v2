/**
 * Gift and pass emails (bead gwth-launch-v1uj.5), in the paper-first email
 * register. Pure builders: each returns the subject plus HTML and plain-text
 * parts, so the wording is unit tested without sending anything. Sending and
 * the sent_at marks live in src/lib/billing/pass-fulfil.ts and the cron route.
 *
 * Words reviewed by the latest GPT Sol per the public-writing skill.
 */
import { formatPence, formatUkDate, type PassProduct } from "@/lib/billing/passes"
import { renderPaperEmail, type EmailParts } from "@/lib/email/paper-layout"
import { resolvePublicEmailBase } from "@/lib/email/auth-links"

export type BuiltEmail = { subject: string; parts: EmailParts }

export type PassForEmail = {
  code: string
  product: PassProduct
  pricePaid: number
  buyerName: string | null
  buyerEmail: string
  isGift: boolean
  recipientName: string | null
  recipientEmail: string | null
  message: string | null
  deliverAt: Date | null
  redeemBy: Date
  redeemedAt: Date | null
}

type Env = Record<string, string | undefined>

const PRODUCT_NAME: Record<PassProduct, string> = {
  course: "The whole GWTH course (Months 1 to 3)",
  month1: "The first month of the GWTH course",
}

function firstName(name: string | null | undefined, fallback: string): string {
  const first = (name ?? "").trim().split(/\s+/)[0]
  return first || fallback
}

export function openGiftUrl(code: string, env: Env = process.env): string {
  return `${resolvePublicEmailBase(env)}/gift/open?code=${encodeURIComponent(code)}`
}

export function giftCardUrl(code: string, env: Env = process.env): string {
  return `${resolvePublicEmailBase(env)}/gift/card?code=${encodeURIComponent(code)}`
}

function whatTheyGet(product: PassProduct): string {
  return product === "course"
    ? "the whole GWTH course: three months of practical AI lessons for people who aren't programmers, about an hour a day"
    : "the first month of the GWTH course: practical AI lessons for people who aren't programmers, about an hour a day"
}

/** To the buyer, straight after paying, for a gift. */
export function giftReceiptEmail(
  pass: PassForEmail,
  env: Env = process.env,
  now: Date = new Date()
): BuiltEmail {
  const who = pass.recipientName?.trim() || "your recipient"
  const sendsLater = pass.deliverAt !== null && pass.deliverAt > now
  const when = pass.deliverAt ? formatUkDate(pass.deliverAt) : formatUkDate(now)
  const parts = renderPaperEmail(
    {
      preheader: sendsLater ? `We'll email ${who} on ${when}.` : `We've emailed ${who}.`,
      heading: `Your gift for ${who} is ready.`,
      blocks: [
        {
          type: "p",
          text: sendsLater
            ? `We'll email ${who} (${pass.recipientEmail}) on ${when} at 7am UK time, with your message and a link to open the gift.`
            : `We've emailed ${who} (${pass.recipientEmail}) with your message and a link to open the gift.`,
        },
        {
          type: "rows",
          rows: [
            ["Gift", PRODUCT_NAME[pass.product]],
            ["Paid", formatPence(pass.pricePaid)],
            ["Open it by", formatUkDate(pass.redeemBy)],
            ["Gift code", pass.code],
          ],
        },
        {
          type: "p",
          text: "To give it in person, print the gift card. The code works without the email.",
        },
        {
          type: "p",
          text: "Their time starts when they open the gift. For a full refund before it's opened, reply to this email. Once opened, it's not refundable unless the law requires.",
        },
      ],
      cta: { label: "Print the gift card", href: giftCardUrl(pass.code, env) },
    }
  )
  return { subject: `Your GWTH gift for ${who} is ready`, parts }
}

/** To the buyer, on the day a scheduled gift goes to its recipient. */
export function giftSentEmail(
  pass: PassForEmail,
  now: Date = new Date(),
  env: Env = process.env
): BuiltEmail {
  const who = pass.recipientName?.trim() || "your recipient"
  const hello = firstName(pass.buyerName, "there")
  const parts = renderPaperEmail(
    {
      preheader: `We've sent your gift to ${who}.`,
      heading: `Hi ${hello}, we've sent your gift to ${who}.`,
      blocks: [
        {
          type: "p",
          text: `We emailed ${who} (${pass.recipientEmail}) on ${formatUkDate(now)} with your message and a link to open the gift.`,
        },
        {
          type: "p",
          text: `If they haven't received the email, ask them to check their junk folder. You can also print the gift card and give them the code: ${pass.code}.`,
        },
      ],
      cta: { label: "See the gift card", href: giftCardUrl(pass.code, env) },
    }
  )
  return { subject: `Your gift to ${who} has been sent`, parts }
}

/** To the buyer, straight after paying, for themselves. */
export function selfReceiptEmail(pass: PassForEmail, env: Env = process.env): BuiltEmail {
  const opened = pass.redeemedAt !== null
  const parts = renderPaperEmail(
    {
      preheader: opened ? "Month 1 is open now." : "Open your course when you're ready.",
      heading: opened ? "Thank you. Your course has started." : "Thank you. Your course is ready to open.",
      blocks: [
        {
          type: "p",
          text: opened
            ? "Month 1 is open in your account. Each new month opens one month after the previous one."
            : "Use the link below to open your course. Your time starts when you open it.",
        },
        {
          type: "rows",
          rows: [
            ["Course", PRODUCT_NAME[pass.product]],
            ["Paid", formatPence(pass.pricePaid)],
            ["Code", pass.code],
          ],
        },
        {
          type: "p",
          text: "If Month 2 or Month 3 isn't ready when you reach it, your time is paused until it is, so you won't lose any of your course.",
        },
      ],
      cta: opened
        ? { label: "Start Month 1", href: `${resolvePublicEmailBase(env)}/dashboard` }
        : { label: "Open your course", href: openGiftUrl(pass.code, env) },
    }
  )
  return { subject: "Your GWTH course receipt", parts }
}

/** To the recipient, on the delivery date. */
export function giftArrivedEmail(pass: PassForEmail, env: Env = process.env): BuiltEmail {
  const from = pass.buyerName?.trim() || "Someone"
  const hello = firstName(pass.recipientName, "there")
  const blocks: Parameters<typeof renderPaperEmail>[0]["blocks"] = [
    {
      type: "p",
      text: `${from} has given you ${whatTheyGet(pass.product)}.`,
    },
  ]
  if (pass.message?.trim()) {
    blocks.push({ type: "panel", lines: [pass.message.trim(), `From ${from}`] })
  }
  blocks.push(
    {
      type: "p",
      text: "Your time starts when you open the gift. You'll need a free GWTH account with a confirmed email address. We never ask for your card, and the gift never renews.",
    },
    { type: "panel", lines: [pass.code], large: true },
    { type: "p", text: `Open it by ${formatUkDate(pass.redeemBy)}.` }
  )
  const parts = renderPaperEmail(
    {
      preheader: `${from} has given you the GWTH course.`,
      heading: `Hi ${hello}. Here's your gift.`,
      blocks,
      cta: { label: "Open your gift", href: openGiftUrl(pass.code, env) },
    }
  )
  return { subject: `${from} has given you the GWTH course`, parts }
}

/** To whoever opened the pass, once it is open. */
export function passOpenedEmail(
  pass: PassForEmail,
  name: string | null,
  env: Env = process.env
): BuiltEmail {
  const hello = firstName(name, "there")
  const blocks: Parameters<typeof renderPaperEmail>[0]["blocks"] = [
    { type: "p", text: "Month 1 is open in your account. You can start the first lesson now." },
  ]
  if (pass.product === "course") {
    blocks.push({
      type: "p",
      text: "Months 2 and 3 each open a month after the previous one. If the next month isn't ready, your time is paused until it is, so you won't lose any of your course.",
    })
  } else {
    blocks.push({
      type: "p",
      text: "This gift covers the first month. We'll email you about paying to continue with Months 2 and 3.",
    })
  }
  const parts = renderPaperEmail(
    {
      preheader: "Month 1 is open now.",
      heading: `Hi ${hello}. Month 1 is open.`,
      blocks,
      cta: { label: "Start Month 1", href: `${resolvePublicEmailBase(env)}/dashboard` },
    }
  )
  return { subject: "Your GWTH course has started", parts }
}

/**
 * To a monthly payer before a renewal charge (DMCC readiness): what will be
 * charged, when, and how to cancel online.
 */
export function renewalReminderEmail(
  input: { name: string | null; amountPence: number; chargeOn: Date; forMonth: number | "ongoing" },
  env: Env = process.env
): BuiltEmail {
  const hello = firstName(input.name, "there")
  const what =
    input.forMonth === "ongoing"
      ? "your GWTH membership after the course"
      : `Month ${input.forMonth} of the GWTH course`
  const parts = renderPaperEmail(
    {
      preheader: `${formatPence(input.amountPence)} on ${formatUkDate(input.chargeOn)}.`,
      heading: `Hi ${hello}, your next payment is on ${formatUkDate(input.chargeOn)}`,
      blocks: [
        {
          type: "p",
          text: `On ${formatUkDate(input.chargeOn)} we'll take ${formatPence(input.amountPence)} for ${what}.`,
        },
        {
          type: "p",
          text: "To stop payments, cancel online in your account settings before that date. You won't be charged again. You'll keep access until the end of the month you've paid for.",
        },
      ],
      cta: { label: "Manage your payments", href: `${resolvePublicEmailBase(env)}/settings` },
    }
  )
  return { subject: `Your next GWTH payment on ${formatUkDate(input.chargeOn)}`, parts }
}
