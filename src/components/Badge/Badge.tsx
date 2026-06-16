import { cn } from '@/lib/utils'
import type { RiskLevel, ReferralStatus, ScreeningStatus } from '@/types'

interface RiskBadgeProps {
  level: RiskLevel
  size?: 'sm' | 'md'
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const configs = {
    low: { text: '低风险', bg: 'bg-green-100', color: 'text-green-700' },
    medium: { text: '中风险', bg: 'bg-amber-100', color: 'text-amber-700' },
    high: { text: '高风险', bg: 'bg-red-100', color: 'text-red-700' }
  }
  
  const config = configs[level]
  
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1.5 text-sm',
      config.bg,
      config.color
    )}>
      {config.text}
    </span>
  )
}

interface StatusBadgeProps {
  status: ScreeningStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const configs: Record<ScreeningStatus, { text: string; bg: string; color: string }> = {
    pending: { text: '待筛查', bg: 'bg-gray-100', color: 'text-gray-600' },
    registered: { text: '已建档', bg: 'bg-blue-100', color: 'text-blue-700' },
    questionnaire_done: { text: '已问诊', bg: 'bg-purple-100', color: 'text-purple-700' },
    vitals_done: { text: '已体测', bg: 'bg-cyan-100', color: 'text-cyan-700' },
    completed: { text: '已完成', bg: 'bg-green-100', color: 'text-green-700' }
  }
  
  const config = configs[status]
  
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1.5 text-sm',
      config.bg,
      config.color
    )}>
      {config.text}
    </span>
  )
}

interface ReferralBadgeProps {
  status: ReferralStatus
  size?: 'sm' | 'md'
}

export function ReferralBadge({ status, size = 'md' }: ReferralBadgeProps) {
  const configs: Record<ReferralStatus, { text: string; bg: string; color: string }> = {
    pending: { text: '待转诊', bg: 'bg-amber-100', color: 'text-amber-700' },
    referred: { text: '已转诊', bg: 'bg-blue-100', color: 'text-blue-700' },
    completed: { text: '已完成', bg: 'bg-green-100', color: 'text-green-700' },
    cancelled: { text: '已取消', bg: 'bg-gray-100', color: 'text-gray-600' }
  }
  
  const config = configs[status]
  
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1.5 text-sm',
      config.bg,
      config.color
    )}>
      {config.text}
    </span>
  )
}
