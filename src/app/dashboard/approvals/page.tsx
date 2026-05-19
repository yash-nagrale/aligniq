'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, Button, Avatar, Badge, StatusBadge, EmptyState, SectionHeader } from '@/components/ui'
import ApprovalModal from '@/components/goals/ApprovalModal'
import { calcProgress } from '@/lib/progress'
import type { Goal } from '@/types'

export default function ApprovalsPage() {
  const { goals, users, currentUser } = useApp()
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  // Managers see their direct reports' submissions; admins see all
  const reportIds = users.filter(u => u.manager_id === currentUser.id).map(u => u.id)
  const pending = goals.filter(g =>
    g.status === 'Submitted' && (currentUser.role === 'admin' || reportIds.includes(g.user_id))
  )
  const recentlyActioned = goals.filter(g =>
    (g.status === 'Approved' || g.status === 'Rejected' || g.status === 'Locked') &&
    (currentUser.role === 'admin' || reportIds.includes(g.user_id))
  ).slice(0, 6)

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <SectionHeader
        title="Goal Approvals"
        subtitle={`${pending.length} pending · Review and approve your team's goal submissions`}
      />

      {/* Pending */}
      {pending.length === 0 ? (
        <EmptyState icon="✓" title="All caught up!" description="No goals are currently pending approval." />
      ) : (
        <div className="space-y-4">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Awaiting Review ({pending.length})</h3>
          {pending.map(g => {
            const u = users.find(u => u.id === g.user_id)
            const prog = calcProgress(g.uom_type, g.target, g.achievement)
            return (
              <Card key={g.id} className="border-amber-500/10 hover:border-amber-500/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {u && <Avatar name={u.name} size={28} />}
                      <div>
                        <p className="text-white font-semibold text-sm">{g.title}</p>
                        <p className="text-slate-500 text-xs">{u?.name} · {u?.department}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="info">{g.thrust_area}</Badge>
                      <Badge variant="muted">{g.uom_type}</Badge>
                      <Badge variant="muted">Target: {g.target}</Badge>
                      <Badge variant="default">{g.weightage}%</Badge>
                      <StatusBadge status={g.status} />
                    </div>
                    {g.description && (
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{g.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Button onClick={() => setSelectedGoal(g)}>Review →</Button>
                    <p className="text-slate-600 text-xs">Deadline: {g.deadline}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Recently actioned */}
      {recentlyActioned.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Recently Actioned</h3>
          <div className="grid grid-cols-2 gap-3">
            {recentlyActioned.map(g => {
              const u = users.find(u => u.id === g.user_id)
              return (
                <Card key={g.id} className="flex items-center gap-3">
                  {u && <Avatar name={u.name} size={32} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm font-medium truncate">{g.title}</p>
                    <p className="text-slate-600 text-xs">{u?.name}</p>
                  </div>
                  <StatusBadge status={g.status} />
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <ApprovalModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />
    </div>
  )
}
