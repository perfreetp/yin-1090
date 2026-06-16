import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  onClick?: () => void
}

export default function StatCard({ title, value, icon, trend, color = 'blue', onClick }: StatCardProps) {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', value: 'text-green-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', value: 'text-red-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', value: 'text-purple-700' }
  }

  const classes = colorClasses[color]

  return (
    <div 
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-5 shadow-sm transition-all',
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={cn('text-3xl font-bold mt-2', classes.value)}>{value}</p>
          {trend && (
            <p className="text-xs text-gray-400 mt-1">{trend}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', classes.bg)}>
          <div className={classes.icon}>{icon}</div>
        </div>
      </div>
    </div>
  )
}
