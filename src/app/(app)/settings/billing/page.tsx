'use client'

import Link from 'next/link'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function BillingPage() {
  const { tier } = useAuthStore()

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-xl font-bold">Billing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold capitalize">{tier}</p>
              <p className="text-sm text-muted-foreground">
                {tier === 'pro' ? 'Unlimited access' : 'Free tier with limits'}
              </p>
            </div>
            {tier !== 'pro' && (
              <Link href="/upgrade">
                <Button variant="brand">Upgrade</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
