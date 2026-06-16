import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, PieChart, Download, Users, AlertTriangle, TrendingUp, Calendar, FileSpreadsheet } from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAppStore } from '@/store/useAppStore'
import { exportToCSV } from '@/utils/export'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import StatCard from '@/components/Card/StatCard'

export default function Statistics() {
  const navigate = useNavigate()
  const { getStatistics, getCompletedRecords, sessions, currentSessionId, setCurrentSession } = useAppStore()
  
  const stats = getStatistics()
  const completedRecords = getCompletedRecords()

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
    exportToCSV(completedRecords)
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
            导出数据
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
                onClick={() => setCurrentSession(session.id)}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">已完成筛查列表</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              共 {stats.completed} 条记录
            </div>
          </div>
          
          <div className="overflow-x-auto">
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {completedRecords.slice(0, 10).map(record => (
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        record.assessment?.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                        record.assessment?.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {record.assessment?.riskLevel === 'high' ? '高风险' :
                         record.assessment?.riskLevel === 'medium' ? '中风险' : '低风险'}
                      </span>
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
          </div>
          
          {completedRecords.length > 10 && (
            <div className="text-center pt-4">
              <Button variant="outline" size="sm">
                加载更多
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
