import type { Metadata } from "next"
import Link from "next/link"
import { LegalFde } from "@/components/marketing/legal-fde/legal-fde"

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
      <p>
        Your subscription grants you a personal, non-transferable,
        non-exclusive licence to access and use the content for your own
        learning purposes. You may not:
      </p>
      <ul>
        <li>Copy, reproduce, or distribute course content.</li>
        <li>Use content for commercial training without a team licence.</li>
        <li>Reverse-engineer, decompile, or extract platform logic.</li>
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
        We reserve the right to suspend or terminate accounts that violate
        these Terms or are inactive for an extended period, with reasonable
        notice.
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
        payment method once a month until you cancel. Each payment opens the
        next month of the course. After your third monthly payment for the
        course, the monthly price drops to the lower price shown on our
        pricing page. This payment keeps your lessons up to date.
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
          until then.
        </li>
        <li>
          <strong>Months not yet available:</strong> If the next month of the
          course is not ready when your next payment is due, we will not
          take that payment until the month opens.
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
          year of purchase. The date is shown on the gift email and the gift
          card. Your course time starts when you open the pass, not when it is
          bought. Anyone with the code can open the pass, so please keep it
          safe.
        </li>
        <li>
          <strong>Months not yet available:</strong> If Month 2 or Month 3 is
          not ready when you reach it, your course time is paused until it
          opens, so you receive the full length of your pass.
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

      <h2 id="prohibited">8. Prohibited activities</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Share your account credentials with others.</li>
        <li>
          Systematically download, scrape, or extract course content.
        </li>
        <li>
          Use automated tools (bots, scrapers) to access our Services.
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

      <h2 id="content">9. User-generated content</h2>
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

      <h2 id="privacy">10. Privacy policy</h2>
      <p>
        Your use of our Services is also governed by our{" "}
        <Link href="/privacy">Privacy policy</Link>, which describes how we
        collect, use, and protect your personal information. By using our
        Services, you consent to the data practices described in the Privacy
        Policy.
      </p>

      <h2 id="termination">11. Termination</h2>
      <p>
        We may terminate or suspend your access to our Services
        immediately, without prior notice, if you breach these Terms. Upon
        termination:
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

      <h2 id="governing-law">12. Governing law</h2>
      <p>
        These Terms are governed by and construed in accordance with the
        laws of England and Wales. Any disputes arising from these Terms
        will be subject to the exclusive jurisdiction of the courts of
        England and Wales.
      </p>

      <h2 id="disputes">13. Dispute resolution</h2>
      <p>
        If you have a dispute with us, we encourage you to{" "}
        <Link href="/contact">contact us</Link> first so we can try to
        resolve it informally. If we cannot resolve the dispute informally
        within 30 days, either party may pursue formal proceedings in
        accordance with the governing law above.
      </p>

      <h2 id="disclaimer">14. Disclaimer</h2>
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

      <h2 id="liability">15. Limitation of liability</h2>
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

      <h2 id="contact">16. Contact us</h2>
      <p>
        If you have any questions about these Terms, please{" "}
        <Link href="/contact">contact us through our website</Link>.
      </p>
    </LegalFde>
  )
}
