import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: February 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using AccessEd (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

      <h2>2. Description of Service</h2>
      <p>AccessEd is an AI-powered learning platform that helps users study their documents through intelligent Q&A, adaptive quizzes, flashcards, and mastery tracking.</p>

      <h2>3. User Accounts</h2>
      <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.</p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to use the Service to upload illegal content, infringe on intellectual property rights, or engage in any activity that disrupts the Service.</p>

      <h2>5. Content</h2>
      <p>You retain ownership of documents you upload. AccessEd processes your documents solely to provide the Service features. We do not share your content with other users.</p>

      <h2>6. Subscriptions</h2>
      <p>Pro subscriptions are billed monthly. You may cancel at any time. Refunds are handled according to the platform (App Store or web) through which you subscribed.</p>

      <h2>7. Limitation of Liability</h2>
      <p>AccessEd is provided &quot;as is&quot; without warranties. We are not liable for any indirect, incidental, or consequential damages arising from use of the Service.</p>

      <h2>8. Changes</h2>
      <p>We may update these terms at any time. Continued use of the Service constitutes acceptance of updated terms.</p>

      <h2>9. Contact</h2>
      <p>For questions about these terms, contact us at support@accessed.app.</p>
    </div>
  )
}
