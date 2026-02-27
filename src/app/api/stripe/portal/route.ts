import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Stripe billing portal will be implemented in Phase 5
  return NextResponse.json(
    { error: 'Stripe integration not yet configured' },
    { status: 501 },
  )
}
