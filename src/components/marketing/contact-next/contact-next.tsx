import Link from "next/link"
import { ContactForm } from "@/components/contact/contact-form"
import p from "@/components/marketing/paper/paper.module.css"
import { Reveal } from "@/components/marketing/start-here-next/reveal"
import styles from "./form-page.module.css"

/**
 * `/contact` in the family look (19 Nov 2026, the Fable public pages round):
 * the words on the left, the form on the right, and under the words the pages
 * that answer the most common questions straight away.
 *
 * The form is `ContactForm`, imported untouched: same fields, same validation,
 * same call to `/api/contact`, same "Message sent!" state.
 *
 * No reply time is promised, because none is promised anywhere we can check
 * (launch readiness review, 2026-10-20); the page only says how we reply. The
 * walkthrough line is for visitors who arrive from "Book a walkthrough" on the
 * organisations page. No email address is printed: all contact goes through
 * the form.
 */

export const QUICK_LINKS: readonly { href: string; title: string; body: string }[] = [
  {
    href: "/pricing#questions",
    title: "Prices, refunds and cancelling",
    body: "The pricing page answers the common questions about paying.",
  },
  {
    href: "/gift",
    title: "Giving the course as a gift",
    body: "How a gift works, and where to open one with its code.",
  },
  {
    href: "/for-organisations",
    title: "Teams and organisations",
    body: "Places for a team, or a version of the course for a professional body or large employer.",
  },
]

function Arrow() {
  return (
    <svg
      className={styles.arrow}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function ContactNext() {
  return (
    <div className={p.shell}>
      <section className={styles.hero} data-section="masthead">
        <div className={p.page}>
          <div className={styles.grid}>
            <div className={styles.head}>
              <h1 className={styles.title}>
                Get in <em>touch</em>
              </h1>
              <p className={styles.lead}>
                Have a question about the course, a gift, team pricing or
                anything else? Send us a message and we&apos;ll reply by email.
              </p>
              <p className={styles.lead}>
                If you&apos;d like us to show your organisation how the course
                works, ask in your message. GWTH is based in the United
                Kingdom.
              </p>
            </div>

            <div className={styles.form} data-section="form">
              <ContactForm />
            </div>

            <Reveal className={styles.more} data-section="quick-answers">
              <h2 className={styles.moreTitle}>You may find your answer here</h2>
              <ul className={styles.links}>
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className={styles.linkTitle}>{link.title}</span>
                      <Arrow />
                      <span className={styles.linkBody}>{link.body}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
