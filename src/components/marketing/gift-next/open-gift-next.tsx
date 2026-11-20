import Link from "next/link"
import { formatUkDate, normalisePassCode } from "@/lib/billing/passes"
import { getPassByCode, passOpenability } from "@/lib/billing/pass-store"
import { getAccessForUser } from "@/lib/billing/access"
import { OpenGiftButton } from "@/components/marketing/gift/open-gift-button"
import { GiftCodeForm } from "@/components/marketing/gift/gift-code-form"
import { OPEN_COPY as C } from "@/components/marketing/gift/gift-copy"
import form from "@/components/marketing/contact-fde/contact-fde.module.css"
import styles from "@/components/marketing/gift/gift.module.css"
import p from "@/components/marketing/paper/paper.module.css"
import { SmallPagesPlate } from "@/components/marketing/start-here-next/plate"
import { GIFT_PICTURE_ALT } from "./gift-next"
import frame from "./gift-next.module.css"

/**
 * `/gift/open` in the family look (19 Nov 2026, the Fable public pages
 * round). ONLY THE FRAME IS NEW: the headline and the panel now sit beside
 * the gift picture instead of under a tinted band.
 *
 * Everything inside the panel is copied line for line from
 * `gift/open-gift-page.tsx`, because that file builds the panel and its frame
 * in one function and the frame could not be changed without editing it: the
 * code box, the lost-code help, what the gift is and who it is from, and every
 * state (not found, refunded, opened here, opened elsewhere, expired, signed
 * out, signed in, already has the course). The words are `OPEN_COPY`'s and the
 * inner styles are `gift/gift.module.css`'s, both imported. Opening is still
 * the POST to /api/passes/open in `OpenGiftButton`; this page only reads.
 *
 * If `gift/open-gift-page.tsx` changes, make the same change here.
 */

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

/** The code box, then where to find a lost code (with Contact linked). */
function CodeForm({ value, error }: { value?: string; error?: string }) {
  return (
    <div className={styles.stack}>
      <GiftCodeForm value={value} error={error} />
      <p className={styles.hint} data-testid="gift-lost-code">
        {C.lostCode.lead}{" "}
        <Link href="/contact" className={styles.inlineLink}>
          {C.lostCode.link}
        </Link>
        .
      </p>
    </div>
  )
}

export async function OpenGiftNext({ rawCode, identity }: { rawCode: string | null; identity: Identity }) {
  // rawCode is null when no code was sent, and "" when the box was sent empty.
  const code = rawCode ? normalisePassCode(rawCode) : null
  const pass = code ? await getPassByCode(code).catch(() => null) : null
  const back = code ? `/gift/open?code=${encodeURIComponent(code)}` : "/gift/open"

  let body: React.ReactNode
  if (rawCode === null) {
    body = <CodeForm />
  } else if (!rawCode) {
    body = <CodeForm error={C.enter.empty} />
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
    <div className={p.shell}>
      <section className={`${frame.hero} ${frame.heroEnd}`} data-section="masthead">
        <div className={p.page}>
          <div className={frame.heroGrid}>
            <div>
              <h1 className={frame.heroTitle}>
                {C.masthead.title} <em>{C.masthead.titleAccent}</em>
              </h1>
              <p className={frame.heroLead}>{C.masthead.standfirst}</p>
              <div className={frame.heroPanel} data-section="open">
                <div className={form.panel}>{body}</div>
              </div>
            </div>
            <figure className={`${p.plate} ${frame.heroPicture}`}>
              <SmallPagesPlate
                name="gift"
                alt={GIFT_PICTURE_ALT}
                sizes="(max-width: 1023px) 100vw, 540px"
                priority
              />
            </figure>
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
