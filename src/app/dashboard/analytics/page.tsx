'use client'

import { useApp, useMyGoals } from '@/lib/store'
import { Card, MetricCard, SectionHeader } from '@/components/ui'
import { LineSpark, DonutChart, HorizontalBar, ProgressHeatmap } from '@/components/analytics/Charts'
import { calcProgress } from '@/lib/progress'
import { THRUST_AREAS, UOM_TYPES, QUARTERS } from '@/lib/constants'

export default function AnalyticsPage() {
  const { currentUser, goals, users } = useApp()
  const myGoals = useMyGoals()
  const isAdmin = currentUser.role === 'admin'
  const isManager = currentUser.role === 'manager'
  const reportIds = users.filter(u => u.manager_id === currentUser.id).map(u => u.id)

  const visibleGoals = isAdmin ? goals
    : isManager ? goals.filter(g => reportIds.includes(g.user_id) || g.user_id === currentUser.id)
    : myGoals

  const avgProg = visibleGoals.length
    ? Math.round(visibleGoals.reduce((s, g) => s + calcProgress(g.uom_type, g.target, g.achievement).value, 0) / visibleGoals.length)
    : 0
  const onTrack = visibleGoals.filter(g => calcProgress(g.uom_type, g.target, g.achievement).value >= 70).length
  const completed = visibleGoals.filter(g => calcProgress(g.uom_type, g.target, g.achievement).value >= 100).length

  // Thrust area distribution
  const thrustData = THRUST_AREAS.map(t => ({
    label: t,
    value: visibleGoals.filter(g => g.thrust_area === t).length,
    color: '#6366f1',
  })).filter(d => d.value > 0)

  // UoM distribution
  const uomColors = ['#6366f1', '#3b82f6', '#f59e0b', '#22c55e']
  const uomData = UOM_TYPES.map((u, i) => ({
    label: u, value: visibleGoals.filter(g => g.uom_type === u).length, color: uomColors[i],
  })).filter(d => d.value > 0)

  // Status donut
  const statusData = [
    { label: 'Draft', value: visibleGoals.filter(g => g.status === 'Draft').length, color: '#475569' },
    { label: 'Submitted', value: visibleGoals.filter(g => g.status === 'Submitted').length, color: '#3b82f6' },
    { label: 'Approved', value: visibleGoals.filter(g => g.status === 'Approved' || g.status === 'Locked').length, color: '#22c55e' },
    { label: 'Rejected', value: visibleGoals.filter(g => g.status === 'Rejected').length, color: '#ef4444' },
  ].filter(d => d.value > 0)

  // QoQ trend — calculate per-quarter avg using quarterly updates
  const qTrend = QUARTERS.map(q => {
    const vals = visibleGoals.flatMap(g => {
      const upd = g.quarterly_updates?.find(u => u.quarter === q)
      if (!upd) return []
      return [calcProgress(g.uom_type, g.target, upd.achievement).value]
    })
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0
  })

  // Heatmap data
  const heatmapData = visibleGoals.slice(0, 8).map(g => ({
    label: g.title.slice(0, 28) + (g.title.length > 28 ? '…' : ''),
    q1: (() => { const u = g.quarterly_updates?.find(u => u.quarter === 'Q1'); return u ? calcProgress(g.uom_type, g.target, u.achievement).value : 0 })(),
    q2: (() => { const u = g.quarterly_updates?.find(u => u.quarter === 'Q2'); return u ? calcProgress(g.uom_type, g.target, u.achievement).value : 0 })(),
    q3: (() => { const u = g.quarterly_updates?.find(u => u.quarter === 'Q3'); return u ? calcProgress(g.uom_type, g.target, u.achievement).value : 0 })(),
    q4: (() => { const u = g.quarterly_updates?.find(u => u.quarter === 'Q4'); return u ? calcProgress(g.uom_type, g.target, u.achievement).value : 0 })(),
  }))

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-2">
      <SectionHeader
        title="Analytics"
        subtitle={`Performance insights · ${visibleGoals.length} goals`}
      />

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Avg Progress" value={`${avgProg}%`} delta={9} icon="▲" />
        <MetricCard label="Goals Tracked" value={visibleGoals.length} icon="◉" color="text-blue-400" />
        <MetricCard label="On Track (≥70%)" value={onTrack} icon="✓" color="text-green-400" />
        <MetricCard label="Completed (100%)" value={completed} icon="★" color="text-amber-400" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">QoQ Achievement Trend</h3>
          <LineSpark data={qTrend} labels={[...QUARTERS]} height={140} color="#6366f1" />
          <div className="flex justify-between mt-2 text-xs text-slate-600">
            {QUARTERS.map((q, i) => (
              <span key={q}>{q}: <span className="text-slate-400 font-semibold">{qTrend[i]}%</span></span>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Status Distribution</h3>
          <DonutChart data={statusData.filter(d => d.value > 0)} size={110} />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Goals by Thrust Area</h3>
          <HorizontalBar data={thrustData} />
        </Card>

        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">UoM Distribution</h3>
          <DonutChart data={uomData} size={100} />
        </Card>
      </div>

      {/* Heatmap */}
      {heatmapData.some(r => r.q1 > 0 || r.q2 > 0 || r.q3 > 0 || r.q4 > 0) && (
        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Goal Achievement Heatmap</h3>
          <ProgressHeatmap data={heatmapData} />
        </Card>
      )}

      {/* Individual goal breakdown */}
      <Card>
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Individual Goal Breakdown</h3>
        <div className="space-y-3">
          {visibleGoals.map(g => {
            const prog = calcProgress(g.uom_type, g.target, g.achievement)
            const c = prog.value >= 90 ? '#22c55e' : prog.value >= 70 ? '#f59e0b' : prog.value >= 40 ? '#6366f1' : '#ef4444'
            const u = users.find(u => u.id === g.user_id)
            return (
              <div key={g.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: c + '22', color: c }}>
                  {prog.value}%
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm font-medium truncate max-w-[70%]">{g.title}</span>
                    {isAdmin && u && <span className="text-slate-600 text-xs">{u.name}</span>}
                  </div>
                  <div className="bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${prog.value}%`, background: c }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
