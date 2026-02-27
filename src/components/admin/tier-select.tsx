'use client'

import { useSetUserTier } from '@/lib/hooks/use-admin'
import { toast } from 'sonner'

interface TierSelectProps {
  email: string
  currentTier: string
}

export function TierSelect({ email, currentTier }: TierSelectProps) {
  const setTier = useSetUserTier()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTier = e.target.value
    if (newTier === currentTier) return

    setTier.mutate(
      { email, tier: newTier },
      {
        onSuccess: () => {
          toast.success(`${email} updated to ${newTier}`)
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to update tier')
        },
      },
    )
  }

  return (
    <select
      value={currentTier}
      onChange={handleChange}
      disabled={setTier.isPending}
      className="h-8 rounded-md border border-border bg-card px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
    >
      <option value="explorer">Explorer</option>
      <option value="member">Member</option>
      <option value="pro">Pro</option>
    </select>
  )
}
