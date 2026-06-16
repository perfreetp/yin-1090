import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'blue' | 'green' | 'amber' | 'red'
  height?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  color = 'blue',
  height = 'md',
  showLabel = false
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500'
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>进度</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', heightClasses[height])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
