'use client'

import { useState } from 'react'
import { useApp, useMyGoals } from '@/lib/store'
import { Button, Card, EmptyState, SectionHeader } from '@/components/ui'
import GoalCard from '@/components/goals/GoalCard'
import GoalFormModal from '@/components/goals/GoalFormModal'
import CheckInModal from '@/components/goals/CheckInModal'
import ApprovalModal from '@/components/goals/ApprovalModal'
import AIPanel, { type AIMode } from '@/components/goals/AIPanel'
import { GOAL_STATUSES, MAX_GOALS } from '@/lib/constants'
import type { Goal, GoalFormData, QuarterKey } from '@/types'

export default function GoalsPage() {
  const { currentUser, goals } = useApp()
  const myGoals = useMyGoals()

  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [checkInGoal, setCheckInGoal] = useState<Goal | null>(null)
  const [checkInQuarter, setCheckInQuarter] = useState<QuarterKey>('Q4')
  const [approvalGoal, setApprovalGoal] = useState<Goal | null>(null)
  const [aiMode, setAiMode] = useState<AIMode>(null)
  const [aiGoalForm, setAiGoalForm] = useState<GoalFormData | null>(null)

  const totalWeight = myGoals.reduce((s, g) => s + g.weightage, 0)
  const canCreate = myGoals.length < MAX_GOALS

  const displayGoals = currentUser.role === 'employee'
    ? (filterStatus === 'All' ? myGoals : myGoals.filter(g => g.status === filterStatus))
    : (filterStatus === 'All' ? goals : goals.filter(g => g.status === filterStatus))

  const openEdit = (g: Goal) => { setEditingGoal(g); setGoalModalOpen(true) }
  const openCreate = () => { setEditingGoal(null); setGoalModalOpen(true) }

  const handleAIEnhance = (form: GoalFormData) => { setAiGoalForm(form); setAiMode('smart') }
  const handleAISuggestKPIs = (form: GoalFormData) => { setAiGoalForm(form); setAiMode('kpi') }

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-2">
      <SectionHeader
        title={currentUser.role === 'employee' ? 'My Goals' : 'All Goals'}
        subtitle={currentUser.role === 'employee' ? `${myGoals.length}/${MAX_GOALS} goals · Σ weightage ${totalWeight}%` : `${goals.length} goals across all employees`}
        action={
          <div className="flex items-center gap-2">
            {currentUser.role === 'employee' && (
              <>
                <Button variant="outline" size="sm" onClick={() => setAiMode('summary')}>
                  ✦ AI Summary
                </Button>
                <Button size="sm" onClick={openCreate} disabled={!canCreate}>
                  + New Goal
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Weightage alert */}
      {currentUser.role === 'employee' && totalWeight !== 100 && myGoals.length > 0 && (
        <div className={`rounded-xl p-3 border text-sm flex items-center gap-2 ${totalWeight > 100 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
          <span>⚑</span>
          {totalWeight > 100
            ? `Total weightage is ${totalWeight}% — please reduce by ${totalWeight - 100}%`
            : `Total weightage is ${totalWeight}% — ${100 - totalWeight}% still to allocate to reach 100%`}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {['All', ...GOAL_STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filterStatus === s
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {s}
            {s !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {(currentUser.role === 'employee' ? myGoals : goals).filter(g => g.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Goal list */}
      {displayGoals.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No goals found"
          description={currentUser.role === 'employee' ? 'Create your first goal to start tracking performance.' : 'No goals match this filter.'}
          action={currentUser.role === 'employee' && canCreate ? (
            <Button onClick={openCreate}>+ Create First Goal</Button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {displayGoals.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              showUser={currentUser.role !== 'employee'}
              onEdit={() => openEdit(g)}
              onCheckIn={() => { setCheckInGoal(g); setCheckInQuarter('Q4') }}
              onApprove={() => setApprovalGoal(g)}
              onAISuggest={() => handleAISuggestKPIs({
                title: g.title, description: g.description ?? '', thrust_area: g.thrust_area,
                uom_type: g.uom_type, target: g.target, weightage: g.weightage, deadline: g.deadline,
              })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <GoalFormModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        editGoal={editingGoal}
        onAIEnhance={handleAIEnhance}
        onSuggestKPIs={handleAISuggestKPIs}
      />
      <CheckInModal goal={checkInGoal} defaultQuarter={checkInQuarter} onClose={() => setCheckInGoal(null)} />
      <ApprovalModal goal={approvalGoal} onClose={() => setApprovalGoal(null)} />
      <AIPanel mode={aiMode} goalForm={aiGoalForm} onClose={() => { setAiMode(null); setAiGoalForm(null) }} />
    </div>
  )
}
