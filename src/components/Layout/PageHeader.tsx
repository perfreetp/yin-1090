import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backTo?: string
  rightContent?: ReactNode
  className?: string
}

export default function PageHeader({ 
  title, 
  subtitle, 
  showBack = false, 
  backTo,
  rightContent,
  className
}: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className={cn(
      'bg-white border-b border-gray-200 px-6 py-4',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {rightContent}
      </div>
    </div>
  )
}
