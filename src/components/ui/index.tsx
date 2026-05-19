'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { calcProgress, getProgressBgColor } from '@/lib/progress'
import type { UoMType, GoalStatus, CheckInStatus } from '@/types'

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted'
  className?: string
}
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    muted: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', variants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Status Badge ────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: GoalStatus | CheckInStatus | string }) {
  const map: Record<string, BadgeProps['variant']> = {
    Draft: 'muted', Submitted: 'info', Approved: 'success', Rejected: 'error',
    Locked: 'default', 'Not Started': 'muted', 'On Track': 'warning', Completed: 'success',
  }
  return <Badge variant={map[status] ?? 'muted'}>{status}</Badge>
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number
  height?: number
  showLabel?: boolean
  className?: string
}
export function ProgressBar({ value, height = 6, showLabel = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const colorClass = getProgressBgColor(clamped)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 bg-slate-800 rounded-full overflow-hidden" style={{ height }}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-slate-400 w-8 text-right">{clamped}%</span>}
    </div>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['bg-indigo-500/30 text-indigo-300', 'bg-purple-500/30 text-purple-300', 'bg-blue-500/30 text-blue-300', 'bg-teal-500/30 text-teal-300']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold border border-white/10 flex-shrink-0', color, className)}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}
export function Button({ children, variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    outline: 'bg-transparent border border-slate-600 hover:border-indigo-500 text-slate-300 hover:text-indigo-300',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
  }
  return (
    <button
      className={cn('font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}
export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 transition-all duration-200',
        hover && 'hover:bg-slate-800/80 hover:border-indigo-500/30 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string
  value: string | number
  delta?: number
  icon: React.ReactNode
  color?: string
}
export function MetricCard({ label, value, delta, icon, color = 'text-indigo-400' }: MetricCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
          <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
          {delta !== undefined && (
            <p className={cn('text-xs mt-1', delta >= 0 ? 'text-green-400' : 'text-red-400')}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs last quarter
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-700/50', color)}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps {
  label?: string
  error?: string
  required?: boolean
  hint?: string
}
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & InputProps>(
  ({ label, error, required, hint, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full bg-slate-900/60 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all duration-150',
          'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30',
          error ? 'border-red-500/60' : 'border-slate-700/60 hover:border-slate-600',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {hint && !error && <p className="text-slate-600 text-xs">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  required?: boolean
  options: string[]
  placeholder?: string
}
export function Select({ label, error, required, options, placeholder = 'Select...', className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full bg-slate-900/60 border rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all duration-150',
          'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30',
          error ? 'border-red-500/60' : 'border-slate-700/60 hover:border-slate-600',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

// ─── Textarea ────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  required?: boolean
}
export function Textarea({ label, error, required, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full bg-slate-900/60 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none resize-none transition-all duration-150',
          'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30',
          error ? 'border-red-500/60' : 'border-slate-700/60 hover:border-slate-600',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={cn('w-full bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-h-[90vh] overflow-auto', maxWidth)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onDismiss }: { message: string; type?: 'success' | 'error' | 'warning'; onDismiss: () => void }) {
  const styles = {
    success: 'border-l-green-500 text-green-400',
    error: 'border-l-red-500 text-red-400',
    warning: 'border-l-yellow-500 text-yellow-400',
  }
  const icons = { success: '✓', error: '✕', warning: '!' }
  return (
    <div className={cn('flex items-center gap-3 bg-slate-800 border border-slate-700 border-l-4 rounded-xl px-4 py-3 shadow-xl max-w-sm animate-in slide-in-from-bottom-2', styles[type])}>
      <span className="text-base font-bold">{icons[type]}</span>
      <p className="text-slate-200 text-sm flex-1">{message}</p>
      <button onClick={onDismiss} className="text-slate-500 hover:text-white text-sm">✕</button>
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-white font-bold text-xl">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin"
      style={{ width: size, height: size }}
    />
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      {description && <p className="text-slate-400 text-sm mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

// ─── Weightage Meter ─────────────────────────────────────────────────────────
export function WeightageMeter({ usedWeight, currentWeight }: { usedWeight: number; currentWeight: number }) {
  const total = usedWeight + currentWeight
  const status = total > 100 ? 'error' : total === 100 ? 'success' : 'warning'
  const colors = { error: 'bg-red-500', success: 'bg-green-500', warning: 'bg-yellow-500' }
  const textColors = { error: 'text-red-400', success: 'text-green-400', warning: 'text-yellow-400' }
  return (
    <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
      <div className="flex justify-between items-center mb-2">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Weightage</span>
        <span className={cn('text-sm font-bold', textColors[status])}>{total}% / 100%</span>
      </div>
      <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-300', colors[status])} style={{ width: `${Math.min(100, total)}%` }} />
      </div>
      <p className="text-slate-600 text-xs mt-1.5">
        Available for this goal: <span className={total > 90 ? 'text-red-400 font-semibold' : 'text-slate-400'}>{100 - usedWeight}%</span> (min 10%)
      </p>
    </div>
  )
}
