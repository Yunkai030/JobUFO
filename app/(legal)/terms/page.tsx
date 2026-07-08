import type { Metadata } from 'next'
import { LEGAL } from '@/lib/legal/config'

export const metadata: Metadata = {
  title: 'Terms of Service — InterviewMirror',
  description: 'The terms governing your use of InterviewMirror.',
}

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>
        <strong>Last updated: {LEGAL.effectiveDate}</strong>
      </p>
      <p>
        These Terms govern your use of {LEGAL.appName} (the &ldquo;Service&rdquo;), operated by{' '}
        {LEGAL.legalEntity}. By creating an account or using the Service, you agree to these Terms. If
        you do not agree, do not use the Service.
      </p>

      <h2>1. The service</h2>
      <p>
        {LEGAL.appName} provides tools to build resumes, analyze them against job descriptions,
        prepare for interviews, and track job applications, including AI-generated content.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You must provide accurate information and are responsible for keeping your account credentials
        secure and for all activity under your account. You must be at least 16 years old to use the
        Service.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for unlawful purposes or to upload others&rsquo; data without permission.</li>
        <li>Attempt to disrupt, reverse-engineer, scrape, or overload the Service or its AI features.</li>
        <li>Resell or redistribute the Service without our written permission.</li>
      </ul>

      <h2>4. AI output &mdash; important disclaimer</h2>
      <p>
        The Service uses AI to generate scores, suggestions, interview questions, and feedback. This
        output is provided <strong>for guidance and informational purposes only</strong>. It may be
        inaccurate or incomplete, does not constitute professional, career, or legal advice, and{' '}
        <strong>
          {LEGAL.appName} does not guarantee any particular result, including interview success or
          employment
        </strong>
        . You are responsible for reviewing and deciding how to use any output.
      </p>

      <h2>5. Subscriptions &amp; billing</h2>
      <ul>
        <li>
          Paid plans (&ldquo;Pro&rdquo;) are billed in advance on a recurring basis (monthly or
          yearly) through our payment processor, Stripe.
        </li>
        <li>
          Your subscription <strong>renews automatically</strong> until you cancel. You can cancel any
          time from the billing page; cancellation takes effect at the end of the current billing
          period.
        </li>
        <li>
          Except where required by law, payments are non-refundable and we do not provide refunds for
          partial periods.
        </li>
        <li>We may change pricing with reasonable notice; changes apply to future billing periods.</li>
      </ul>

      <h2>6. Your content</h2>
      <p>
        You retain ownership of the content you create (resumes, notes, etc.). You grant us a limited
        license to store and process it solely to provide the Service to you (see our{' '}
        <a href="/privacy">Privacy Policy</a>). You are responsible for the content you submit.
      </p>

      <h2>7. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. We may suspend or
        terminate access if you violate these Terms or to protect the Service. On termination, your
        right to use the Service ends.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        The Service is provided <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong>{' '}
        without warranties of any kind, whether express or implied, including merchantability, fitness
        for a particular purpose, and non-infringement. We do not warrant that the Service will be
        uninterrupted, error-free, or that AI output will be accurate.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {LEGAL.legalEntity} will not be liable for any
        indirect, incidental, special, or consequential damages, or for lost opportunities or
        employment, arising from your use of the Service. Our total liability for any claim is limited
        to the amount you paid us in the 12 months before the claim. Nothing in these Terms excludes
        rights that cannot be excluded under applicable consumer law.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of {LEGAL.governingLaw}, without regard to conflict-of-law
        rules.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these Terms from time to time. Material changes will be reflected by updating the
        date above. Continued use after changes means you accept the updated Terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms? Email{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </>
  )
}
