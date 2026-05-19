'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Button, Spinner } from '@/components/ui'
import { useApp } from '@/lib/store'
import { calcProgress } from '@/lib/progress'
import type { GoalFormData } from '@/types'

export type AIMode = 'smart' | 'kpi' | 'summary' | null

interface AIPanelProps {
  mode: AIMode
  goalForm?: GoalFormData | null
  onClose: () => void
}

// Demo fallback responses when API not configured
const DEMO_RESPONSES: Record<string, string> = {
  smart: `**SMART Goal Statement:**
Reduce P1 incident mean-time-to-resolution (MTTR) from 8 hours to ≤4 hours by implementing automated triage workflows and structured on-call rotations by December 31, 2025.

**Specific:** Reduce MTTR for P1 production incidents from current 8h average to ≤4h, measured weekly via PagerDuty.

**Measurable:** MTTR tracked in hours per incident; weekly average reported in engineering stand-up. Target = 4.0h or below.

**Achievable:** Automation of triage scripts can eliminate ~2h of manual root-cause analysis. On-call rotation improvements address the remaining gap.

**Relevant:** Directly impacts customer SLA compliance and product quality scores — core thrust area for the engineering team.

**Time-bound:** Full implementation by Q3 (Sep 30); sustained results measured through Q4 (Dec 31).

**Suggested KPI:** MTTR (hours) = Total resolution time across all P1 incidents ÷ Number of P1 incidents in period`,

  kpi: `**1. Mean Time to Resolution (MTTR)**
   - Formula: Σ(Resolution Time per Incident) ÷ Total P1 Incidents
   - Target Range: Baseline 8h → Target ≤4h
   - Data Source: PagerDuty / Incident management system
   - Frequency: Weekly

**2. Incident Recurrence Rate**
   - Formula: (Repeat P1 incidents ÷ Total P1 incidents) × 100
   - Target Range: <10%
   - Data Source: Incident tracking system
   - Frequency: Monthly

**3. Automation Coverage**
   - Formula: (Auto-triaged incidents ÷ Total incidents) × 100
   - Target Range: 0% → 60% by Q3
   - Data Source: Automation pipeline logs
   - Frequency: Sprint-by-sprint

**4. On-Call Response Time**
   - Formula: Time from alert to first responder acknowledgment
   - Target Range: <5 minutes
   - Data Source: PagerDuty escalation logs
   - Frequency: Per incident

**5. Customer Impact Score**
   - Formula: Avg customer-affected time per P1 incident (minutes)
   - Target Range: <30 min end-user impact
   - Data Source: Support tickets + incident post-mortems
   - Frequency: Monthly`,

  summary: `**Performance Summary — Annual Appraisal**

This employee has demonstrated strong performance across all four goal areas this year, achieving or exceeding targets in 3 out of 4 goals and maintaining on-track progress in the fourth.

**Key Achievements:** The successful reduction of P1 bug resolution time from 8h to 3.2h (120% of target) demonstrates a high-impact, systems-thinking approach to operational quality. Completing the AWS certification ahead of schedule and boosting unit test coverage to 87% (above the 85% target) reflects consistent delivery against commitments.

**Strengths Demonstrated:** Technical depth, proactive automation mindset, and ownership of quality outcomes. The zero critical security vulnerability record throughout the year is noteworthy and reflects disciplined compliance adherence.

**Areas for Development:** Expanding influence across teams and contributing to architectural decisions would be the natural next step given the technical maturity demonstrated this year.

**Recommended Rating:** Exceeds Expectations (4/5)
**Focus for Next Year:** Technical leadership, cross-team mentoring, and driving the shift-left quality initiative at the platform level.`,
}

export default function AIPanel({ mode, goalForm, onClose }: AIPanelProps) {
  const { currentUser, goals } = useApp()
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const titles: Record<string, string> = {
    smart: '✦ SMART Goal Enhancer',
    kpi: '✦ KPI Suggestion Generator',
    summary: '✦ AI Performance Summary',
  }

  useEffect(() => {
    if (!mode) return
    setResult('')
    setError('')
    runAI()
  }, [mode, goalForm])

  const runAI = async () => {
    if (!mode) return
    setLoading(true)

    try {
      const endpoint = `/api/ai/${mode}`
      let body: Record<string, unknown> = {}

      if (mode === 'smart' && goalForm) {
        body = { title: goalForm.title, description: goalForm.description, thrustArea: goalForm.thrust_area }
      } else if (mode === 'kpi' && goalForm) {
        body = { title: goalForm.title, description: goalForm.description, uomType: goalForm.uom_type }
      } else if (mode === 'summary') {
        const myGoals = goals.filter(g => g.user_id === currentUser.id)
        body = {
          employeeName: currentUser.name,
          goals: myGoals.map(g => ({
            title: g.title,
            weightage: g.weightage,
            progress: calcProgress(g.uom_type, g.target, g.achievement).value,
            status: g.status,
            managerComment: g.manager_comment,
          })),
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setResult(data.result)
    } catch {
      // Fall back to demo responses
      setResult(DEMO_RESPONSES[mode] ?? 'AI response unavailable. Please configure GEMINI_API_KEY.')
    }

    setLoading(false)
  }

  const renderResult = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**'))
        return <p key={i} className="text-indigo-300 font-bold text-sm mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>
      if (line.startsWith('**'))
        return <p key={i} className="text-slate-200 text-sm font-semibold mt-2">{line.replace(/\*\*/g, '')}</p>
      if (line.trim() === '') return <div key={i} className="h-1" />
      return <p key={i} className="text-slate-400 text-sm leading-relaxed">{line}</p>
    })

  return (
    <Modal open={!!mode} onClose={onClose} title={mode ? titles[mode] : ''} maxWidth="max-w-2xl">
      <div className="min-h-[280px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Spinner size={32} />
            <p className="text-slate-400 text-sm">AI is analysing your goal…</p>
          </div>
        ) : result ? (
          <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-700/40 space-y-1 max-h-[60vh] overflow-y-auto">
            {renderResult(result)}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <Spinner size={24} />
          </div>
        )}
      </div>

      {result && !loading && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={runAI}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ↻ Regenerate
          </button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(result)
              }}
            >
              Copy
            </Button>
            <Button size="sm" onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
