'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User, Goal, AuditLog, QuarterlyUpdate } from '@/types'
import { DEMO_USERS, DEMO_GOALS, DEMO_AUDIT, DEMO_QUARTERLY } from '@/lib/constants'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
}

interface AppState {
  currentUser: User
  users: User[]
  goals: Goal[]
  auditLog: AuditLog[]
  quarterlyUpdates: Record<string, QuarterlyUpdate[]>
  toasts: Toast[]
  // actions
  setCurrentUser: (user: User) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addAudit: (log: Omit<AuditLog, 'id' | 'created_at'>) => void
  addQuarterlyUpdate: (update: QuarterlyUpdate) => void
  updateQuarterlyUpdate: (goalId: string, quarter: string, updates: Partial<QuarterlyUpdate>) => void
  showToast: (message: string, type?: Toast['type']) => void
  dismissToast: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

// Pre-attach quarterly updates to goals
const goalsWithUpdates = DEMO_GOALS.map(g => ({
  ...g,
  quarterly_updates: DEMO_QUARTERLY[g.id] ?? [],
  user: DEMO_USERS.find(u => u.id === g.user_id),
}))

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0])
  const [users] = useState<User[]>(DEMO_USERS)
  const [goals, setGoals] = useState<Goal[]>(goalsWithUpdates)
  const [auditLog, setAuditLog] = useState<AuditLog[]>(DEMO_AUDIT)
  const [quarterlyUpdates, setQuarterlyUpdates] = useState<Record<string, QuarterlyUpdate[]>>(DEMO_QUARTERLY)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addGoal = useCallback((goal: Goal) => {
    setGoals(prev => [...prev, { ...goal, user: users.find(u => u.id === goal.user_id) }])
  }, [users])

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }, [])

  const addAudit = useCallback((log: Omit<AuditLog, 'id' | 'created_at'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `a_${Date.now()}`,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: users.find(u => u.id === log.user_id),
    }
    setAuditLog(prev => [newLog, ...prev])
  }, [users])

  const addQuarterlyUpdate = useCallback((update: QuarterlyUpdate) => {
    setQuarterlyUpdates(prev => ({
      ...prev,
      [update.goal_id]: [...(prev[update.goal_id] ?? []).filter(u => u.quarter !== update.quarter), update],
    }))
    setGoals(prev => prev.map(g => {
      if (g.id !== update.goal_id) return g
      const existing = g.quarterly_updates ?? []
      return {
        ...g,
        achievement: update.achievement,
        quarterly_updates: [...existing.filter(u => u.quarter !== update.quarter), update],
      }
    }))
  }, [])

  const updateQuarterlyUpdate = useCallback((goalId: string, quarter: string, updates: Partial<QuarterlyUpdate>) => {
    setQuarterlyUpdates(prev => ({
      ...prev,
      [goalId]: (prev[goalId] ?? []).map(u => u.quarter === quarter ? { ...u, ...updates } : u),
    }))
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g
      return {
        ...g,
        quarterly_updates: (g.quarterly_updates ?? []).map(u =>
          u.quarter === quarter ? { ...u, ...updates } : u
        ),
      }
    }))
  }, [])

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = `toast_${Date.now()}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      currentUser, users, goals, auditLog, quarterlyUpdates, toasts,
      setCurrentUser, addGoal, updateGoal, deleteGoal, addAudit,
      addQuarterlyUpdate, updateQuarterlyUpdate, showToast, dismissToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// Derived selectors
export function useMyGoals() {
  const { goals, currentUser } = useApp()
  return goals.filter(g => g.user_id === currentUser.id)
}

export function useTeamGoals() {
  const { goals, users, currentUser } = useApp()
  const reportIds = users.filter(u => u.manager_id === currentUser.id).map(u => u.id)
  return goals.filter(g => reportIds.includes(g.user_id))
}
