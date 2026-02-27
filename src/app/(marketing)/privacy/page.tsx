import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: February 2026</p>

      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly: email, username, and documents you upload. We also collect usage data such as quiz results and study activity.</p>

      <h2>2. How We Use Your Information</h2>
      <p>Your information is used solely to provide AccessEd features: document analysis, quiz generation, mastery tracking, and personalized learning recommendations.</p>

      <h2>3. Document Privacy</h2>
      <p>Documents are isolated per user. Your content is never shared with other users or used to train AI models. Documents are processed in secure, isolated environments.</p>

      <h2>4. Data Storage</h2>
      <p>Your data is stored on secure servers. We use industry-standard encryption for data in transit and at rest.</p>

      <h2>5. Third-Party Services</h2>
      <p>We use third-party AI services to power document analysis and quiz generation. Only relevant document excerpts are sent to these services, and they do not retain your data.</p>

      <h2>6. Data Deletion</h2>
      <p>You can delete your documents and account at any time. Upon account deletion, all associated data is permanently removed.</p>

      <h2>7. Cookies</h2>
      <p>We use essential cookies for authentication. We do not use tracking cookies or share data with advertisers.</p>

      <h2>8. Changes</h2>
      <p>We may update this policy. We will notify you of significant changes via email or in-app notification.</p>

      <h2>9. Contact</h2>
      <p>For privacy questions, contact us at support@accessed.app.</p>
    </div>
  )
}
