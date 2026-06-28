/**
 * Single place to edit the details used across the Privacy Policy and Terms.
 * Review these with a legal advisor before relying on the documents.
 */
export const LEGAL = {
  appName: 'JobUFO',
  // If/when you register a business, replace with the registered entity name.
  legalEntity: 'JobUFO',
  // Public contact for privacy/legal requests.
  contactEmail: 'yunkai.huang730@gmail.com',
  // TODO: confirm your governing jurisdiction with a local advisor.
  governingLaw: 'Australia',
  // Update whenever you change the documents.
  effectiveDate: 'May 30, 2026',
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  // Third-party processors your data passes through (kept in sync with the app).
  subprocessors: [
    { name: 'Supabase', purpose: 'Database, authentication, hosting' },
    { name: 'Vercel', purpose: 'Application hosting' },
    { name: 'Groq', purpose: 'AI processing (resume & job-description analysis)' },
    { name: 'Stripe', purpose: 'Payment processing' },
    { name: 'Resend', purpose: 'Transactional email' },
  ],
} as const
