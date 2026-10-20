import type { Metadata } from "next"
import Link from "next/link"
import { LegalFde } from "@/components/marketing/legal-fde/legal-fde"

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "GWTH.ai privacy policy: how we collect, use, and protect your personal data.",
}

/**
 * Privacy Policy page in the FDE journal register.
 * Stealth mode: no physical address, no personal names, contact via form only. *
 * Keep the explicit {" "} after a bold label: the build drops the leading
 * space of a text node that holds an HTML entity such as &apos;, and the
 * page then read "Price changes:We" (launch readiness review, 2026-10-20).
 */
export default function PrivacyPage() {
  return (
    <LegalFde title="Privacy policy" updated="1 December 2026">
      <p>
        This privacy policy describes how GWTH.ai (&quot;we&quot;, &quot;us&quot;, or
        &quot;our&quot;) collects, uses, and protects your personal information when
        you use our website and services at <Link href="/">gwth.ai</Link>.
      </p>

      <h2>1. Information we collect</h2>

      <h3>Information you provide directly</h3>
      <ul>
        <li>
          <strong>Account information:</strong> name and email address
          when you create an account or join our waitlist, and a password
          if you create an account with one.
        </li>
        <li>
          <strong>Contact form submissions:</strong> name, email address,
          and message content when you contact us through our website.
        </li>
        <li>
          <strong>Course activity:</strong> lesson progress, quiz answers
          and results, lab completions, notes, and bookmarks.
        </li>
        <li>
          <strong>Payment information:</strong>{" "}Stripe securely processes your
          billing details. We don&apos;t see or store your full card details.
        </li>
        <li>
          <strong>Gifts:</strong>{" "}We collect the recipient&apos;s name
          and email address and your message when you buy a gift. We use
          them only to send and manage that gift. If you receive a gift, the
          buyer gave us your name and email address for this purpose.
        </li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Usage data:</strong> pages visited, features used, time
          spent on lessons, and general interaction patterns.
        </li>
        <li>
          <strong>How you move through a lesson:</strong> which parts you
          open, when you continue, your answers to the check questions,
          whether you play the audio or video, when you switch between
          watching and reading, and any feedback you give, such as saying a
          part confused you or rating a lesson. We keep this in our own
          database, linked to your account, to improve the lessons. We do not
          share it with advertising or analytics companies, and it uses no
          cookies beyond the one that keeps you signed in.
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

      <h2>2. How we use your information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve our services.</li>
        <li>Track your learning progress and completion evidence.</li>
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

      <h2>3. How we share your information</h2>
      <p>
        We do not sell your personal information. We may share your
        information only in the following circumstances:
      </p>
      <ul>
        <li>
          <strong>Service providers:</strong> third-party services that
          help us operate (hosting, email delivery and payment processing).
          These providers are contractually obligated to
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
          share your information.
        </li>
      </ul>

      <h2>4. Data retention</h2>
      <p>
        We retain your personal data for as long as your account is active
        or as needed to provide our services. If you delete your account,
        we will delete or anonymise your personal data within 30 days,
        except where we are required to retain it for legal or regulatory
        purposes.
      </p>

      <h2>5. Data security</h2>
      <p>
        We implement appropriate technical and organisational measures to
        protect your personal data against unauthorised access, alteration,
        disclosure, or destruction. However, no method of transmission over
        the internet is 100% secure, and we cannot guarantee absolute
        security.
      </p>

      <h2>6. Your rights</h2>
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
        <Link href="/contact">contact us through our website</Link>.
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use only essential cookies, which keep you signed in. Your
        choice of light or dark mode is saved in your browser on your
        device, not in a cookie. We count visits with Plausible Analytics,
        which we run on our own server. It uses no cookies and does not
        identify you. You can control cookie settings in your browser.
      </p>

      {/* Bible audience-by-purpose (David, 2026-10-20). One of the four
          places the age is stated; change all four together. */}
      <h2>8. Age and privacy</h2>
      <p>
        GWTH is for anyone aged 16 or over. We do not knowingly collect
        personal information from anyone under 16. If we discover that we
        have, we will delete it promptly. Your data protection rights belong
        to you, even when someone else holds your account. You can ask us to
        access or delete your personal information. If someone makes a
        request on your behalf, we will check that they are authorised to act
        for you.
      </p>

      <h2>9. Third-party links</h2>
      <p>
        Our site may contain links to third-party websites and services. We
        are not responsible for the privacy practices of those third
        parties. We encourage you to read their privacy policies before
        providing any personal information.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this privacy policy from time to time. We will notify
        you of any material changes by posting the new policy on this page
        and updating the &quot;Last updated&quot; date. Your continued use of our
        services after changes constitutes acceptance of the updated
        policy.
      </p>

      <h2>11. Contact us</h2>
      <p>
        If you have any questions about this privacy policy or our data
        practices, please{" "}
        <Link href="/contact">contact us through our website</Link>.
      </p>
    </LegalFde>
  )
}
