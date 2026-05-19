import { NextRequest, NextResponse } from 'next/server'
import { generatePerformanceSummary } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { employeeName, goals } = await req.json()
    if (!employeeName || !goals) return NextResponse.json({ error: 'employeeName and goals are required' }, { status: 400 })
    const result = await generatePerformanceSummary(employeeName, goals)
    return NextResponse.json({ result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
