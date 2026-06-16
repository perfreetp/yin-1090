import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    outline: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-7 py-4 text-lg'
  }

  return (
    <button
      className={cn(
        'font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        block ? 'w-full' : '',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
