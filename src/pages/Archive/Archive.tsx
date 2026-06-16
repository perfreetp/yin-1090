import { useState } from 'react'
import { Archive, AlertTriangle, CheckCircle, Clock, Users, FileText, Lock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { formatDateTime } from '@/utils/storage'
import { getRiskLevelText, getStatusText, getReferralStatusText } from '@/utils/assessment'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import { RiskBadge, StatusBadge, ReferralBadge } from '@/components/Badge/Badge'

export default function ArchivePage() {
  const { sessions, currentSessionId, isSessionArchived, archiveSession } = useAppStore()
  const [archiving, setArchiving] = useState(false)

  const currentSession = sessions.find(s => s.id === currentSessionId)
  const archived = isSessionArchived()
  const summary = currentSession?.archiveSummary

  const handleArchive = () => {
    setArchiving(true)
    archiveSession()
    setArchiving(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="归档管理"
        subtitle="活动收尾与数据交接"
        showBack
        backTo="/"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {currentSession && (
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{currentSession.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {currentSession.date} · {currentSession.location}
                </p>
              </div>
              {archived ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">已归档</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">进行中</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {!archived && (
          <Card>
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
                <Archive className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">结束场次并归档</h3>
              <p className="text-base text-gray-500 mb-6 max-w-md mx-auto">
                归档后将生成收尾摘要，筛查数据锁定，修改需填写修改说明
              </p>
              <Button
                size="lg"
                onClick={handleArchive}
                disabled={archiving}
                className="min-w-[200px]"
              >
                <Archive className="w-5 h-5 mr-2" />
                结束场次并归档
              </Button>
            </div>
          </Card>
        )}

        {archived && currentSession?.archivedAt && (
          <Card>
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-amber-500" />
              <span className="text-base font-medium text-gray-900">
                归档时间：{formatDateTime(currentSession.archivedAt)}
              </span>
            </div>
            <p className="text-sm text-amber-600 ml-8">
              归档后筛查数据已锁定，修改需填写修改说明
            </p>
          </Card>
        )}

        {archived && summary && (
          <>
            <div className="grid grid-cols-5 gap-4">
              <Card className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{summary.totalPeople}</p>
                <p className="text-sm text-gray-500 mt-1">总人数</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{summary.completedPeople}</p>
                <p className="text-sm text-gray-500 mt-1">已完成</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">{summary.incompletePeople}</p>
                <p className="text-sm text-gray-500 mt-1">未完成</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-amber-600">{summary.pendingReview}</p>
                <p className="text-sm text-gray-500 mt-1">待复核</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600">{summary.pendingFollowUp}</p>
                <p className="text-sm text-gray-500 mt-1">待随访</p>
              </Card>
            </div>

            {summary.incompleteList.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  未完成名单
                  <span className="text-sm font-normal text-gray-500">
                    （{summary.incompleteList.length}人）
                  </span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">姓名</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">年龄</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">性别</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.incompleteList.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                          <td className="py-3 px-4 text-gray-600">{item.age}岁</td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.gender === 'male' ? '男' : '女'}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={item.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {summary.highRiskList.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  高危交接清单
                  <span className="text-sm font-normal text-gray-500">
                    （{summary.highRiskList.length}人）
                  </span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">姓名</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">年龄</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">性别</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">电话</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">风险等级</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">转诊状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.highRiskList.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                          <td className="py-3 px-4 text-gray-600">{item.age}岁</td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.gender === 'male' ? '男' : '女'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.phone || '-'}</td>
                          <td className="py-3 px-4">
                            <RiskBadge level={item.riskLevel} size="sm" />
                          </td>
                          <td className="py-3 px-4">
                            {item.referralStatus ? (
                              <ReferralBadge status={item.referralStatus} size="sm" />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
