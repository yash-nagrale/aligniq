import { NextRequest, NextResponse } from 'next/server'
import { enhanceGoalSMART } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { title, description, thrustArea } = await req.json()
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
    const result = await enhanceGoalSMART(title, description ?? '', thrustArea ?? '')
    return NextResponse.json({ result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
