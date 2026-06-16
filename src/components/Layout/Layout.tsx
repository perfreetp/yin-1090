import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, UserPlus, ClipboardList, HeartPulse, Activity, FileText, BarChart3, BookOpen, CheckSquare, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/', label: '工作台', icon: Home },
  { path: '/registration', label: '扫码建档', icon: UserPlus },
  { path: '/questionnaire', label: '快速问询', icon: ClipboardList },
  { path: '/vitals', label: '体征录入', icon: HeartPulse },
  { path: '/assessment', label: '风险判定', icon: Activity },
  { path: '/referral', label: '转诊清单', icon: FileText },
  { path: '/review', label: '复核台', icon: CheckSquare },
  { path: '/archive', label: '归档管理', icon: Archive },
  { path: '/statistics', label: '统计中心', icon: BarChart3 },
  { path: '/education', label: '宣教话术', icon: BookOpen },
]

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600">OSA初筛工作台</h1>
          <p className="text-xs text-gray-400 mt-1">睡眠呼吸暂停筛查系统</p>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors',
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-500 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-base">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400">社区卫生服务中心</div>
          <div className="text-sm text-gray-600 mt-1">护士工作站</div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
