'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/store'
import { Avatar, Badge } from '@/components/ui'
import { DEMO_USERS } from '@/lib/constants'
import type { Role } from '@/types'

interface NavItem {
  href: string
  label: string
  icon: string
  roles: Role[]
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞', roles: ['employee', 'manager', 'admin'] },
  { href: '/dashboard/goals', label: 'My Goals', icon: '◎', roles: ['employee', 'manager', 'admin'] },
  { href: '/dashboard/approvals', label: 'Approvals', icon: '◈', roles: ['manager', 'admin'] },
  { href: '/dashboard/team', label: 'Team Goals', icon: '◉', roles: ['manager', 'admin'] },
  { href: '/dashboard/checkin', label: 'Check-Ins', icon: '✓', roles: ['employee', 'manager', 'admin'] },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '▲', roles: ['employee', 'manager', 'admin'] },
  { href: '/dashboard/admin', label: 'Admin Panel', icon: '⚙', roles: ['admin'] },
  { href: '/dashboard/audit', label: 'Audit Trail', icon: '☰', roles: ['admin'] },
  { href: '/dashboard/reports', label: 'Reports', icon: '⬇', roles: ['employee', 'manager', 'admin'] },
]

const ROLE_COLORS: Record<Role, string> = {
  employee: 'default',
  manager: 'warning',
  admin: 'error',
}

export default function Sidebar() {
  const { currentUser, setCurrentUser, goals } = useApp()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const pendingApprovals = goals.filter(g => g.status === 'Submitted').length
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role))

  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-4 border-b border-slate-800', collapsed && 'justify-center px-0')}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          A
        </div>
        {!collapsed && <span className="text-white font-bold text-lg tracking-tight">AlignIQ</span>}
      </div>

      {/* Role Switcher (demo) */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-slate-800">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-2 px-1">Demo — Switch Role</p>
          {DEMO_USERS.map(user => (
            <button
              key={user.id}
              onClick={() => setCurrentUser(user)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors mb-0.5',
                currentUser.id === user.id ? 'bg-indigo-500/15 border border-indigo-500/20' : 'hover:bg-slate-800/60'
              )}
            >
              <Avatar name={user.name} size={24} />
              <div className="overflow-hidden">
                <p className={cn('text-xs font-semibold truncate', currentUser.id === user.id ? 'text-indigo-300' : 'text-slate-300')}>
                  {user.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-slate-600 capitalize">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {filteredNav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const showBadge = item.href === '/dashboard/approvals' && pendingApprovals > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
                active
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                collapsed && 'justify-center px-0'
              )}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingApprovals}
                    </span>
                  )}
                </>
              )}
              {collapsed && showBadge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info + Collapse */}
      <div className="border-t border-slate-800 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar name={currentUser.name} size={32} />
            <div className="overflow-hidden flex-1">
              <p className="text-white text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-slate-600 text-xs capitalize">{currentUser.role} · {currentUser.department}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('w-full flex items-center gap-2 text-slate-600 hover:text-slate-300 text-xs py-1.5 px-2 rounded-lg hover:bg-slate-800 transition-colors', collapsed && 'justify-center')}
        >
          <span className="text-base">{collapsed ? '→' : '←'}</span>
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  )
}
