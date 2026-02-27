'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  return (
    <div className="text-center py-4">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Password reset</h2>
      <p className="text-sm text-muted-foreground mb-6">
        If the link you clicked was valid, your password has been reset. You can now sign in with your new password.
      </p>
      <Link href="/login">
        <Button className="w-full">Sign in</Button>
      </Link>
    </div>
  )
}
