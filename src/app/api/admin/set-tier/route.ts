import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://accessed-api-gateway.onrender.com/api/v1'
const ADMIN_SECRET_KEY = process.env.ADMIN_API_KEY || 'accessed-admin-2024'

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization')
  if (!auth) return false

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: auth },
    })
    if (!res.ok) return false
    const user = await res.json()
    return user.role === 'admin'
  } catch {
    return false
  }
}

export async function PUT(req: NextRequest) {
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { email, tier } = await req.json()
    if (!email || !tier) {
      return NextResponse.json({ error: 'email and tier are required' }, { status: 400 })
    }

    const params = new URLSearchParams({
      email,
      tier,
      admin_key: ADMIN_SECRET_KEY,
    })

    const res = await fetch(`${API_URL}/admin/set-tier?${params}`, {
      method: 'PUT',
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Failed to set tier' }, { status: 500 })
  }
}
