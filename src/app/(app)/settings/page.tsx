'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useLogout, useSendVerification } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, tier } = useAuthStore()
  const logout = useLogout()
  const sendVerification = useSendVerification()
  const router = useRouter()

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-brand/10 text-brand capitalize">
              {tier}
            </span>
          </div>
          {!user?.email_verified && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">Email not verified</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sendVerification.mutate(undefined, {
                    onSuccess: () => toast.success('Verification email sent'),
                  })
                }}
              >
                Send verification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {tier === 'pro'
              ? 'You have a Pro subscription with unlimited access.'
              : 'Upgrade to Pro for unlimited documents, questions, and quizzes.'}
          </p>
          {tier !== 'pro' && (
            <Button onClick={() => router.push('/upgrade')} variant="brand">
              Upgrade to Pro
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              logout.mutate()
              router.push('/login')
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
