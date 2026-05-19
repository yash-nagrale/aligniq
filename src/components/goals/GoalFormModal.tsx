'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Input, Select, Textarea, Button, WeightageMeter } from '@/components/ui'
import { useApp } from '@/lib/store'
import { THRUST_AREAS, UOM_TYPES, MAX_GOALS, MIN_WEIGHTAGE } from '@/lib/constants'
import type { Goal, GoalFormData, UoMType } from '@/types'

interface GoalFormModalProps {
  open: boolean
  onClose: () => void
  editGoal?: Goal | null
  onAIEnhance?: (form: GoalFormData) => void
  onSuggestKPIs?: (form: GoalFormData) => void
}

const EMPTY_FORM: GoalFormData = {
  title: '', thrust_area: '', description: '', uom_type: '',
  target: '', weightage: '', deadline: '',
}

function validateForm(form: GoalFormData, myGoals: Goal[], editId?: string): Record<string, string> {
  const errs: Record<string, string> = {}
  if (!form.title.trim()) errs.title = 'Goal title is required'
  if (!form.thrust_area) errs.thrust_area = 'Thrust area is required'
  if (!form.uom_type) errs.uom_type = 'UoM type is required'
  if (!form.target.trim()) errs.target = 'Target value is required'
  if (!form.deadline) errs.deadline = 'Deadline is required'

  const w = Number(form.weightage)
  if (!form.weightage || isNaN(w)) { errs.weightage = 'Weightage is required' }
  else if (w < MIN_WEIGHTAGE) { errs.weightage = `Minimum weightage is ${MIN_WEIGHTAGE}%` }
  else if (w > 100) { errs.weightage = 'Weightage cannot exceed 100%' }
  else {
    const otherGoals = myGoals.filter(g => g.id !== editId)
    const usedWeight = otherGoals.reduce((s, g) => s + g.weightage, 0)
    if (usedWeight + w > 100) errs.weightage = `Total would be ${usedWeight + w}% — exceeds 100%`
  }

  const nonDraftGoals = myGoals.filter(g => g.id !== editId)
  if (nonDraftGoals.length >= MAX_GOALS && !editId) errs.title = `Maximum of ${MAX_GOALS} goals allowed`

  return errs
}

export default function GoalFormModal({ open, onClose, editGoal, onAIEnhance, onSuggestKPIs }: GoalFormModalProps) {
  const { currentUser, goals, addGoal, updateGoal, addAudit, showToast } = useApp()
  const [form, setForm] = useState<GoalFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const myGoals = goals.filter(g => g.user_id === currentUser.id)
  const otherGoals = myGoals.filter(g => g.id !== editGoal?.id)
  const usedWeight = otherGoals.reduce((s, g) => s + g.weightage, 0)

  useEffect(() => {
    if (editGoal) {
      setForm({
        title: editGoal.title, thrust_area: editGoal.thrust_area,
        description: editGoal.description ?? '', uom_type: editGoal.uom_type,
        target: editGoal.target, weightage: editGoal.weightage, deadline: editGoal.deadline,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [editGoal, open])

  const set = (field: keyof GoalFormData) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = (submit: boolean) => {
    const errs = validateForm(form, myGoals, editGoal?.id)
    if (Object.keys(errs).length) { setErrors(errs); return }

    const status = submit ? 'Submitted' : 'Draft'

    if (editGoal) {
      updateGoal(editGoal.id, { ...form, uom_type: form.uom_type as UoMType, weightage: Number(form.weightage), status, locked: false })
      addAudit({ user_id: currentUser.id, action: `Goal ${submit ? 'Submitted' : 'Updated'}`, entity_type: 'goal', entity_id: editGoal.id, old_value: editGoal.status, new_value: status })
      showToast(submit ? 'Goal submitted for approval' : 'Goal saved as draft')
    } else {
      const newGoal: Goal = {
        id: `g_${Date.now()}`, user_id: currentUser.id,
        title: form.title, thrust_area: form.thrust_area,
        description: form.description || null, uom_type: form.uom_type as UoMType,
        target: form.target, achievement: null, weightage: Number(form.weightage),
        status, deadline: form.deadline, locked: false,
        manager_comment: null, is_shared: false, shared_goal_id: null,
        quarterly_updates: [],
      }
      addGoal(newGoal)
      addAudit({ user_id: currentUser.id, action: `Goal ${submit ? 'Submitted' : 'Created'}`, entity_type: 'goal', entity_id: newGoal.id, old_value: null, new_value: status })
      showToast(submit ? 'Goal submitted for manager approval!' : 'Goal saved as draft')
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editGoal ? 'Edit Goal' : 'Create New Goal'} maxWidth="max-w-2xl">
      <div className="space-y-5">
        <WeightageMeter usedWeight={usedWeight} currentWeight={Number(form.weightage) || 0} />

        <Input
          label="Goal Title" required placeholder="e.g. Increase customer satisfaction score to 90%"
          value={form.title} onChange={e => set('title')(e.target.value)} error={errors.title}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Thrust Area" required options={[...THRUST_AREAS]}
            value={form.thrust_area} onChange={e => set('thrust_area')(e.target.value)} error={errors.thrust_area}
          />
          <Select
            label="UoM Type" required options={[...UOM_TYPES]}
            value={form.uom_type} onChange={e => set('uom_type')(e.target.value)} error={errors.uom_type}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Target" required
            placeholder={form.uom_type === 'Timeline' ? 'YYYY-MM-DD' : form.uom_type === 'Zero' ? '0' : 'Numeric target'}
            value={form.target} onChange={e => set('target')(e.target.value)} error={errors.target}
            hint={
              form.uom_type === 'Min' ? 'Lower is better (e.g. reduce bug time to 4h)' :
              form.uom_type === 'Max' ? 'Higher is better (e.g. NPS = 80)' :
              form.uom_type === 'Timeline' ? 'Completion date (must be ≤ deadline)' :
              form.uom_type === 'Zero' ? 'Target is 0 occurrences' : undefined
            }
          />
          <Input
            label="Weightage %" required type="number" min={10} max={100}
            placeholder="Min 10" value={String(form.weightage)}
            onChange={e => set('weightage')(e.target.value)} error={errors.weightage}
          />
        </div>

        <Textarea
          label="Description" rows={3}
          placeholder="Describe context, approach, and expected outcome..."
          value={form.description} onChange={e => set('description')(e.target.value)}
        />

        <Input
          label="Deadline" required type="date"
          value={form.deadline} onChange={e => set('deadline')(e.target.value)} error={errors.deadline}
        />

        {/* AI Helpers */}
        {form.title && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onAIEnhance?.(form)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 rounded-lg px-3 py-1.5 transition-all bg-indigo-500/5 hover:bg-indigo-500/10"
            >
              ✦ Enhance with AI (SMART)
            </button>
            <button
              onClick={() => onSuggestKPIs?.(form)}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/60 rounded-lg px-3 py-1.5 transition-all bg-purple-500/5 hover:bg-purple-500/10"
            >
              ✦ Suggest KPIs
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={() => handleSave(false)}>Save Draft</Button>
          <Button onClick={() => handleSave(true)}>Submit for Approval</Button>
        </div>
      </div>
    </Modal>
  )
}
