import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Stripe webhook handler will be implemented in Phase 5
  return NextResponse.json({ received: true })
}
