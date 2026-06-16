import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: string
}

export default function Input({ label, error, suffix, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={cn(
            'w-full px-4 py-3 text-base border-2 rounded-lg transition-colors',
            'border-gray-200 focus:border-blue-500 focus:outline-none',
            'placeholder:text-gray-400',
            error ? 'border-red-400 focus:border-red-500' : '',
            suffix ? 'pr-12' : '',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
