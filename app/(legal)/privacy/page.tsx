import type { Metadata } from 'next'
import { LEGAL } from '@/lib/legal/config'

export const metadata: Metadata = {
  title: 'Privacy Policy — InterviewMirror',
  description: 'How InterviewMirror collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated: {LEGAL.effectiveDate}</strong>
      </p>
      <p>
        This Privacy Policy explains how {LEGAL.legalEntity} (&ldquo;{LEGAL.appName}&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, and protects your information when you
        use {LEGAL.appName} at {LEGAL.websiteUrl}. By using the service you agree to this policy.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — your email address and authentication details when
          you sign up.
        </li>
        <li>
          <strong>Resume &amp; career content</strong> — information you enter or upload, including
          your name, contact details, work history, education, skills, and projects. This may
          include personal information.
        </li>
        <li>
          <strong>Job descriptions and application data</strong> — content you paste or save, and
          the companies, roles, and statuses you track.
        </li>
        <li>
          <strong>Payment information</strong> — handled entirely by Stripe. We never receive or
          store your full card number; we store only a customer reference and subscription status.
        </li>
        <li>
          <strong>Usage data</strong> — basic events about how you use features (e.g. running an ATS
          check) to operate and improve the product.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To provide and operate the service (build resumes, run analyses, track applications).</li>
        <li>To process subscriptions and payments.</li>
        <li>To send you transactional emails (e.g. confirmation, account notices).</li>
        <li>To understand usage and improve features.</li>
        <li>To secure the service and prevent abuse.</li>
      </ul>

      <h2>3. AI processing</h2>
      <p>
        Core features (ATS checks, interview preparation, and camera-on practice sessions) work by sending your
        resume content and the job descriptions you provide to a third-party AI provider (Groq) for
        analysis. Only the content needed to generate your results is sent. Do not enter information
        you are not comfortable processing this way. We do not use your content to train our own
        models.
      </p>

      <h2>4. Sharing &amp; sub-processors</h2>
      <p>
        We do not sell your personal information. We share data only with service providers that help
        us run {LEGAL.appName}, under their respective terms:
      </p>
      <ul>
        {LEGAL.subprocessors.map((s) => (
          <li key={s.name}>
            <strong>{s.name}</strong> — {s.purpose}.
          </li>
        ))}
      </ul>

      <h2>5. Data retention</h2>
      <p>
        We keep your information for as long as your account is active. When you delete your account,
        we delete your associated content within a reasonable period, except where we must retain
        certain records (e.g. payment records) to comply with legal obligations.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct, export, or delete your
        personal information, and to object to or restrict certain processing. To exercise these
        rights, contact us at{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. You can also delete most of
        your content directly in the app.
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard measures (encryption in transit, access controls, row-level data
        isolation) to protect your information. No method of transmission or storage is completely
        secure, so we cannot guarantee absolute security.
      </p>

      <h2>8. Children</h2>
      <p>
        {LEGAL.appName} is not intended for anyone under 16. We do not knowingly collect information
        from children.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update this policy from time to time. Material changes will be reflected by updating
        the date above and, where appropriate, notifying you.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about this policy or your data? Email{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </>
  )
}
