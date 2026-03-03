import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.join(process.cwd(), 'support', 'index.html')
  const html = fs.readFileSync(filePath, 'utf-8')
  return new NextResponse(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
