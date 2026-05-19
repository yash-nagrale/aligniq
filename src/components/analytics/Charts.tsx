'use client'

import React from 'react'

interface LineSparkProps {
  data: number[]
  labels?: string[]
  color?: string
  height?: number
}

export function LineSpark({ data, labels, color = '#6366f1', height = 100 }: LineSparkProps) {
  if (!data || data.length < 2) return null
  const w = 400
  const h = height
  const pad = 12
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2)
  const y = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2)

  const points = data.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const areaPoints = `${x(0)},${h - pad / 2} ${points} ${x(data.length - 1)},${h - pad / 2}`
  const gradId = `lg${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill={color} />
      ))}
      {labels?.map((l, i) => (
        <text key={i} x={x(i)} y={h - 1} textAnchor="middle" fontSize="9" fill="#475569">{l}</text>
      ))}
      {data.map((v, i) => (
        <text key={`v${i}`} x={x(i)} y={y(v) - 6} textAnchor="middle" fontSize="9" fill={color} fontWeight="600">{v}</text>
      ))}
    </svg>
  )
}

interface DonutProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  showLegend?: boolean
}

export function DonutChart({ data, size = 120, showLegend = true }: DonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 42
  const cx = 55
  const cy = 55
  const circ = 2 * Math.PI * r
  let offset = -0.25 * circ

  return (
    <div className="flex items-center gap-4">
      <svg width={size + 10} height={size + 10} viewBox="0 0 110 110">
        {data.map((d, i) => {
          const pct = d.value / total
          const dash = pct * circ
          const gap = circ - dash
          const seg = (
            <circle
              key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          )
          offset += (dash || 0)
          return seg
        })}
        <circle cx={cx} cy={cy} r={32} fill="#1e2535" />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fill="white" fontWeight="700">
          {total}
        </text>
      </svg>
      {showLegend && (
        <div className="space-y-1.5">
          {data.map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-slate-400 text-xs">{d.label}</span>
              <span className="text-slate-200 text-xs font-semibold ml-auto pl-3">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  maxValue?: number
}

export function HorizontalBar({ data, height = 28, maxValue }: BarChartProps) {
  const max = maxValue ?? (Math.max(...data.map(d => d.value)) || 1)
  return (
    <div className="space-y-2.5">
      {data.map(d => (
        <div key={d.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 truncate max-w-[70%]">{d.label}</span>
            <span className="text-slate-300 font-semibold">{d.value}</span>
          </div>
          <div className="bg-slate-800 rounded-full overflow-hidden" style={{ height: 6 }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color ?? '#6366f1' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

interface HeatmapProps {
  data: { label: string; q1: number; q2: number; q3: number; q4: number }[]
}

export function ProgressHeatmap({ data }: HeatmapProps) {
  const getColor = (v: number) => {
    if (v >= 90) return '#22c55e'
    if (v >= 70) return '#f59e0b'
    if (v >= 40) return '#6366f1'
    if (v > 0) return '#ef4444'
    return '#1e2535'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left text-slate-600 font-medium py-1.5 pr-3 min-w-[160px]">Goal</th>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <th key={q} className="text-center text-slate-600 font-medium py-1.5 px-2 w-16">{q}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.label}>
              <td className="text-slate-400 py-1 pr-3 truncate max-w-[160px]">{row.label}</td>
              {[row.q1, row.q2, row.q3, row.q4].map((v, i) => (
                <td key={i} className="px-2 py-1 text-center">
                  <div
                    className="mx-auto rounded-md flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getColor(v), width: 40, height: 26, fontSize: 10 }}
                  >
                    {v > 0 ? `${v}%` : '—'}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-800">
        <span className="text-slate-600 text-[10px]">Legend:</span>
        {[['≥90%', '#22c55e'], ['70–89%', '#f59e0b'], ['40–69%', '#6366f1'], ['<40%', '#ef4444']].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
            <span className="text-slate-600 text-[10px]">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
