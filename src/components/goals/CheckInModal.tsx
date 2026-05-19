'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Input, Select, Textarea, Button } from '@/components/ui'
import { useApp } from '@/lib/store'
import { QUARTERS, CHECK_IN_STATUSES } from '@/lib/constants'
import { calcProgress } from '@/lib/progress'
import type { Goal, QuarterlyUpdate, QuarterKey, CheckInStatus } from '@/types'

interface CheckInModalProps {
  goal: Goal | null
  defaultQuarter?: QuarterKey
  onClose: () => void
}

export default function CheckInModal({ goal: g, defaultQuarter = 'Q4', onClose }: CheckInModalProps) {
  const { currentUser, addQuarterlyUpdate, addAudit, showToast } = useApp()
  const [form, setForm] = useState({ quarter: defaultQuarter, achievement: '', status: 'On Track' as CheckInStatus, notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!g) return
    const existing = g.quarterly_updates?.find(u => u.quarter === defaultQuarter)
    setForm({
      quarter: defaultQuarter,
      achievement: existing?.achievement ?? '',
      status: existing?.status ?? 'On Track',
      notes: existing?.notes ?? '',
    })
    setErrors({})
  }, [g, defaultQuarter])

  // re-fill when quarter changes
  const handleQuarterChange = (q: string) => {
    const existing = g?.quarterly_updates?.find(u => u.quarter === q)
    setForm(prev => ({
      ...prev,
      quarter: q as QuarterKey,
      achievement: existing?.achievement ?? '',
      status: existing?.status ?? 'On Track',
      notes: existing?.notes ?? '',
    }))
  }

  if (!g) return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.achievement.trim()) e.achievement = 'Achievement value is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const existing = g.quarterly_updates?.find(u => u.quarter === form.quarter)
    const update: QuarterlyUpdate = {
      id: existing?.id ?? `qu_${Date.now()}`,
      goal_id: g.id,
      quarter: form.quarter,
      achievement: form.achievement,
      status: form.status,
      notes: form.notes || null,
      submitted_by: currentUser.id,
    }

    addQuarterlyUpdate(update)
    addAudit({
      user_id: currentUser.id,
      action: `${form.quarter} Check-In ${existing ? 'Updated' : 'Submitted'}`,
      entity_type: 'quarterly_update',
      entity_id: g.id,
      old_value: existing?.achievement ?? null,
      new_value: form.achievement,
    })
    showToast(`${form.quarter} check-in submitted!`)
    onClose()
  }

  const prog = form.achievement
    ? calcProgress(g.uom_type, g.target, form.achievement)
    : null

  return (
    <Modal open={!!g} onClose={onClose} title="Submit Quarterly Check-In" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Goal reference */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/40">
          <p className="text-white font-semibold text-sm">{g.title}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>Target: <span className="text-slate-300 font-medium">{g.target}</span></span>
            <span>·</span>
            <span>UoM: <span className="text-slate-300 font-medium">{g.uom_type}</span></span>
            {prog && (
              <>
                <span>·</span>
                <span>Progress: <span className="text-indigo-400 font-bold">{prog.value}%</span></span>
              </>
            )}
          </div>
        </div>

        <Select
          label="Quarter"
          options={[...QUARTERS]}
          value={form.quarter}
          onChange={e => handleQuarterChange(e.target.value)}
        />

        <Input
          label="Actual Achievement"
          required
          placeholder={g.uom_type === 'Timeline' ? 'YYYY-MM-DD' : 'Enter actual value'}
          value={form.achievement}
          onChange={e => setForm(p => ({ ...p, achievement: e.target.value }))}
          error={errors.achievement}
          hint={
            g.uom_type === 'Min' ? 'Enter the actual value (lower = better)' :
            g.uom_type === 'Max' ? 'Enter the actual value (higher = better)' :
            g.uom_type === 'Timeline' ? 'Enter actual completion date' :
            g.uom_type === 'Zero' ? 'Enter 0 if achieved, or actual count' : undefined
          }
        />

        <Select
          label="Status"
          options={[...CHECK_IN_STATUSES]}
          value={form.status}
          onChange={e => setForm(p => ({ ...p, status: e.target.value as CheckInStatus }))}
        />

        <Textarea
          label="Notes"
          rows={3}
          placeholder="Any context, blockers, highlights, or next steps..."
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Check-In</Button>
        </div>
      </div>
    </Modal>
  )
}
