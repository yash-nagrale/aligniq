'use client'

import { useState } from 'react'
import { useApp, useTeamGoals } from '@/lib/store'
import { Card, Avatar, ProgressBar, StatusBadge, SectionHeader, EmptyState, Badge } from '@/components/ui'
import GoalCard from '@/components/goals/GoalCard'
import ApprovalModal from '@/components/goals/ApprovalModal'
import CheckInModal from '@/components/goals/CheckInModal'
import { calcProgress } from '@/lib/progress'
import type { Goal, QuarterKey } from '@/types'

export default function TeamPage() {
  const { users, goals, currentUser } = useApp()
  const teamGoals = currentUser.role === 'admin' ? goals : useTeamGoals()
  const [view, setView] = useState<'by-member' | 'by-goal'>('by-member')
  const [approvalGoal, setApprovalGoal] = useState<Goal | null>(null)
  const [checkInGoal, setCheckInGoal] = useState<Goal | null>(null)

  const reportees = currentUser.role === 'admin'
    ? users.filter(u => u.role === 'employee')
    : users.filter(u => u.manager_id === currentUser.id)

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-2">
      <SectionHeader
        title="Team Goals"
        subtitle={`${teamGoals.length} goals · ${reportees.length} team members`}
        action={
          <div className="flex gap-2">
            {(['by-member', 'by-goal'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 border border-slate-700 hover:border-slate-500'}`}>
                {v === 'by-member' ? '◉ By Member' : '◎ By Goal'}
              </button>
            ))}
          </div>
        }
      />

      {view === 'by-member' ? (
        <div className="grid grid-cols-2 gap-5">
          {reportees.map(u => {
            const ug = teamGoals.filter(g => g.user_id === u.id)
            const avg = ug.length
              ? Math.round(ug.reduce((s, g) => s + calcProgress(g.uom_type, g.target, g.achievement).value, 0) / ug.length)
              : 0
            return (
              <Card key={u.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size={40} />
                    <div>
                      <p className="text-white font-semibold">{u.name}</p>
                      <p className="text-slate-500 text-xs">{u.department} · {u.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-2xl font-bold">{avg}%</p>
                    <p className="text-slate-600 text-xs">overall</p>
                  </div>
                </div>
                <ProgressBar value={avg} height={8} />
                <div className="mt-4 space-y-2">
                  {ug.slice(0, 4).map(g => {
                    const prog = calcProgress(g.uom_type, g.target, g.achievement)
                    return (
                      <div key={g.id} className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs truncate max-w-[65%]">{g.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs">{prog.value}%</span>
                          <StatusBadge status={g.status} />
                        </div>
                      </div>
                    )
                  })}
                  {ug.length > 4 && <p className="text-slate-600 text-xs">+{ug.length - 4} more goals</p>}
                </div>
                {ug.some(g => g.status === 'Submitted') && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <Badge variant="warning">⚑ Approval pending</Badge>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {teamGoals.length === 0
            ? <EmptyState icon="◉" title="No team goals" description="Team goals will appear here once submitted." />
            : teamGoals.map(g => (
              <GoalCard
                key={g.id}
                goal={g}
                showUser
                onApprove={g.status === 'Submitted' ? () => setApprovalGoal(g) : undefined}
              />
            ))
          }
        </div>
      )}

      <ApprovalModal goal={approvalGoal} onClose={() => setApprovalGoal(null)} />
      <CheckInModal goal={checkInGoal} onClose={() => setCheckInGoal(null)} />
    </div>
  )
}
