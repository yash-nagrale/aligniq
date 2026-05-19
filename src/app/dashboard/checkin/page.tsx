'use client'

import { useState } from 'react'
import { useApp, useMyGoals, useTeamGoals } from '@/lib/store'
import { Card, Button, StatusBadge, Badge, SectionHeader, EmptyState, ProgressBar } from '@/components/ui'
import CheckInModal from '@/components/goals/CheckInModal'
import { calcProgress } from '@/lib/progress'
import { QUARTERS } from '@/lib/constants'
import type { Goal, QuarterKey } from '@/types'

export default function CheckInPage() {
  const { currentUser } = useApp()
  const myGoals = useMyGoals()
  const teamGoals = useTeamGoals()
  const [activeQ, setActiveQ] = useState<QuarterKey>('Q4')
  const [checkInGoal, setCheckInGoal] = useState<Goal | null>(null)

  const isEmployee = currentUser.role === 'employee'
  const visibleGoals = isEmployee
    ? myGoals.filter(g => g.status === 'Approved' || g.status === 'Locked')
    : teamGoals

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-2">
      <SectionHeader
        title="Quarterly Check-Ins"
        subtitle="Track progress quarter-by-quarter against your goal targets"
      />

      {/* Quarter selector */}
      <div className="flex gap-2">
        {QUARTERS.map(q => (
          <button
            key={q}
            onClick={() => setActiveQ(q)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
              activeQ === q
                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {visibleGoals.length === 0 ? (
        <EmptyState icon="✓" title="No eligible goals" description="Approved goals will appear here for check-in updates." />
      ) : (
        <div className="space-y-4">
          {visibleGoals.map(g => {
            const upd = g.quarterly_updates?.find(u => u.quarter === activeQ)
            const prog = upd ? calcProgress(g.uom_type, g.target, upd.achievement) : null

            return (
              <Card key={g.id}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-white font-semibold text-sm mb-1.5">{g.title}</p>
                    <div className="flex gap-2">
                      <Badge variant="info">{g.thrust_area}</Badge>
                      <Badge variant="muted">{g.uom_type}</Badge>
                      {upd ? <StatusBadge status={upd.status} /> : <Badge variant="muted">No {activeQ} check-in</Badge>}
                    </div>
                  </div>
                  {isEmployee && (
                    <Button
                      variant={upd ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => setCheckInGoal(g)}
                    >
                      {upd ? `Update ${activeQ}` : `+ Add ${activeQ}`}
                    </Button>
                  )}
                </div>

                {/* Planned vs Actual */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-slate-900/50 rounded-lg p-2.5">
                    <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Target</p>
                    <p className="text-white text-sm font-semibold">{g.target}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2.5">
                    <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">{activeQ} Actual</p>
                    <p className={`text-sm font-semibold ${upd ? 'text-white' : 'text-slate-700'}`}>{upd?.achievement ?? '—'}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2.5">
                    <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Progress</p>
                    <p className={`text-sm font-bold ${prog ? (prog.value >= 90 ? 'text-green-400' : prog.value >= 60 ? 'text-amber-400' : 'text-red-400') : 'text-slate-700'}`}>
                      {prog ? `${prog.value}%` : '—'}
                    </p>
                  </div>
                </div>

                {prog && <ProgressBar value={prog.value} height={6} />}

                {upd?.notes && (
                  <p className="mt-3 text-slate-500 text-xs leading-relaxed border-l-2 border-slate-700 pl-3">
                    {upd.notes}
                  </p>
                )}

                {/* All quarters overview */}
                {g.quarterly_updates && g.quarterly_updates.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-4 gap-2">
                    {QUARTERS.map(q => {
                      const qu = g.quarterly_updates?.find(u => u.quarter === q)
                      const qp = qu ? calcProgress(g.uom_type, g.target, qu.achievement) : null
                      return (
                        <div key={q} className={`rounded-lg p-2 text-center border ${q === activeQ ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/30'}`}>
                          <p className="text-slate-600 text-[9px] font-bold uppercase mb-1">{q}</p>
                          <p className={`text-xs font-bold ${qp ? (qp.value >= 90 ? 'text-green-400' : qp.value >= 60 ? 'text-amber-400' : 'text-red-400') : 'text-slate-700'}`}>
                            {qp ? `${qp.value}%` : '—'}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <CheckInModal
        goal={checkInGoal}
        defaultQuarter={activeQ}
        onClose={() => setCheckInGoal(null)}
      />
    </div>
  )
}
