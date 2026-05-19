'use client'

import { useApp, useMyGoals, useTeamGoals } from '@/lib/store'
import { calcProgress, calcWeightedScore } from '@/lib/progress'
import { MetricCard, Card, ProgressBar, StatusBadge, Avatar, Button, EmptyState } from '@/components/ui'
import { LineSpark, DonutChart, HorizontalBar } from '@/components/analytics/Charts'
import { DEMO_USERS } from '@/lib/constants'
import Link from 'next/link'

// ─── Employee Dashboard ────────────────────────────────────────────────────
function EmployeeDashboard() {
  const myGoals = useMyGoals()
  const { currentUser } = useApp()

  const weightedScore = Math.round(calcWeightedScore(myGoals.filter(g => g.achievement)))
  const approved = myGoals.filter(g => g.status === 'Approved' || g.status === 'Locked').length
  const totalWeight = myGoals.reduce((s, g) => s + g.weightage, 0)
  const avgProgress = myGoals.length
    ? Math.round(myGoals.reduce((s, g) => s + calcProgress(g.uom_type, g.target, g.achievement).value, 0) / myGoals.length)
    : 0

  const qData = [58, 67, 74, avgProgress]

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <div>
        <h2 className="text-white text-2xl font-bold">Good morning, {currentUser.name.split(' ')[0]} 👋</h2>
        <p className="text-slate-400 text-sm mt-1">Here's your performance summary for FY 2025</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Weighted Score" value={`${weightedScore}%`} delta={8} icon="◎" />
        <MetricCard label="Goals Set" value={`${myGoals.length} / 8`} icon="◉" color="text-blue-400" />
        <MetricCard label="Approved" value={approved} icon="✓" color="text-green-400" />
        <MetricCard
          label="Weightage Total"
          value={`${totalWeight}%`}
          icon="⊡"
          color={totalWeight === 100 ? 'text-green-400' : 'text-amber-400'}
        />
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Goal progress list */}
        <Card className="col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Goal Progress</h3>
            <Link href="/dashboard/goals">
              <Button variant="ghost" size="sm">View All →</Button>
            </Link>
          </div>
          {myGoals.length === 0 ? (
            <EmptyState
              icon="◎"
              title="No goals yet"
              description="Create your first goal to get started."
              action={<Link href="/dashboard/goals"><Button size="sm">+ Create Goal</Button></Link>}
            />
          ) : (
            <div className="space-y-4">
              {myGoals.slice(0, 6).map(g => {
                const prog = calcProgress(g.uom_type, g.target, g.achievement)
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-300 text-sm font-medium truncate max-w-[65%]">{g.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">{prog.value}%</span>
                        <StatusBadge status={g.status} />
                      </div>
                    </div>
                    <ProgressBar value={prog.value} height={6} />
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Trend + score */}
        <Card className="col-span-2 flex flex-col">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quarterly Trend</h3>
          <LineSpark data={qData} labels={['Q1', 'Q2', 'Q3', 'Q4']} height={110} />
          <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Current Quarter</span>
              <span className="text-white font-bold">{avgProgress}%</span>
            </div>
            <ProgressBar value={avgProgress} height={8} />
            <p className="text-slate-600 text-[10px]">Based on {myGoals.filter(g => g.achievement).length} goals with actuals</p>
          </div>
        </Card>
      </div>

      {/* Deadlines + Insights */}
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {myGoals
              .filter(g => g.deadline)
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .slice(0, 5)
              .map(g => {
                const days = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000)
                return (
                  <div key={g.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <span className="text-slate-300 text-sm truncate max-w-[70%]">{g.title}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${days < 30 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>
                      {days > 0 ? `${days}d` : 'Overdue'}
                    </span>
                  </div>
                )
              })}
          </div>
        </Card>

        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">AI Insights</h3>
          <div className="space-y-3">
            {[
              { icon: '✦', color: 'text-green-400 bg-green-500/10', text: 'Q4 performance tracking above target — keep momentum!' },
              { icon: '⚑', color: 'text-amber-400 bg-amber-500/10', text: `${myGoals.filter(g => !g.achievement && g.status === 'Approved').length} goals awaiting Q4 check-in update` },
              { icon: '◈', color: 'text-indigo-400 bg-indigo-500/10', text: totalWeight === 100 ? 'Weightage is perfectly balanced at 100%' : `Weightage gap: ${100 - totalWeight}% remaining to allocate` },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50">
                <span className={`text-sm w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>{item.icon}</span>
                <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/goals">
            <Button variant="outline" size="sm" className="w-full mt-4">Generate AI Summary →</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}

// ─── Manager Dashboard ─────────────────────────────────────────────────────
function ManagerDashboard() {
  const teamGoals = useTeamGoals()
  const { goals, users, currentUser } = useApp()
  const pending = teamGoals.filter(g => g.status === 'Submitted')
  const atRisk = teamGoals.filter(g => calcProgress(g.uom_type, g.target, g.achievement).value < 50 && g.status === 'Approved')
  const teamAvg = teamGoals.length
    ? Math.round(teamGoals.reduce((s, g) => s + calcProgress(g.uom_type, g.target, g.achievement).value, 0) / teamGoals.length)
    : 0

  const reportees = users.filter(u => u.manager_id === currentUser.id)

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <div>
        <h2 className="text-white text-2xl font-bold">Manager Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">Team performance at a glance · {currentUser.department}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Team Goals" value={teamGoals.length} icon="◉" color="text-blue-400" />
        <MetricCard label="Pending Approval" value={pending.length} icon="◈" color="text-amber-400" />
        <MetricCard label="Team Avg Progress" value={`${teamAvg}%`} delta={9} icon="▲" />
        <MetricCard label="At Risk" value={atRisk.length} icon="⚑" color="text-red-400" />
      </div>

      {pending.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400 text-lg">⚑</span>
            <h3 className="text-amber-400 font-semibold">{pending.length} goal{pending.length > 1 ? 's' : ''} awaiting your approval</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {pending.map(g => (
              <Link key={g.id} href="/dashboard/approvals">
                <button className="text-sm text-slate-300 bg-slate-800 border border-slate-700 hover:border-amber-500/40 rounded-lg px-3 py-1.5 transition-all">
                  {g.title} →
                </button>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-5 gap-5">
        <Card className="col-span-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Team Goal Progress</h3>
          <div className="space-y-4">
            {teamGoals.slice(0, 7).map(g => {
              const prog = calcProgress(g.uom_type, g.target, g.achievement)
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {g.user && <Avatar name={g.user.name} size={20} />}
                      <span className="text-slate-300 text-sm truncate">{g.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-slate-500 text-xs">{prog.value}%</span>
                      <StatusBadge status={g.status} />
                    </div>
                  </div>
                  <ProgressBar value={prog.value} height={5} />
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="col-span-2">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">By Team Member</h3>
          <div className="space-y-4">
            {reportees.map(u => {
              const ug = teamGoals.filter(g => g.user_id === u.id)
              const avg = ug.length
                ? Math.round(ug.reduce((s, g) => s + calcProgress(g.uom_type, g.target, g.achievement).value, 0) / ug.length)
                : 0
              return (
                <div key={u.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={u.name} size={24} />
                      <span className="text-slate-300 text-sm">{u.name}</span>
                    </div>
                    <span className="text-white text-sm font-bold">{avg}%</span>
                  </div>
                  <ProgressBar value={avg} height={6} />
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <LineSpark data={[45, 58, 70, teamAvg]} labels={['Q1', 'Q2', 'Q3', 'Q4']} color="#f59e0b" height={70} />
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Admin Dashboard ────────────────────────────────────────────────────────
function AdminDashboard() {
  const { goals, users, auditLog } = useApp()
  const approved = goals.filter(g => g.status === 'Approved' || g.status === 'Locked').length
  const pending = goals.filter(g => g.status === 'Submitted').length
  const depts = Array.from(new Set(users.map(u => u.department)))

  const statusData = [
    { label: 'Draft', value: goals.filter(g => g.status === 'Draft').length, color: '#475569' },
    { label: 'Submitted', value: goals.filter(g => g.status === 'Submitted').length, color: '#3b82f6' },
    { label: 'Approved', value: approved, color: '#22c55e' },
    { label: 'Rejected', value: goals.filter(g => g.status === 'Rejected').length, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <div>
        <h2 className="text-white text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">Organisation-wide overview · HR & Admin</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Goals" value={goals.length} icon="◉" color="text-blue-400" />
        <MetricCard label="Completion Rate" value={`${goals.length ? Math.round(approved / goals.length * 100) : 0}%`} delta={12} icon="◎" />
        <MetricCard label="Employees" value={users.filter(u => u.role === 'employee').length} icon="◈" />
        <MetricCard label="Pending Actions" value={pending} icon="⚑" color="text-amber-400" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Dept Completion Rates</h3>
          <HorizontalBar
            data={depts.map(dept => {
              const du = users.filter(u => u.department === dept).map(u => u.id)
              const dg = goals.filter(g => du.includes(g.user_id))
              return {
                label: dept,
                value: dg.length ? Math.round(dg.filter(g => g.status === 'Approved' || g.status === 'Locked').length / dg.length * 100) : 0,
                color: '#6366f1',
              }
            })}
            maxValue={100}
          />
        </Card>

        <Card>
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Goal Status Distribution</h3>
          <DonutChart data={statusData} size={110} />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Recent Audit Activity</h3>
          <Link href="/dashboard/audit">
            <Button variant="ghost" size="sm">View All →</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {auditLog.slice(0, 6).map(a => {
            const u = users.find(u => u.id === a.user_id)
            return (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                {u && <Avatar name={u.name} size={28} />}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm">
                    <span className="text-indigo-400 font-medium">{u?.name}</span>{' '}
                    {a.action}
                    {a.entity_id && <span className="text-slate-500"> · {a.entity_id}</span>}
                  </p>
                  <p className="text-slate-600 text-xs">{a.created_at}</p>
                </div>
                {a.old_value && a.new_value && (
                  <div className="text-xs hidden md:flex items-center gap-1.5">
                    <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{a.old_value}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">{a.new_value}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// ─── Role router ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { currentUser } = useApp()
  if (currentUser.role === 'manager') return <ManagerDashboard />
  if (currentUser.role === 'admin') return <AdminDashboard />
  return <EmployeeDashboard />
}
