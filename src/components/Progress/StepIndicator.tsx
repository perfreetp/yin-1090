import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => (
        <div key={index} className="flex-1 flex items-center last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span className={cn(
              'mt-2 text-sm font-medium whitespace-nowrap',
              index === currentStep ? 'text-blue-600' : 
              index < currentStep ? 'text-green-600' : 'text-gray-400'
            )}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              'flex-1 h-1 mx-3 -mt-8 rounded-full',
              index < currentStep ? 'bg-green-400' : 'bg-gray-200'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}
