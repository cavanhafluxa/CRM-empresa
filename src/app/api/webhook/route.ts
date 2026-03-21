import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = 'https://n8n-n8n.uhcnbw.easypanel.host/webhook/d079ece0-6062-4d70-9d05-c850aae89c1b'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await response.text()
    return NextResponse.json({ ok: true, status: response.status, body: text })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
