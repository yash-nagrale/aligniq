import type { UoMType, ProgressResult } from '@/types'

export function calcProgress(
  uom: UoMType,
  target: string,
  achievement: string | null | undefined
): ProgressResult {
  if (achievement === null || achievement === undefined || achievement === '') {
    return { value: 0, label: '0%' }
  }

  let value = 0

  switch (uom) {
    case 'Min': {
      const t = parseFloat(target)
      const a = parseFloat(achievement)
      if (isNaN(t) || isNaN(a) || a === 0) { value = 0; break }
      value = Math.min(100, Math.round((t / a) * 100))
      break
    }
    case 'Max': {
      const t = parseFloat(target)
      const a = parseFloat(achievement)
      if (isNaN(t) || isNaN(a) || t === 0) { value = 0; break }
      value = Math.min(100, Math.round((a / t) * 100))
      break
    }
    case 'Timeline': {
      const deadline = new Date(target)
      const actual = new Date(achievement)
      if (isNaN(deadline.getTime()) || isNaN(actual.getTime())) { value = 0; break }
      if (actual <= deadline) {
        value = 100
      } else {
        const overdueDays = (actual.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24)
        value = Math.max(0, Math.round((1 - overdueDays / 30) * 100))
      }
      break
    }
    case 'Zero': {
      const a = parseFloat(achievement)
      value = isNaN(a) ? 0 : a === 0 ? 100 : 0
      break
    }
    default:
      value = 0
  }

  return { value: Math.max(0, Math.min(100, value)), label: `${value}%` }
}

export function calcWeightedScore(goals: Array<{ uom_type: UoMType; target: string; achievement: string | null; weightage: number }>) {
  return goals.reduce((sum, g) => {
    const { value } = calcProgress(g.uom_type, g.target, g.achievement)
    return sum + (value * g.weightage) / 100
  }, 0)
}

export function getProgressColor(value: number): string {
  if (value >= 90) return 'text-green-400'
  if (value >= 70) return 'text-yellow-400'
  if (value >= 40) return 'text-orange-400'
  return 'text-red-400'
}

export function getProgressBgColor(value: number): string {
  if (value >= 90) return 'bg-green-500'
  if (value >= 70) return 'bg-yellow-500'
  if (value >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}
