import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6'
  }

  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 shadow-sm',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}
