import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "GWTH.ai Privacy Policy — how we collect, use, and protect your personal data.",
}

/**
 * Privacy Policy page.
 * Stealth mode: no physical address, no personal names, contact via form only.
 */
export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none p-8 md:p-12">
            <h1>Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: 25 February 2026
            </p>

            <p>
              This Privacy Policy describes how GWTH.ai (&quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;) collects, uses, and protects your personal information when
              you use our website and services at{" "}
              <Link href="/" className="text-primary hover:underline">
                gwth.ai
              </Link>
              .
            </p>

            <h2>1. Information We Collect</h2>

            <h3>Information you provide directly</h3>
            <ul>
              <li>
                <strong>Account information:</strong> name, email address, and
                password when you create an account or join our waitlist.
              </li>
              <li>
                <strong>Contact form submissions:</strong> name, email address,
                and message content when you contact us through our website.
              </li>
              <li>
                <strong>Course activity:</strong> lesson progress, quiz answers
                and scores, lab completions, notes, and bookmarks.
              </li>
              <li>
                <strong>Payment information:</strong> billing details processed
                securely through our third-party payment provider. We do not
                store your full card details.
              </li>
            </ul>

            <h3>Information collected automatically</h3>
            <ul>
              <li>
                <strong>Usage data:</strong> pages visited, features used, time
                spent on lessons, and general interaction patterns.
              </li>
              <li>
                <strong>Device information:</strong> browser type, operating
                system, screen resolution, and device identifiers.
              </li>
              <li>
                <strong>Log data:</strong> IP address, access times, and
                referring URLs.
              </li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services.</li>
              <li>
                Track your learning progress and generate skill scores.
              </li>
              <li>
                Send you service-related communications (account confirmation,
                password resets, course updates).
              </li>
              <li>
                Send you marketing communications if you have opted in (you can
                unsubscribe at any time).
              </li>
              <li>Respond to your enquiries and support requests.</li>
              <li>
                Detect, prevent, and address technical issues and security
                threats.
              </li>
              <li>
                Analyse usage patterns to improve the course content and user
                experience.
              </li>
            </ul>

            <h2>3. How We Share Your Information</h2>
            <p>
              We do not sell your personal information. We may share your
              information only in the following circumstances:
            </p>
            <ul>
              <li>
                <strong>Service providers:</strong> third-party services that
                help us operate (hosting, email delivery, payment processing,
                analytics). These providers are contractually obligated to
                protect your data.
              </li>
              <li>
                <strong>Legal requirements:</strong> when required by law, court
                order, or governmental authority.
              </li>
              <li>
                <strong>Business transfers:</strong> in connection with a merger,
                acquisition, or sale of assets, with notice to you.
              </li>
              <li>
                <strong>With your consent:</strong> when you explicitly agree to
                share your information (e.g. making your skill scores publicly
                verifiable).
              </li>
            </ul>

            <h2>4. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active
              or as needed to provide our services. If you delete your account,
              we will delete or anonymise your personal data within 30 days,
              except where we are required to retain it for legal or regulatory
              purposes.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to
              protect your personal data against unauthorised access, alteration,
              disclosure, or destruction. However, no method of transmission over
              the internet is 100% secure, and we cannot guarantee absolute
              security.
            </p>

            <h2>6. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to:
            </p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Object to or restrict processing of your data.</li>
              <li>Request a portable copy of your data.</li>
              <li>Withdraw consent at any time.</li>
            </ul>
            <p>
              To exercise any of these rights, please{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact us through our website
              </Link>
              .
            </p>

            <h2>7. Cookies</h2>
            <p>
              We use essential cookies to keep you logged in and remember your
              preferences (such as light/dark mode). We may use analytics cookies
              to understand how our site is used. You can control cookie settings
              in your browser.
            </p>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed at children under the age of 13. We
              do not knowingly collect personal information from children under
              13. If we become aware that we have collected data from a child
              under 13, we will delete it promptly.
            </p>

            <h2>9. Third-Party Links</h2>
            <p>
              Our site may contain links to third-party websites and services. We
              are not responsible for the privacy practices of those third
              parties. We encourage you to read their privacy policies before
              providing any personal information.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of any material changes by posting the new policy on this page
              and updating the &quot;Last updated&quot; date. Your continued use of our
              services after changes constitutes acceptance of the updated
              policy.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data
              practices, please{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact us through our website
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
