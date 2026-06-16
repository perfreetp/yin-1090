import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, CheckCircle, FileText, UserPlus, ClipboardList, HeartPulse, Activity, BarChart3, BookOpen, Calendar, MapPin } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/Layout/PageHeader'
import StatCard from '@/components/Card/StatCard'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import { StatusBadge } from '@/components/Badge/Badge'
import { formatDate } from '@/utils/storage'

const quickActions = [
  { label: '扫码建档', icon: UserPlus, path: '/registration', color: 'blue' as const },
  { label: '快速问询', icon: ClipboardList, path: '/questionnaire', color: 'purple' as const },
  { label: '体征录入', icon: HeartPulse, path: '/vitals', color: 'green' as const },
  { label: '风险判定', icon: Activity, path: '/assessment', color: 'amber' as const },
  { label: '转诊清单', icon: FileText, path: '/referral', color: 'red' as const },
  { label: '统计中心', icon: BarChart3, path: '/statistics', color: 'blue' as const },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { sessions, currentSessionId, getStatistics, getPendingRecords, getCompletedRecords } = useAppStore()
  
  const stats = getStatistics()
  const currentSession = sessions.find(s => s.id === currentSessionId)
  const pendingRecords = getPendingRecords().slice(0, 5)
  const completedRecords = getCompletedRecords().slice(-5).reverse()

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="筛查工作台"
        subtitle={currentSession ? currentSession.name : '欢迎使用睡眠呼吸暂停初筛系统'}
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {currentSession && (
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{currentSession.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {currentSession.location}
                    </span>
                    <span>{formatDate(currentSession.date)}</span>
                    <span className="text-gray-400">|</span>
                    <span>
                      {currentSession.type === 'group' ? '团体义诊' : 
                       currentSession.type === 'home' ? '入户随访' : '老年活动日'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
                <div className="text-sm text-gray-500">完成进度</div>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="筛查总数"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="已完成"
            value={stats.completed}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="高危人数"
            value={stats.highRisk}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
          />
          <StatCard
            title="待转诊"
            value={stats.referralPending}
            icon={<FileText className="w-6 h-6" />}
            color="amber"
          />
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">快捷操作</h3>
          <div className="grid grid-cols-6 gap-4">
            {quickActions.map(action => {
              const Icon = action.icon
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                green: 'bg-green-50 text-green-600 hover:bg-green-100',
                amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
                red: 'bg-red-50 text-red-600 hover:bg-red-100',
                purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
              }
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-3 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-gray-300"
                >
                  <div className={`p-3 rounded-xl ${colorClasses[action.color]}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-base font-medium text-gray-700">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">待筛查名单</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/registration')}>
                查看全部
              </Button>
            </div>
            <div className="space-y-3">
              {pendingRecords.length > 0 ? (
                pendingRecords.map(record => (
                  <div 
                    key={record.person.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/screening/${record.person.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {record.person.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.person.name}</p>
                        <p className="text-sm text-gray-500">{record.person.age}岁 · {record.person.gender === 'male' ? '男' : '女'}</p>
                      </div>
                    </div>
                    <StatusBadge status={record.person.status} size="sm" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  暂无待筛查人员
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">最近完成</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/statistics')}>
                查看全部
              </Button>
            </div>
            <div className="space-y-3">
              {completedRecords.length > 0 ? (
                completedRecords.map(record => (
                  <div 
                    key={record.person.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/screening/${record.person.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {record.person.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.person.name}</p>
                        <p className="text-sm text-gray-500">
                          得分：{record.assessment?.totalScore || 0}分
                        </p>
                      </div>
                    </div>
                    {record.assessment && (
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        record.assessment.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                        record.assessment.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {record.assessment.riskLevel === 'high' ? '高风险' :
                         record.assessment.riskLevel === 'medium' ? '中风险' : '低风险'}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  暂无已完成筛查
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">快速宣教</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/education')}>
              查看全部
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <BookOpen className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">什么是睡眠呼吸暂停？</h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">睡眠中呼吸反复停止或变浅的常见睡眠障碍...</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <HeartPulse className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">改善睡眠的生活建议</h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">控制体重、侧睡、戒烟限酒、规律作息...</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600 mb-2" />
              <h4 className="font-medium text-gray-900">哪些情况需要就医？</h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">打鼾严重、经常憋气、白天嗜睡、血压不稳...</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
