'use client'

import { Check, Crown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils/cn'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    tier: 'explorer' as const,
    features: [
      '10 document uploads',
      '30 pages per document',
      '50 AI questions',
      '10 quiz generations',
      'Basic mastery tracking',
    ],
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    tier: 'pro' as const,
    popular: true,
    features: [
      'Unlimited documents',
      'Unlimited pages per document',
      'Unlimited AI questions',
      'Unlimited quizzes',
      'Advanced mastery tracking',
      'Priority processing',
      'Streak shields',
    ],
  },
]

export default function UpgradePage() {
  const { tier } = useAuthStore()

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <Crown className="h-10 w-10 text-brand mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Upgrade to Pro</h1>
        <p className="text-muted-foreground">Unlock unlimited access to all features</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'relative',
              plan.popular && 'border-brand shadow-lg',
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand text-white text-xs font-semibold">
                Most popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.tier === tier ? (
                <Button variant="outline" className="w-full" disabled>
                  Current plan
                </Button>
              ) : plan.tier === 'pro' ? (
                <Button className="w-full gradient-brand text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Free
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
