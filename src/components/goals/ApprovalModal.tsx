'use client'

import React, { useState } from 'react'
import { Modal, Button, Badge, StatusBadge, Textarea, Avatar } from '@/components/ui'
import { useApp } from '@/lib/store'
import { calcProgress } from '@/lib/progress'
import type { Goal } from '@/types'

interface ApprovalModalProps {
  goal: Goal | null
  onClose: () => void
}

export default function ApprovalModal({ goal: g, onClose }: ApprovalModalProps) {
  const { currentUser, updateGoal, addAudit, showToast } = useApp()
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  if (!g) return null

  const user = g.user
  const prog = calcProgress(g.uom_type, g.target, g.achievement)

  const handle = async (approved: boolean) => {
    setLoading(true)
    const newStatus = approved ? 'Approved' : 'Rejected'
    updateGoal(g.id, {
      status: newStatus,
      locked: approved,
      manager_comment: comment.trim() || null,
    })
    addAudit({
      user_id: currentUser.id,
      action: approved ? 'Goal Approved' : 'Goal Rejected',
      entity_type: 'goal',
      entity_id: g.id,
      old_value: 'Submitted',
      new_value: newStatus,
    })
    showToast(
      approved ? `Goal approved and locked ✓` : `Goal returned for rework`,
      approved ? 'success' : 'warning'
    )
    setComment('')
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={!!g} onClose={onClose} title="Review Goal Submission" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Goal overview */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/40 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-white font-semibold text-base">{g.title}</h3>
              {user && (
                <div className="flex items-center gap-2 mt-1">
                  <Avatar name={user.name} size={20} />
                  <span className="text-slate-400 text-xs">{user.name} · {user.department}</span>
                </div>
              )}
            </div>
            <StatusBadge status={g.status} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ['Thrust Area', g.thrust_area],
              ['UoM Type', g.uom_type],
              ['Target', g.target],
              ['Weightage', `${g.weightage}%`],
              ['Deadline', g.deadline],
              ['Progress', `${prog.value}%`],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-800/60 rounded-lg p-2.5">
                <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">{k}</p>
                <p className="text-white text-sm font-semibold">{v}</p>
              </div>
            ))}
          </div>

          {g.description && (
            <p className="text-slate-400 text-sm leading-relaxed">{g.description}</p>
          )}
        </div>

        {/* Comment box */}
        <Textarea
          label="Manager Comment (Optional)"
          rows={3}
          placeholder="Add feedback, suggestions, or instructions for the employee..."
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={() => handle(false)} disabled={loading}>
            ↩ Return for Rework
          </Button>
          <Button variant="success" onClick={() => handle(true)} disabled={loading}>
            ✓ Approve &amp; Lock
          </Button>
        </div>
      </div>
    </Modal>
  )
}
