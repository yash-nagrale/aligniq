'use client'

import React, { useState } from 'react'
import { Card, Badge, StatusBadge, ProgressBar, Button, Avatar } from '@/components/ui'
import { calcProgress } from '@/lib/progress'
import { QUARTERS } from '@/lib/constants'
import { useApp } from '@/lib/store'
import type { Goal } from '@/types'

interface GoalCardProps {
  goal: Goal
  showUser?: boolean
  onEdit?: () => void
  onCheckIn?: () => void
  onApprove?: () => void
  onAISuggest?: () => void
}

export default function GoalCard({ goal: g, showUser, onEdit, onCheckIn, onApprove, onAISuggest }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { currentUser } = useApp()
  const prog = calcProgress(g.uom_type, g.target, g.achievement)
  const user = g.user

  const canEdit = !g.locked && (g.status === 'Draft' || g.status === 'Rejected') && g.user_id === currentUser.id

  return (
    <Card className="group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {showUser && user && (
              <div className="flex items-center gap-1.5">
                <Avatar name={user.name} size={20} />
                <span className="text-slate-400 text-xs">{user.name}</span>
                <span className="text-slate-700">·</span>
              </div>
            )}
            <h3 className="text-white font-semibold text-sm leading-tight">{g.title}</h3>
            {g.locked && <span className="text-indigo-400 text-sm">🔒</span>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="info">{g.thrust_area}</Badge>
            <Badge variant="muted">{g.uom_type}</Badge>
            <StatusBadge status={g.status} />
            {g.is_shared && <Badge variant="default">Shared</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {canEdit && <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>}
          {currentUser.role === 'employee' && g.status === 'Approved' && (
            <Button variant="secondary" size="sm" onClick={onCheckIn}>Check-In</Button>
          )}
          {(currentUser.role === 'manager' || currentUser.role === 'admin') && g.status === 'Submitted' && (
            <Button size="sm" onClick={onApprove}>Review →</Button>
          )}
          {onAISuggest && (
            <button
              onClick={onAISuggest}
              className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 transition-all"
            >
              ✦ KPIs
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ['Target', g.target],
          ['Achievement', g.achievement ?? '—'],
          ['Weightage', `${g.weightage}%`],
          ['Deadline', g.deadline],
        ].map(([label, value]) => (
          <div key={label} className="bg-slate-900/50 rounded-lg p-2.5">
            <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">{label}</p>
            <p className="text-white text-sm font-semibold truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Progress</span>
          <span className="text-slate-300 font-semibold">{prog.value}%</span>
        </div>
        <ProgressBar value={prog.value} height={8} />
      </div>

      {/* Manager Comment */}
      {g.manager_comment && (
        <div className="mt-3 border-l-2 border-amber-500/50 pl-3 py-1 bg-amber-500/5 rounded-r-lg">
          <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Manager Comment</p>
          <p className="text-slate-300 text-xs">{g.manager_comment}</p>
        </div>
      )}

      {/* Description */}
      {g.description && (
        <p className="mt-3 text-slate-500 text-xs leading-relaxed line-clamp-2">{g.description}</p>
      )}

      {/* Quarterly Updates Toggle */}
      {g.quarterly_updates && g.quarterly_updates.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >
            <span>{expanded ? '▲' : '▼'}</span>
            Quarterly Updates ({g.quarterly_updates.length})
          </button>

          {expanded && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {QUARTERS.map(q => {
                const upd = g.quarterly_updates?.find(u => u.quarter === q)
                return (
                  <div key={q} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                    <p className="text-indigo-400 text-[10px] font-bold uppercase mb-2">{q}</p>
                    {upd ? (
                      <>
                        <p className="text-white text-sm font-semibold mb-1">{upd.achievement}</p>
                        <StatusBadge status={upd.status} />
                        {upd.notes && <p className="text-slate-600 text-[10px] mt-1.5 line-clamp-2">{upd.notes}</p>}
                      </>
                    ) : (
                      <p className="text-slate-700 text-xs">No update</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
