'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForgotPassword } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const forgotPassword = useForgotPassword()
  const form = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = (data: Form) => {
    forgotPassword.mutate(data.email, {
      onSuccess: () => setSent(true),
      onError: (err) => toast.error(err.message || 'Something went wrong'),
    })
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Check your email</h2>
        <p className="text-sm text-muted-foreground mb-6">
          We&apos;ve sent a password reset link to your email address.
        </p>
        <Link href="/login">
          <Button variant="outline">Back to sign in</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...form.register('email')} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
        <div className="text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
