import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "GWTH.ai Terms and Conditions — the rules and guidelines for using our platform and services.",
}

/**
 * Terms and Conditions page.
 * Stealth mode: no physical address, no personal names, contact via form only.
 */
export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none p-8 md:p-12">
            <h1>Terms and Conditions</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: 25 February 2026
            </p>

            <p>
              These Terms and Conditions (&quot;Terms&quot;) govern your use of the
              GWTH.ai website and services (&quot;Services&quot;) provided at{" "}
              <Link href="/" className="text-primary hover:underline">
                gwth.ai
              </Link>
              . By accessing or using our Services, you agree to be bound by
              these Terms. If you do not agree, please do not use our Services.
            </p>

            {/* Table of Contents */}
            <nav aria-label="Table of contents">
              <h2>Table of Contents</h2>
              <ol>
                <li><a href="#services">Our Services</a></li>
                <li><a href="#ip">Intellectual Property</a></li>
                <li><a href="#representations">User Representations</a></li>
                <li><a href="#registration">Account Registration</a></li>
                <li><a href="#purchases">Purchases and Payment</a></li>
                <li><a href="#subscriptions">Subscriptions</a></li>
                <li><a href="#prohibited">Prohibited Activities</a></li>
                <li><a href="#content">User-Generated Content</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#termination">Termination</a></li>
                <li><a href="#governing-law">Governing Law</a></li>
                <li><a href="#disputes">Dispute Resolution</a></li>
                <li><a href="#disclaimer">Disclaimer</a></li>
                <li><a href="#liability">Limitation of Liability</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ol>
            </nav>

            <h2 id="services">1. Our Services</h2>
            <p>
              GWTH.ai provides an online learning platform offering courses,
              lessons, labs, quizzes, and related educational content focused on
              applied AI skills. Our Services include:
            </p>
            <ul>
              <li>Access to course materials, video content, and interactive labs.</li>
              <li>Progress tracking, skill scoring, and certification.</li>
              <li>The GWTH Tech Radar — a daily-updated directory of AI tools.</li>
              <li>Team administration features for group subscriptions.</li>
            </ul>

            <h2 id="ip">2. Intellectual Property</h2>
            <p>
              All content on GWTH.ai — including course materials, videos, text,
              graphics, logos, assessments, and the Tech Radar — is the
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
              <li>Reverse-engineer, decompile, or extract our scoring algorithms.</li>
              <li>Remove any copyright or proprietary notices.</li>
            </ul>

            <h2 id="representations">3. User Representations</h2>
            <p>By using our Services, you represent and warrant that:</p>
            <ul>
              <li>You are at least 13 years of age.</li>
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

            <h2 id="registration">4. Account Registration</h2>
            <p>
              To access certain features, you must create an account. You are
              responsible for maintaining the confidentiality of your login
              credentials and for all activity under your account. You agree to
              notify us immediately of any unauthorised use.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these Terms or are inactive for an extended period, with reasonable
              notice.
            </p>

            <h2 id="purchases">5. Purchases and Payment</h2>
            <p>
              Payments are processed securely through our third-party payment
              provider. All prices are displayed in US Dollars (USD) unless
              otherwise stated. You agree to provide current, complete, and
              accurate payment information.
            </p>
            <p>
              We reserve the right to refuse or cancel any order at our
              discretion. If we cancel an order after payment has been taken, we
              will issue a full refund.
            </p>

            <h2 id="subscriptions">6. Subscriptions</h2>
            <p>
              Our course is offered as a monthly subscription. By subscribing,
              you authorise us to charge your payment method on a recurring
              monthly basis until you cancel.
            </p>
            <ul>
              <li>
                <strong>Cancellation:</strong> You may cancel your subscription
                at any time. Cancellation takes effect at the end of the current
                billing period — you retain access until then.
              </li>
              <li>
                <strong>No lock-in:</strong> There is no minimum commitment
                period, no cancellation fee, and no penalty for leaving.
              </li>
              <li>
                <strong>Grace period:</strong> If a payment fails, you have a
                14-day grace period to update your payment details before access
                is suspended.
              </li>
              <li>
                <strong>Price changes:</strong> We will give you at least 30
                days&apos; notice of any price changes. Existing subscribers will
                be honoured at their current rate for the remainder of their
                course period.
              </li>
            </ul>

            <h2 id="prohibited">7. Prohibited Activities</h2>
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

            <h2 id="content">8. User-Generated Content</h2>
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

            <h2 id="privacy">9. Privacy Policy</h2>
            <p>
              Your use of our Services is also governed by our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your personal
              information. By using our Services, you consent to the data
              practices described in the Privacy Policy.
            </p>

            <h2 id="termination">10. Termination</h2>
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

            <h2 id="governing-law">11. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of England and Wales. Any disputes arising from these Terms
              will be subject to the exclusive jurisdiction of the courts of
              England and Wales.
            </p>

            <h2 id="disputes">12. Dispute Resolution</h2>
            <p>
              If you have a dispute with us, we encourage you to{" "}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>{" "}
              first so we can try to resolve it informally. If we cannot resolve
              the dispute informally within 30 days, either party may pursue
              formal proceedings in accordance with the governing law above.
            </p>

            <h2 id="disclaimer">13. Disclaimer</h2>
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

            <h2 id="liability">14. Limitation of Liability</h2>
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

            <h2 id="contact">15. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please{" "}
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
