'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, Button, Badge, SectionHeader } from '@/components/ui'
import { CYCLE_WINDOWS } from '@/lib/constants'

export default function AdminPage() {
  const { goals, updateGoal, addAudit, currentUser, showToast } = useApp()
  const [unlocking, setUnlocking] = useState<string | null>(null)

  const lockedGoals = goals.filter(g => g.locked)

  const handleUnlock = (goalId: string) => {
    const g = goals.find(x => x.id === goalId)
    setUnlocking(goalId)
    setTimeout(() => {
      updateGoal(goalId, { locked: false })
      addAudit({ user_id: currentUser.id, action: 'Goal Unlocked', entity_type: 'goal', entity_id: goalId, old_value: 'Locked', new_value: 'Editable' })
      showToast(`Goal unlocked for editing`)
      setUnlocking(null)
    }, 400)
  }

  const escalations = [
    { msg: '3 employees have not submitted any goals', type: 'error', ts: '2h ago' },
    { msg: 'Rahul Menon: Q4 check-in overdue by 5 days', type: 'warning', ts: '1d ago' },
    { msg: 'Goal approval pending > 3 days for 2 goals', type: 'warning', ts: '3d ago' },
    { msg: 'Priya Sharma: weightage total is 95% (not 100%)', type: 'warning', ts: '4d ago' },
  ]

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <SectionHeader title="Admin Panel" subtitle="Cycle management, escalations, and goal controls" />

      <div className="grid grid-cols-2 gap-5">
        {/* Cycle Management */}
        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Check-In Cycle Windows</h3>
          <div className="space-y-3">
            {CYCLE_WINDOWS.map(c => (
              <div key={c.name} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-slate-300 text-sm font-medium">{c.name}</p>
                  <p className="text-slate-600 text-xs">{c.period}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.active
                    ? <Badge variant="success">Active</Badge>
                    : <Badge variant="muted">Inactive</Badge>}
                  <button className="text-slate-600 hover:text-slate-300 text-xs border border-slate-700 hover:border-slate-500 rounded-lg px-2 py-0.5 transition-all">
                    Override
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => showToast('Cycle override saved', 'success')}>
            Save Cycle Changes
          </Button>
        </Card>

        {/* Escalations */}
        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Active Escalations</h3>
          <div className="space-y-3">
            {escalations.map((e, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${e.type === 'error' ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
                <span className={`text-base flex-shrink-0 ${e.type === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                  {e.type === 'error' ? '✕' : '⚑'}
                </span>
                <div className="flex-1">
                  <p className={`text-sm ${e.type === 'error' ? 'text-red-300' : 'text-amber-300'}`}>{e.msg}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{e.ts}</p>
                </div>
                <button
                  className="text-slate-600 hover:text-slate-300 text-xs"
                  onClick={() => showToast('Escalation dismissed')}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Goal Lock Controls */}
      <Card>
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
          Goal Lock Controls
          <span className="ml-2 text-slate-600 font-normal normal-case text-xs">({lockedGoals.length} locked goals)</span>
        </h3>
        {lockedGoals.length === 0 ? (
          <p className="text-slate-600 text-sm py-4 text-center">No locked goals at the moment.</p>
        ) : (
          <div className="space-y-2">
            {lockedGoals.map(g => {
              const u = g.user
              return (
                <div key={g.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <span className="text-indigo-400 text-lg">🔒</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm font-medium truncate">{g.title}</p>
                    <p className="text-slate-600 text-xs">{u?.name} · {u?.department}</p>
                  </div>
                  <Badge variant="muted">{g.weightage}%</Badge>
                  <Badge variant="info">{g.uom_type}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlock(g.id)}
                    disabled={unlocking === g.id}
                  >
                    {unlocking === g.id ? '...' : 'Unlock'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* User Management summary */}
      <Card>
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">User Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Employees', count: 2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Managers', count: 1, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Admins / HR', count: 1, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(r => (
            <div key={r.label} className={`rounded-xl p-4 ${r.bg} border border-slate-700/30`}>
              <p className={`text-2xl font-bold ${r.color}`}>{r.count}</p>
              <p className="text-slate-400 text-sm">{r.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
