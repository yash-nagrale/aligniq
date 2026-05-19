'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useApp } from '@/lib/store'
import { Badge, Button } from '@/components/ui'
import type { Role } from '@/types'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/goals': 'My Goals',
  '/dashboard/approvals': 'Pending Approvals',
  '/dashboard/team': 'Team Goals',
  '/dashboard/checkin': 'Quarterly Check-Ins',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/admin': 'Admin Panel',
  '/dashboard/audit': 'Audit Trail',
  '/dashboard/reports': 'Reports',
}

const ROLE_BADGE: Record<Role, { label: string; variant: 'default' | 'warning' | 'error' }> = {
  employee: { label: 'Employee', variant: 'default' },
  manager: { label: 'Manager', variant: 'warning' },
  admin: { label: 'Admin / HR', variant: 'error' },
}

function exportAllGoalsCSV(goals: any[], users: any[]) {
  const rows = [['Employee', 'Dept', 'Goal', 'Thrust Area', 'UoM', 'Target', 'Achievement', 'Progress %', 'Status', 'Weightage', 'Deadline']]
  goals.forEach(g => {
    const u = users.find((u: any) => u.id === g.user_id)
    const { calcProgress } = require('@/lib/progress')
    const { value } = calcProgress(g.uom_type, g.target, g.achievement)
    rows.push([u?.name ?? g.user_id, u?.department ?? '', g.title, g.thrust_area, g.uom_type, g.target, g.achievement ?? '-', `${value}%`, g.status, `${g.weightage}%`, g.deadline])
  })
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `AlignIQ_Export_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

export default function Header() {
  const pathname = usePathname()
  const { currentUser, goals, users } = useApp()
  const title = PAGE_TITLES[pathname] ?? 'AlignIQ'
  const roleBadge = ROLE_BADGE[currentUser.role]

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-white font-semibold text-base">{title}</h1>
        <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => exportAllGoalsCSV(goals, users)}
          className="text-slate-400"
        >
          ⬇ Export CSV
        </Button>
        <div className="w-px h-5 bg-slate-700 mx-1" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-slate-400 text-xs">Q4 Review Active</span>
        </div>
      </div>
    </header>
  )
}
