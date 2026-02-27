import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://accessed-api-gateway.onrender.com/api/v1'
const ADMIN_API_KEY = process.env.ADMIN_API_KEY

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await req.json()

    const res = await fetch(`${API_URL}/admin/announcements/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': ADMIN_API_KEY || '',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params

    const res = await fetch(`${API_URL}/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Key': ADMIN_API_KEY || '' },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}
