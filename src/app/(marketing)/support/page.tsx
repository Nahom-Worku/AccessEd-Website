import type { Metadata } from 'next'
import { Mail, MessageSquare, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Support' }

export default function SupportPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Support</h1>
      <p className="text-muted-foreground mb-8">We&apos;re here to help. Choose how you&apos;d like to get in touch.</p>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Send us an email and we&apos;ll get back to you within 24 hours.
              </p>
              <a href="mailto:support@accessed.app" className="text-sm text-brand hover:underline">
                support@accessed.app
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">FAQs</h3>
              <p className="text-sm text-muted-foreground">
                Common questions about AccessEd, subscriptions, and features.
              </p>
              <div className="mt-4 space-y-3">
                <details className="group">
                  <summary className="text-sm font-medium cursor-pointer">How do I upload documents?</summary>
                  <p className="text-sm text-muted-foreground mt-1 pl-4">Open a course, then drag and drop a PDF or click the upload area. Documents are processed automatically.</p>
                </details>
                <details className="group">
                  <summary className="text-sm font-medium cursor-pointer">What file types are supported?</summary>
                  <p className="text-sm text-muted-foreground mt-1 pl-4">Currently, AccessEd supports PDF files up to 100MB.</p>
                </details>
                <details className="group">
                  <summary className="text-sm font-medium cursor-pointer">How do I cancel my subscription?</summary>
                  <p className="text-sm text-muted-foreground mt-1 pl-4">Go to Settings &gt; Billing to manage your subscription. For App Store subscriptions, manage them through your Apple ID settings.</p>
                </details>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
