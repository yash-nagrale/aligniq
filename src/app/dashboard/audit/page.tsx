'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, SectionHeader, Avatar, Badge } from '@/components/ui'

export default function AuditPage() {
  const { auditLog, users } = useApp()
  const [search, setSearch] = useState('')

  const filtered = search
    ? auditLog.filter(a => {
        const u = users.find(u => u.id === a.user_id)
        return (
          a.action.toLowerCase().includes(search.toLowerCase()) ||
          (u?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (a.entity_id ?? '').toLowerCase().includes(search.toLowerCase())
        )
      })
    : auditLog

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-2">
      <SectionHeader
        title="Audit Trail"
        subtitle={`${auditLog.length} recorded actions`}
      />

      {/* Search */}
      <input
        type="text"
        placeholder="Search by user, action, or entity..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
      />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Timestamp', 'User', 'Action', 'Entity', 'Before', 'After'].map(h => (
                  <th key={h} className="text-left text-slate-600 text-[10px] font-bold uppercase tracking-widest px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const u = users.find(u => u.id === a.user_id)
                return (
                  <tr key={a.id} className={`border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                    <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{a.created_at}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u && <Avatar name={u.name} size={22} />}
                        <span className="text-slate-300 text-xs whitespace-nowrap">{u?.name ?? a.user_id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-indigo-400 text-xs font-medium whitespace-nowrap">{a.action}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-500 text-xs font-mono">{a.entity_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      {a.old_value && (
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">{a.old_value}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.new_value && (
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full max-w-[180px] truncate block">{a.new_value}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-slate-600 text-sm py-12">
                    No audit entries match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
