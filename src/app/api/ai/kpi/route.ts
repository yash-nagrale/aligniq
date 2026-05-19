import { NextRequest, NextResponse } from 'next/server'
import { suggestKPIs } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { title, description, uomType } = await req.json()
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
    const result = await suggestKPIs(title, description ?? '', uomType ?? '')
    return NextResponse.json({ result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
