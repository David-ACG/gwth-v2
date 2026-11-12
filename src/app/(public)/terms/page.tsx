import type { Metadata } from "next"
import Link from "next/link"
import { LegalFde } from "@/components/marketing/legal-fde/legal-fde"
import { LATER_MONTHS_OPEN } from "@/components/marketing/data"
import { DEFAULT_GATE_PERCENT } from "@/lib/protection/month-hold"

/** The course gate's completion share (bead gwth-launch-735c), from the gate itself. */
const SHARE = `${DEFAULT_GATE_PERCENT}%`

export const metadata: Metadata = {
  title: "Terms and conditions",
  description:
    "GWTH.ai terms and conditions: the rules and guidelines for using our platform and services.",
}

/**
 * Terms and Conditions page in the FDE journal register.
 * Stealth mode: no physical address, no personal names, contact via form only. *
 * Keep the explicit {" "} after a bold label: the build drops the leading
 * space of a text node that holds an HTML entity such as &apos;, and the
 * page then read "Price changes:We" (launch readiness review, 2026-10-20).
 */
export default function TermsPage() {
  return (
    <LegalFde title="Terms and conditions" updated="1 December 2026">
      <p>
        These terms and conditions (&quot;Terms&quot;) govern your use of the
        GWTH.ai website and services (&quot;Services&quot;) provided at{" "}
        <Link href="/">gwth.ai</Link>. By accessing or using our Services, you
        agree to be bound by these Terms. If you do not agree, please do not
        use our Services.
      </p>

      {/* Table of Contents */}
      <nav aria-label="Table of contents">
        <h2>Table of contents</h2>
        <ol>
          <li><a href="#services">Our services</a></li>
          <li><a href="#ip">Intellectual property</a></li>
          <li><a href="#representations">User representations</a></li>
          <li><a href="#registration">Account registration</a></li>
          <li><a href="#purchases">Purchases and payment</a></li>
          <li><a href="#subscriptions">Subscriptions</a></li>
          <li><a href="#passes">Gifts and prepaid passes</a></li>
          <li><a href="#course-months">How course months open</a></li>
          <li><a href="#course-protection">Protecting the course</a></li>
          <li><a href="#prohibited">Prohibited activities</a></li>
          <li><a href="#content">User-generated content</a></li>
          <li><a href="#privacy">Privacy policy</a></li>
          <li><a href="#termination">Termination</a></li>
          <li><a href="#governing-law">Governing law</a></li>
          <li><a href="#disputes">Dispute resolution</a></li>
          <li><a href="#disclaimer">Disclaimer</a></li>
          <li><a href="#liability">Limitation of liability</a></li>
          <li><a href="#contact">Contact us</a></li>
        </ol>
      </nav>

      <h2 id="services">1. Our services</h2>
      <p>
        GWTH.ai provides an online learning platform offering courses,
        lessons, labs, quizzes, and related educational content focused on
        applied AI skills. Our Services include:
      </p>
      <ul>
        <li>Access to course materials, video content, and interactive labs.</li>
        <li>Progress tracking, assessments, and course completion records.</li>
        <li>Team administration features for group subscriptions.</li>
      </ul>

      <h2 id="ip">2. Intellectual property</h2>
      <p>
        All content on GWTH.ai (including course materials, videos, text,
        graphics, logos, assessments, and progress systems) is the
        intellectual property of GWTH.ai and is protected by copyright and
        other intellectual property laws.
      </p>
      {/* The licence (bead gwth-launch-735c): written by the latest Astra,
          polished and checked by the latest Sol, 12 Nov 2026. */}
      <p>
        Your subscription or opened pass gives you a personal,
        non-transferable, non-exclusive licence to use the course content for
        your own learning. You must not:
      </p>
      <ul>
        <li>
          Download, copy, reproduce or redistribute course content except
          through features we provide, such as a lesson&apos;s download
          button.
        </li>
        <li>Use course content for commercial training without our permission.</li>
        <li>
          Use scrapers, bots or other automated tools to access or extract
          course content.
        </li>
        <li>Share your account or its lesson links with anyone else.</li>
        <li>Reverse-engineer, decompile or extract platform logic.</li>
        <li>Remove any copyright or proprietary notices.</li>
      </ul>

      <h2 id="representations">3. User representations</h2>
      <p>By using our Services, you represent and warrant that:</p>
      <ul>
        {/* Bible audience-by-purpose (David, 2026-10-20). One of the four
            places the age is stated; change all four together. */}
        <li>
          You are aged 18 or over, or you are aged 16 or 17 and a parent or
          guardian (or your employer, if you are an apprentice or employee)
          holds your account and has agreed to these Terms.
        </li>
        <li>
          The information you provide during registration is accurate,
          complete, and current.
        </li>
        <li>
          You will not use our Services for any unlawful or unauthorised
          purpose.
        </li>
        <li>
          Your use of the Services will not violate any applicable law or
          regulation.
        </li>
      </ul>

      <h2 id="registration">4. Account registration</h2>
      <p>
        To access certain features, you must create an account. You are
        responsible for maintaining the confidentiality of your login
        credentials and for all activity under your account. You agree to
        notify us immediately of any unauthorised use.
      </p>
      <p>
        Anyone who meets the requirements in section 3 can create a free
        account. To access the course, you need a
        subscription, an opened prepaid pass or a place given by GWTH.
      </p>
      <p>
        Section 13 governs suspension and termination of access. We will not
        suspend or terminate access for inactivity while you are working
        towards the completion requirement or waiting for a month to open
        under sections 8 and 9.
      </p>

      <h2 id="purchases">5. Purchases and payment</h2>
      <p>
        Stripe processes payments securely. All prices are in pounds sterling (£). GWTH.ai
        is not registered for VAT, so no VAT is added to any price. You agree to provide current, complete and
        accurate payment information.
      </p>
      <p>
        A price offered for a limited time, such as a Christmas price, applies
        only to purchases made during the dates shown.
      </p>
      <p>
        We may refuse or cancel any order at our discretion. If we cancel an
        order after taking payment, we will refund it in full.
      </p>

      <h2 id="subscriptions">6. Subscriptions</h2>
      <p>
        You can pay for the course monthly. You authorise us to charge your
        payment method once a month until you cancel, except when a payment
        is waiting under sections 8 and 9 or your course access is suspended.
        Each of your first three payments opens one month of the course under
        those sections. After your third monthly payment for the course, the
        monthly price drops to the lower price shown on our pricing page. This
        payment keeps your lessons up to date.
      </p>
      <ul>
        <li>
          <strong>Reminders:</strong> We will email you before each payment
          with the amount and date.
        </li>
        <li>
          <strong>Cancellation:</strong> You can cancel your subscription
          online at any time in your account settings. Cancellation takes
          effect at the end of the current billing period. You keep access
          until then, subject to any suspension or termination under sections
          9 and 13.
        </li>
        <li>
          <strong>Waiting for a course month:</strong>{" "}Sections 8 and 9
          explain when a course month can open and how your next payment waits
          if it cannot.
        </li>
        <li>
          <strong>No lock-in:</strong> There is no minimum commitment
          period, cancellation fee or penalty for leaving.
        </li>
        <li>
          <strong>Grace period:</strong> If a payment fails, you have a
          14-day grace period to update your payment details before access
          is suspended.
        </li>
        <li>
          <strong>Price changes:</strong>{" "}We will give you at least 30
          days&apos; notice of any price changes. Existing subscribers will
          keep their current rate for the rest of their course period.
        </li>
      </ul>

      <h2 id="passes">7. Gifts and prepaid passes</h2>
      <p>
        A prepaid pass covers the whole course (Months 1 to 3) or the first
        month with one payment. You can buy one for yourself or as a gift
        for someone in the United Kingdom.
      </p>
      <ul>
        <li>
          <strong>No renewal:</strong> A pass is paid once and never renews.
          We never ask the person who opens a gift for payment details.
        </li>
        <li>
          <strong>Opening a pass:</strong> A pass must be opened within one
          year of purchase. The date is shown on the gift email and gift card.
          A gift&apos;s course time starts when the recipient opens it, not
          when it is bought. Section 8 explains when a pass bought for yourself
          opens. Anyone with the code can open the pass, so please keep it
          safe.
        </li>
        <li>
          <strong>Waiting for a course month:</strong>{" "}Sections 8 and 9
          explain when a course month can open and how your paid course time is
          paused if it cannot.
        </li>
        <li>
          <strong>When a pass ends:</strong> Access to the course lessons
          stops. You keep your account, progress and the free labs. We will
          email you about continuing. You are charged only if you choose to
          subscribe.
        </li>
        <li>
          <strong>Refunds:</strong> We will refund a pass in full at any time
          before it is opened. Please{" "}
          <Link href="/contact">contact us</Link> to ask. Once a pass has been
          opened, it is not refundable, except where the law requires.
        </li>
      </ul>

      {/* Sections 8 and 9 (bead gwth-launch-735c). Consumer law needs the 75%
          rule in the Terms BEFORE anyone pays, and the review hold and the
          monitoring need saying here and in the Privacy policy. Written by the
          latest Astra, polished and checked by the latest Sol, 12 Nov 2026.
          Every statement matches the code: src/lib/protection/month-hold.ts
          (latest of the three points, the review hold), passes.ts and
          subscriptions.ts (time paused, payment waits, nothing charged while
          suspended), src/lib/protection/monitor.ts (the check, first views
          only, nothing on IP alone) and store.ts (only a person suspends).
          The share is DEFAULT_GATE_PERCENT; change the Terms before
          MONTH_GATE_PERCENT. A solicitor confirms this wording before GO LIVE
          (docs/content-protection-go-live.md). */}
      <h2 id="course-months">8. How course months open</h2>
      <p>
        Month 1 opens when you make your first monthly payment or open your
        pass. A pass bought for yourself while signed in opens when you pay. A
        pass for Month 1 alone does not include Months 2 and 3.
      </p>
      <p>
        A lesson counts as finished when you complete the Finish lesson step
        at the end of that lesson in the lesson viewer. Only core lessons
        count towards the completion requirement below. Optional lessons never
        count and are never required for a later month to open.
      </p>
      <p>Each later month opens at the latest of these three points:</p>
      <ul>
        <li>
          The date it becomes available to everyone: around{" "}
          {LATER_MONTHS_OPEN.month2} for Month 2 and around{" "}
          {LATER_MONTHS_OPEN.month3} for Month 3.
        </li>
        <li>
          The date it is due to start for you: one month after your previous
          month began if you have a pass, or your next monthly payment date if
          you pay monthly.
        </li>
        <li>
          The point when you have finished {SHARE} of Month 1&apos;s core
          lessons for Month 2, or {SHARE} of Month 2&apos;s core lessons for
          Month 3.
        </li>
      </ul>
      <p>
        A course-protection hold must also be cleared under section 9 before
        the next month opens.
      </p>
      <p>
        While you wait, you keep full use of your current month. There is no
        time limit on reaching {SHARE}. If you have a prepaid pass, including a
        gift or prepaid team place, your course time is paused, so you lose
        none of it and receive a full month of each part included in your
        pass. If you pay monthly, we wait to take your next payment until that
        month can open, then take it and open the month. We never charge you
        for a month you cannot open. Your monthly plan is not cancelled while
        it waits.
      </p>
      <p>
        The completion rule helps prevent someone copying the whole course in
        a few days from one account. Each month also builds on the one before.
        We may change the required share of core lessons only after giving
        notice through these Terms before the change takes effect.
      </p>

      <h2 id="course-protection">9. Protecting the course</h2>
      <p>
        When you open a lesson while signed in, we record the lesson, the
        time, whether you have opened it before, the number of media links
        provided, your IP address and the country it indicates, and your
        browser details. We also record attempts to open lessons your account
        cannot yet access, to detect and stop bulk copying, scraping, other
        automated access and account sharing.
      </p>
      <p>
        Videos, audio and pictures use links made for your account that stop
        working after a few hours; they still play and display normally inside
        GWTH.
      </p>
      <p>
        An automatic check looks for many new lessons opened within minutes,
        lessons left after a small fraction of their reading time, timing so
        regular it looks like a script, many attempts to open locked lessons,
        and use from many browsers or networks. Going back over lessons you
        have already opened never counts towards the check. We never judge an
        account on its IP address alone, because people in an office may share
        one.
      </p>
      <p>
        If the check flags your account, your next month is held until a
        person at GWTH reviews it, usually within a day. The arrangements in
        section 8 for current-month access, paused pass time and waiting
        payments also apply during this hold. A notice on your course page
        explains that a quick check is happening and includes a contact link.
      </p>
      <p>
        The reviewer either clears the hold or decides to suspend access to
        the course lessons. If the hold is cleared, your next month opens and
        your course time restarts once the other opening conditions in section
        8 are met. Suspension is always decided by a person. During
        suspension, you cannot access course lessons until access is
        reinstated, and we take no monthly payments. You keep your account and
        access to the free labs.
      </p>
      <p>
        You can contest a hold or suspension through our{" "}
        <Link href="/contact">contact form</Link>, and a person will review it
        again. Our <Link href="/privacy">Privacy policy</Link> explains the
        information we use, alerts to our team, how long we keep records and
        your data protection rights.
      </p>

      <h2 id="prohibited">10. Prohibited activities</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Share your account credentials or lesson links with others.</li>
        <li>
          Download, copy or redistribute course content except through
          features we provide, such as a lesson&apos;s download button.
        </li>
        <li>
          Use bots, scrapers or other automated tools to access our Services or
          extract course content.
        </li>
        <li>
          Attempt to circumvent access controls or security measures.
        </li>
        <li>
          Impersonate another person or misrepresent your affiliation.
        </li>
        <li>
          Interfere with or disrupt the Services or associated
          infrastructure.
        </li>
        <li>
          Use the Services to develop a competing product or service.
        </li>
        <li>
          Upload or transmit viruses, malware, or other harmful code.
        </li>
      </ul>

      <h2 id="content">11. User-generated content</h2>
      <p>
        You may create notes, quiz answers, and other content within the
        platform. You retain ownership of content you create. By
        submitting content, you grant us a licence to store and display it
        as part of the Services (e.g. displaying your notes back to you).
      </p>
      <p>
        We do not claim ownership of your personal notes or annotations.
        You can export or delete your content at any time.
      </p>

      <h2 id="privacy">12. Privacy policy</h2>
      {/* The blanket "you consent to the data practices" sentence went (Sol,
          12 Nov 2026): course-protection monitoring relies on legitimate
          interests, not consent. */}
      <p>
        Our <Link href="/privacy">Privacy policy</Link> explains how we
        collect, use and protect your personal information and the lawful
        basis for course-protection monitoring.
      </p>

      <h2 id="termination">13. Termination</h2>
      <p>
        A person at GWTH may decide to suspend or terminate access for a
        breach of these Terms or prolonged inactivity, subject to section 4.
        We give reasonable notice unless immediate action is necessary to
        protect the course or service. Section 9 explains course-protection
        holds, suspension and how to contest them. The following consequences
        apply only to termination, not to a temporary hold or
        course-protection suspension:
      </p>
      <ul>
        <li>Your right to use the Services ceases immediately.</li>
        <li>
          We may delete your account data after a reasonable retention
          period.
        </li>
        <li>
          Any provisions of these Terms which by their nature should
          survive termination will remain in effect (including intellectual
          property, limitation of liability, and dispute resolution).
        </li>
      </ul>

      <h2 id="governing-law">14. Governing law</h2>
      <p>
        These Terms are governed by and construed in accordance with the
        laws of England and Wales. Any disputes arising from these Terms
        will be subject to the exclusive jurisdiction of the courts of
        England and Wales.
      </p>

      <h2 id="disputes">15. Dispute resolution</h2>
      <p>
        If you have a dispute with us, we encourage you to{" "}
        <Link href="/contact">contact us</Link> first so we can try to
        resolve it informally. If we cannot resolve the dispute informally
        within 30 days, either party may pursue formal proceedings in
        accordance with the governing law above.
      </p>

      <h2 id="disclaimer">16. Disclaimer</h2>
      <p>
        Our Services are provided &quot;as is&quot; and &quot;as available&quot; without
        warranties of any kind, whether express or implied, including but
        not limited to implied warranties of merchantability, fitness for a
        particular purpose, and non-infringement.
      </p>
      <p>
        We do not guarantee that the Services will be uninterrupted,
        error-free, or secure. We do not guarantee specific learning
        outcomes or employment results from completing our courses.
      </p>

      <h2 id="liability">17. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, GWTH.ai shall not be
        liable for any indirect, incidental, special, consequential, or
        punitive damages, or any loss of profits or revenues, whether
        incurred directly or indirectly, or any loss of data, use, or
        goodwill.
      </p>
      <p>
        Our total liability for any claims arising from or related to
        these Terms or the Services shall not exceed the total amount you
        have paid us in the 12 months preceding the claim.
      </p>

      <h2 id="contact">18. Contact us</h2>
      <p>
        If you have any questions about these Terms, please{" "}
        <Link href="/contact">contact us through our website</Link>.
      </p>
    </LegalFde>
  )
}
