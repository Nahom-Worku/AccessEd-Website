'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSendVerification } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'

export default function VerifyPage() {
  const sendVerification = useSendVerification()

  return (
    <div className="text-center py-4">
      <Mail className="h-12 w-12 text-brand mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Verify your email</h2>
      <p className="text-sm text-muted-foreground mb-6">
        We sent a verification link to your email. Click it to activate your account.
      </p>
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            sendVerification.mutate(undefined, {
              onSuccess: () => toast.success('Verification email sent!'),
              onError: (err) => toast.error(err.message || 'Failed to send email'),
            })
          }}
          disabled={sendVerification.isPending}
        >
          Resend verification email
        </Button>
        <Link href="/home">
          <Button className="w-full">Continue to app</Button>
        </Link>
      </div>
    </div>
  )
}
