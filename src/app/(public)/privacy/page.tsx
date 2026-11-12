import type { Metadata } from "next"
import Link from "next/link"
import { LegalFde } from "@/components/marketing/legal-fde/legal-fde"
import { ENABLE_CAPSTONE_HAND_IN } from "@/lib/config"

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
  // Capstone marking (bead gwth-launch-9289.11) is described only once
  // hand-ins are open, as section 9; the sections after it move down one.
  // Section 8 stays "Age and privacy" (bible audience-by-purpose).
  const marking = ENABLE_CAPSTONE_HAND_IN
  const after = marking ? 1 : 0
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
        {/* Course protection (bead gwth-launch-735c), from the draft in
            GWTH-launch-plan research/2026-09-27_content-protection.md, written
            by the latest Astra and polished and checked by the latest Sol,
            12 Nov 2026. Every statement is enforced in code: the records in
            migration 033 (content_access_events), the check in
            src/lib/protection/monitor.ts, the hold and "only a person
            suspends" in store.ts and month-hold.ts, the alerts in alerts.ts,
            and deletion after 90 days and 12 months in purgeOldProtectionRecords
            (the 15-minute cron). No watermark, challenge or device limit
            exists, so none is described. A solicitor confirms it before GO
            LIVE. */}
        <li id="course-protection" data-testid="privacy-course-protection">
          <strong>Course protection:</strong>{" "}When you open a lesson while
          signed in, our server records which lesson you open, when you open
          it, whether it is your first opening, how many video, audio and
          picture links it provides, your IP address and the country it
          indicates, and your browser details. We also record attempts to open
          lessons your account cannot yet access. We store these records in our
          own database.
          <p>
            We use this information to detect and stop bulk copying, scraping,
            other automated access and account sharing. Our lawful basis is
            legitimate interests in protecting the course content and service
            and preventing fraud and account sharing.
          </p>
          <p>
            An automatic check looks for many new lessons opened within
            minutes, lessons left after a small fraction of their reading time,
            timing so regular it looks like a script, many attempts to open
            locked lessons, and use from many browsers or networks. Going back
            over lessons you have already opened never counts towards the
            check. We never judge an account on its IP address alone, because
            people in an office may share one.
          </p>
          <p>
            If the check flags your account, it automatically holds your next
            course month for a person at GWTH to review, usually within a day.
            You keep full use of your current month, with pass time paused or
            your next monthly payment waiting. A notice on your course page
            explains that a quick check is happening and includes a contact
            link. We send an alert to our team through email, Slack and
            Telegram, containing your account&apos;s email address and what the
            check found.
          </p>
          <p>
            A person decides whether to clear the hold or suspend your course
            access. If cleared, your next month opens and your time restarts
            once its other opening conditions are met. During suspension,
            course lessons are unavailable until access is reinstated, no
            monthly payments are taken, and your account and the free labs
            remain available. You can contest a hold or suspension through our{" "}
            <Link href="/contact">contact form</Link>, and a person will review
            it again. You also have the right to object to this use of your
            information through the contact form, as explained in section 6.
          </p>
          <p>
            We keep lesson-opening records, including attempts to open locked
            lessons, for 90 days, then delete them. We keep a record of a check
            for 12 months after it is resolved, then delete it. These periods
            do not extend the account-deletion period in section 4.
          </p>
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
          Detect and stop bulk copying, scraping, other automated access,
          fraud and account sharing, using the course-protection checks
          described in section 1.
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
          <strong>Service providers:</strong>{" "}We use third-party services
          for hosting, email delivery, payment processing and delivery of
          course-protection alerts to our team by email, Slack and Telegram,
          as described in section 1.
        </li>
        {marking && (
          <li>
            <strong>AI marking:</strong>{" "}OpenAI and Anthropic mark the
            capstone projects you hand in. Section 9 explains what they
            receive.
          </li>
        )}
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
        We retain personal data for as long as your account is active or as
        needed to provide our services, except where this policy states a
        specific retention period. The periods for course-protection records
        are set out in section 1 and apply even while your account remains
        active. If you delete your account, we delete or anonymise your
        personal data within 30 days, except where we are required to retain
        it for legal or regulatory purposes.
      </p>
      {marking && (
        <p>
          Section 9 explains how long we keep your capstone hand-ins and
          drafts.
        </p>
      )}

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
        <li>
          Withdraw consent at any time where we rely on consent to process
          your data.
        </li>
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

      {marking && <CapstoneMarking />}

      <h2>{`${9 + after}. Third-party links`}</h2>
      <p>
        Our site may contain links to third-party websites and services. We
        are not responsible for the privacy practices of those third
        parties. We encourage you to read their privacy policies before
        providing any personal information.
      </p>

      <h2>{`${10 + after}. Changes to this policy`}</h2>
      <p>
        We may update this privacy policy from time to time. We will notify
        you of any material changes by posting the new policy on this page
        and updating the &quot;Last updated&quot; date.
      </p>

      <h2>{`${11 + after}. Contact us`}</h2>
      <p>
        If you have any questions about this privacy policy or our data
        practices, please{" "}
        <Link href="/contact">contact us through our website</Link>.
      </p>
    </LegalFde>
  )
}

/**
 * Section 9, shown only while ENABLE_CAPSTONE_HAND_IN is on (bead
 * gwth-launch-9289.11, decisions 7a and 7b on bead gwth-launch-9289). Every
 * statement here is enforced in code: redaction and the tick in
 * src/lib/capstones/preview.ts and confirmDraft, the random hand-in id in
 * newHandInId, the recording kept from markers in getHandInForMarking, and
 * deletion in src/lib/data/capstone-retention.ts (12 months after final,
 * drafts after 30 days, early deletion on request). Change them together.
 */
function CapstoneMarking() {
  return (
    <>
      <h2>9. Marking your capstone projects</h2>
      <p>
        We use AI to mark your capstone projects. Here&apos;s what happens to
        the work you hand in.
      </p>
      <ul>
        <li>
          <strong>What we send:</strong>{" "}Before you hand in your work, we
          replace private details in your files and four short answers with
          labels. These include names, email addresses, phone numbers and
          similar details. You preview exactly what will be sent and tick a
          box to confirm. We send only these versions of your files and
          answers, along with our marking guide.
        </li>
        <li>
          <strong>Who marks it:</strong>{" "}Two AI services mark each hand-in
          separately, one provided by OpenAI and one by Anthropic. If their
          marks disagree, or a mark is close to the boundary between two
          grades, a person at GWTH checks it.
        </li>
        <li>
          <strong>What they see:</strong>{" "}We send your work under a random
          hand-in ID. We never send your name, email address or GWTH account
          details. If you include a recording, it&apos;s never sent to an AI
          service.
        </li>
        <li>
          <strong>How OpenAI and Anthropic use it:</strong>{" "}They process
          your hand-in on our behalf under data processing agreements with
          us. This means they act as our data processors. They use your work
          only to mark it, not to train their AI models. Processing may happen
          in the United States, with the safeguards UK data protection law
          requires.
        </li>
        <li>
          <strong>How long we keep it:</strong>{" "}We keep the files you hand
          in, your four answers and any recording for 12 months after your
          mark is final, then delete them. We keep your mark and feedback.
          Drafts you prepare but never hand in are deleted after 30 days.
        </li>
        <li>
          <strong>Deleting it sooner:</strong>{" "}You can ask for earlier
          deletion through our{" "}
          <Link href="/contact">contact form</Link>. We keep your mark and
          feedback. If your mark isn&apos;t final yet, deleting your hand-in
          means we can&apos;t finish checking it.
        </li>
      </ul>
    </>
  )
}
