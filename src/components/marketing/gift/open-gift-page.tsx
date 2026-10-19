import Link from "next/link"
import { formatUkDate, normalisePassCode } from "@/lib/billing/passes"
import { getPassByCode, passOpenability } from "@/lib/billing/pass-store"
import { getAccessForUser } from "@/lib/billing/access"
import { OpenGiftButton } from "./open-gift-button"
import { OPEN_COPY as C } from "./gift-copy"
import form from "@/components/marketing/contact-fde/contact-fde.module.css"
import styles from "./gift.module.css"

type Identity = { id: string; name: string; email: string } | null

function Notice({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className={styles.notice} data-testid="open-gift-notice">
      <p className={styles.noticeTitle}>{title}</p>
      {body && <p className={styles.noticeBody}>{body}</p>}
      {children}
    </div>
  )
}

function CodeForm({ value, error }: { value?: string; error?: string }) {
  return (
    <form method="get" action="/gift/open" className={form.form}>
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
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "code-error" : undefined}
        />
        {error && (
          <p className={form.error} id="code-error">
            {error}
          </p>
        )}
      </div>
      <button type="submit" className={form.buttonSolid}>
        {C.enter.button}
      </button>
    </form>
  )
}

/**
 * /gift/open (bead gwth-launch-v1uj.5): enter a code, see what it is and who
 * it is from, create an account or sign in, and open it. Opening is the
 * POST /api/passes/open call; this page only reads.
 */
export async function OpenGiftPage({ rawCode, identity }: { rawCode: string | null; identity: Identity }) {
  const code = rawCode ? normalisePassCode(rawCode) : null
  const pass = code ? await getPassByCode(code).catch(() => null) : null
  const back = code ? `/gift/open?code=${encodeURIComponent(code)}` : "/gift/open"

  let body: React.ReactNode
  if (!rawCode) {
    body = <CodeForm />
  } else if (!pass) {
    body = <CodeForm value={rawCode} error={C.notFound} />
  } else {
    const state = passOpenability(pass, new Date())
    const summary = (
      <div className={styles.stack}>
        <p className={styles.noticeTitle} data-testid="gift-what">
          {C.found[pass.product]}
        </p>
        {pass.isGift && pass.buyerName && <p className={styles.noticeBody}>{C.found.from(pass.buyerName)}</p>}
        {pass.isGift && pass.message && <p className={styles.message}>{pass.message}</p>}
        <p className={styles.hint}>{C.found.openBy(formatUkDate(pass.redeemBy))}</p>
      </div>
    )

    let action: React.ReactNode
    if (state === "refunded") {
      action = <Notice title={C.refunded.title} body={C.refunded.body}><ContactLink /></Notice>
    } else if (state === "opened") {
      action =
        identity && pass.redeemedBy === identity.id ? (
          <Notice title={C.alreadyYours.title}>
            <div className={styles.actions}>
              <Link href="/dashboard" className={form.buttonSolid}>
                {C.alreadyYours.button}
              </Link>
            </div>
          </Notice>
        ) : (
          <Notice title={C.openedElsewhere.title} body={C.openedElsewhere.body}><ContactLink /></Notice>
        )
    } else if (state === "expired") {
      action = <Notice title={C.expired.title} body={C.expired.body}><ContactLink /></Notice>
    } else if (!identity) {
      action = (
        <div className={styles.stack}>
          <p className={styles.noticeBody}>{C.signedOut.body}</p>
          <div className={styles.actions}>
            <Link href={`/signup?next=${encodeURIComponent(back)}`} className={form.buttonSolid}>
              {C.signedOut.create}
            </Link>
            <Link href={`/login?next=${encodeURIComponent(back)}`} className={form.buttonOutline}>
              {C.signedOut.signIn}
            </Link>
          </div>
        </div>
      )
    } else {
      const access = await getAccessForUser(identity.id)
      action =
        access.subscriptionMonth > 0 && access.source !== "registered" ? (
          <Notice title={C.hasAccess.title} body={C.hasAccess.body} />
        ) : (
          <div className={styles.stack}>
            <p className={styles.noticeBody}>{C.signedIn.body(identity.email)}</p>
            <div className={styles.actions}>
              <OpenGiftButton code={pass.code} label={C.signedIn.button} />
            </div>
          </div>
        )
    }

    body = (
      <div className={styles.stack}>
        {summary}
        {action}
      </div>
    )
  }

  return (
    <div className={form.shell}>
      <section className={form.masthead} data-section="masthead">
        <div className={form.page}>
          <h1 className={form.mastheadTitle}>
            {C.masthead.title} <em>{C.masthead.titleAccent}</em>
          </h1>
          <p className={form.standfirst}>{C.masthead.standfirst}</p>
        </div>
      </section>
      <section className={form.section} data-section="open">
        <div className={form.page}>
          <div className={form.panelColumn}>
            <div className={form.panel}>{body}</div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ContactLink() {
  return (
    <p className={styles.noticeBody}>
      <Link href="/contact" className={styles.inlineLink}>
        {C.contact}
      </Link>
    </p>
  )
}
