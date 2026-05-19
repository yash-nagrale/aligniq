'use client'

import { useApp, useMyGoals } from '@/lib/store'
import { Card, Button, SectionHeader, ProgressBar, StatusBadge, Badge } from '@/components/ui'
import { calcProgress } from '@/lib/progress'
import { QUARTERS } from '@/lib/constants'

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

export default function ReportsPage() {
  const { goals, users, currentUser, showToast } = useApp()
  const myGoals = useMyGoals()
  const isEmployee = currentUser.role === 'employee'
  const visibleGoals = isEmployee ? myGoals : goals

  const exportPlannedVsActual = () => {
    const rows = [['Employee', 'Department', 'Goal', 'Thrust Area', 'UoM', 'Target', 'Actual', 'Progress %', 'Status', 'Weightage', 'Deadline']]
    visibleGoals.forEach(g => {
      const u = users.find(u => u.id === g.user_id)
      const prog = calcProgress(g.uom_type, g.target, g.achievement)
      rows.push([u?.name ?? g.user_id, u?.department ?? '', g.title, g.thrust_area, g.uom_type, g.target, g.achievement ?? '-', `${prog.value}%`, g.status, `${g.weightage}%`, g.deadline])
    })
    downloadCSV(`AlignIQ_Planned_vs_Actual_${new Date().toISOString().slice(0, 10)}.csv`, rows)
    showToast('Report exported successfully!')
  }

  const exportQuarterly = () => {
    const rows = [['Employee', 'Goal', 'Q1 Actual', 'Q1 Status', 'Q2 Actual', 'Q2 Status', 'Q3 Actual', 'Q3 Status', 'Q4 Actual', 'Q4 Status']]
    visibleGoals.forEach(g => {
      const u = users.find(u => u.id === g.user_id)
      const row = [u?.name ?? g.user_id, g.title]
      QUARTERS.forEach(q => {
        const upd = g.quarterly_updates?.find(u => u.quarter === q)
        row.push(upd?.achievement ?? '-', upd?.status ?? '-')
      })
      rows.push(row)
    })
    downloadCSV(`AlignIQ_Quarterly_${new Date().toISOString().slice(0, 10)}.csv`, rows)
    showToast('Quarterly report exported!')
  }

  const exportEmployee = () => {
    const rows = [['Employee', 'Department', 'Manager', 'Goals Count', 'Avg Progress %', 'Weighted Score %', 'Approved Goals']]
    users.filter(u => u.role === 'employee').forEach(u => {
      const ug = goals.filter(g => g.user_id === u.id)
      const avg = ug.length ? Math.round(ug.reduce((s, g) => s + calcProgress(g.uom_type, g.target, g.achievement).value, 0) / ug.length) : 0
      const weighted = Math.round(ug.reduce((s, g) => s + calcProgress(g.uom_type, g.target, g.achievement).value * g.weightage / 100, 0))
      const approved = ug.filter(g => g.status === 'Approved' || g.status === 'Locked').length
      const mgr = users.find(m => m.id === u.manager_id)
      rows.push([u.name, u.department, mgr?.name ?? '-', String(ug.length), `${avg}%`, `${weighted}%`, String(approved)])
    })
    downloadCSV(`AlignIQ_Employee_Report_${new Date().toISOString().slice(0, 10)}.csv`, rows)
    showToast('Employee report exported!')
  }

  const reportTypes = [
    {
      title: 'Planned vs Actual',
      description: 'Compare target vs actual achievement for all goals with progress percentages.',
      icon: '▲', color: 'text-indigo-400 bg-indigo-500/10',
      action: exportPlannedVsActual,
    },
    {
      title: 'Employee Achievement',
      description: 'Individual scores, weighted performance, and goal completion by employee.',
      icon: '◉', color: 'text-blue-400 bg-blue-500/10',
      action: exportEmployee,
    },
    {
      title: 'Quarterly Completion',
      description: 'Quarter-by-quarter actuals and status for all goals.',
      icon: '◎', color: 'text-green-400 bg-green-500/10',
      action: exportQuarterly,
    },
    {
      title: 'Full Goal Export',
      description: 'All goal data including metadata, status, and progress in one file.',
      icon: '⬇', color: 'text-amber-400 bg-amber-500/10',
      action: exportPlannedVsActual,
    },
  ]

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-2">
      <SectionHeader
        title="Reports"
        subtitle="Export performance data as CSV"
      />

      <div className="grid grid-cols-2 gap-4">
        {reportTypes.map(r => (
          <Card key={r.title} hover className="cursor-default">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${r.color}`}>
                {r.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">{r.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">{r.description}</p>
                <Button size="sm" variant="outline" onClick={r.action}>
                  ⬇ Export CSV
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Inline preview table */}
      <Card>
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
          Planned vs Actual — Preview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                {['Goal', 'Employee', 'UoM', 'Target', 'Actual', 'Progress', 'Status'].map(h => (
                  <th key={h} className="text-left text-slate-600 font-bold uppercase tracking-widest px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleGoals.slice(0, 10).map(g => {
                const u = users.find(u => u.id === g.user_id)
                const prog = calcProgress(g.uom_type, g.target, g.achievement)
                return (
                  <tr key={g.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                    <td className="px-3 py-2.5 text-slate-300 font-medium max-w-[200px]">
                      <span className="truncate block">{g.title}</span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{u?.name ?? '-'}</td>
                    <td className="px-3 py-2.5"><Badge variant="muted">{g.uom_type}</Badge></td>
                    <td className="px-3 py-2.5 text-slate-300 font-semibold">{g.target}</td>
                    <td className="px-3 py-2.5 text-slate-300">{g.achievement ?? '—'}</td>
                    <td className="px-3 py-2.5 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <ProgressBar value={prog.value} height={4} />
                        </div>
                        <span className="text-slate-500 w-8 text-right">{prog.value}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={g.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visibleGoals.length > 10 && (
            <p className="text-slate-600 text-xs text-center py-3">
              Showing 10 of {visibleGoals.length} goals. Export for full data.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
