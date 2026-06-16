import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, PieChart, Download, Users, AlertTriangle, TrendingUp, Calendar, FileSpreadsheet, ListChecks } from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAppStore } from '@/store/useAppStore'
import { exportToCSV } from '@/utils/export'
import { getStatusText, getRiskLevelText, getReferralStatusText } from '@/utils/assessment'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import StatCard from '@/components/Card/StatCard'
import { RiskBadge, StatusBadge, ReferralBadge } from '@/components/Badge/Badge'

export default function Statistics() {
  const navigate = useNavigate()
  const { getStatistics, getCompletedRecords, getCurrentSessionRecords, sessions, currentSessionId, setCurrentSession } = useAppStore()
  
  const stats = getStatistics()
  const completedRecords = getCompletedRecords()
  const allSessionRecords = getCurrentSessionRecords()

  const [activeTab, setActiveTab] = useState<'completed' | 'all'>('completed')
  const [visibleCount, setVisibleCount] = useState(10)
  const [allVisibleCount, setAllVisibleCount] = useState(10)

  const riskDistribution = [
    { name: '低风险', value: stats.lowRisk, color: '#22c55e' },
    { name: '中风险', value: stats.mediumRisk, color: '#f59e0b' },
    { name: '高风险', value: stats.highRisk, color: '#ef4444' },
  ]

  const statusDistribution = [
    { name: '已完成', value: stats.completed, color: '#3b82f6' },
    { name: '进行中', value: stats.pending, color: '#9ca3af' },
  ]

  const mockDailyData = [
    { date: '3/10', 筛查: 12, 高危: 2 },
    { date: '3/11', 筛查: 18, 高危: 4 },
    { date: '3/12', 筛查: 8, 高危: 1 },
    { date: '3/13', 筛查: 25, 高危: 6 },
    { date: '3/14', 筛查: 20, 高危: 5 },
    { date: '3/15', 筛查: 32, 高危: 8 },
  ]

  const highRiskRate = stats.completed > 0 
    ? ((stats.highRisk / stats.completed) * 100).toFixed(1) 
    : '0'

  const handleExport = () => {
    const session = sessions.find(s => s.id === currentSessionId)
    const filename = session 
      ? `${session.name}_筛查数据_${new Date().toISOString().split('T')[0]}.csv`
      : undefined
    exportToCSV(allSessionRecords, filename)
  }

  const displayRecords = activeTab === 'completed' ? completedRecords : allSessionRecords
  const currentVisibleCount = activeTab === 'completed' ? visibleCount : allVisibleCount
  const setCurrentVisibleCount = activeTab === 'completed' ? setVisibleCount : setAllVisibleCount

  const handleLoadMore = () => {
    setCurrentVisibleCount(prev => prev + 10)
  }

  const handleShowAll = () => {
    setCurrentVisibleCount(displayRecords.length)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="统计中心"
        subtitle="数据统计与分析"
        showBack
        backTo="/"
        rightContent={
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出整场数据
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">场次选择</h3>
          </div>
          <div className="flex gap-3">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => {
                  setCurrentSession(session.id)
                  setVisibleCount(10)
                  setAllVisibleCount(10)
                }}
                className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                  session.id === currentSessionId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`font-bold ${
                  session.id === currentSessionId ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {session.name}
                </p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {session.date}
                  </span>
                  <span>
                    {session.completedCount}/{session.totalCount} 人
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="筛查总数"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="完成数"
            value={stats.completed}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="高危人数"
            value={stats.highRisk}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
          />
          <StatCard
            title="高危比例"
            value={`${highRiskRate}%`}
            icon={<PieChart className="w-6 h-6" />}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              风险等级分布
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              每日筛查趋势
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="筛查" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="高危" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 -mx-6 px-6 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                已完成筛查
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === 'completed' ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stats.completed}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                完整筛查名单
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === 'all' ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stats.total}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              {displayRecords.length > currentVisibleCount && (
                <Button variant="ghost" size="sm" onClick={handleShowAll}>
                  展开全部
                </Button>
              )}
              <div className="text-sm text-gray-500">
                显示 {Math.min(currentVisibleCount, displayRecords.length)} / {displayRecords.length} 条
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {activeTab === 'completed' ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">姓名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">性别</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">年龄</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">BMI</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">血压</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">总分</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">风险等级</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">转诊状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRecords.slice(0, currentVisibleCount).map(record => (
                    <tr key={record.person.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{record.person.name}</td>
                      <td className="py-3 px-4 text-gray-600">{record.person.gender === 'male' ? '男' : '女'}</td>
                      <td className="py-3 px-4 text-gray-600">{record.person.age}岁</td>
                      <td className="py-3 px-4 text-gray-600">{record.vitals?.bmi || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {record.vitals?.systolicBp || '-'}/{record.vitals?.diastolicBp || '-'}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {record.assessment?.totalScore || 0}分
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={record.assessment?.riskLevel || 'low'} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        {record.referral ? (
                          <ReferralBadge status={record.referral.status} size="sm" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/screening/${record.person.id}`)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">序号</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">姓名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">性别</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">年龄</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">联系电话</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">筛查状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">风险等级</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">转诊状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRecords.slice(0, currentVisibleCount).map((record, idx) => (
                    <tr key={record.person.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{record.person.name}</td>
                      <td className="py-3 px-4 text-gray-600">{record.person.gender === 'male' ? '男' : '女'}</td>
                      <td className="py-3 px-4 text-gray-600">{record.person.age}岁</td>
                      <td className="py-3 px-4 text-gray-600">{record.person.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={record.person.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        {record.assessment ? (
                          <RiskBadge level={record.assessment.riskLevel} size="sm" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.referral ? (
                          <ReferralBadge status={record.referral.status} size="sm" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            if (record.person.status === 'registered') {
                              navigate(`/questionnaire/${record.person.id}`)
                            } else if (record.person.status === 'questionnaire_done') {
                              navigate(`/vitals/${record.person.id}`)
                            } else {
                              navigate(`/screening/${record.person.id}`)
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {record.person.status === 'registered' ? '去问诊' :
                           record.person.status === 'questionnaire_done' ? '去体测' :
                           record.person.status === 'vitals_done' ? '去评估' : '查看'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {displayRecords.length > currentVisibleCount && (
            <div className="text-center pt-4 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={handleLoadMore}>
                加载更多（+10条）
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
