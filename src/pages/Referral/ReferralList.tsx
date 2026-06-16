import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, Clock, CheckCircle, XCircle, Filter, Calendar, Hospital } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import Input from '@/components/Form/Input'
import { ReferralBadge, RiskBadge } from '@/components/Badge/Badge'
import type { ReferralStatus } from '@/types'

type FilterType = 'all' | ReferralStatus

export default function ReferralList() {
  const navigate = useNavigate()
  const { getReferralRecords, updateReferralStatus } = useAppStore()
  
  const [searchText, setSearchText] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [followUpNote, setFollowUpNote] = useState('')

  const records = getReferralRecords()
  
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.person.name.includes(searchText) || 
                          r.person.phone.includes(searchText)
    const matchesFilter = filter === 'all' || r.referral?.status === filter
    return matchesSearch && matchesFilter
  })

  const stats = {
    all: records.length,
    pending: records.filter(r => r.referral?.status === 'pending').length,
    referred: records.filter(r => r.referral?.status === 'referred').length,
    completed: records.filter(r => r.referral?.status === 'completed').length,
  }

  const handleStatusUpdate = (personId: string, status: ReferralStatus) => {
    if (status === 'completed' && !followUpNote) {
      setEditingId(personId)
      return
    }
    updateReferralStatus(personId, status, followUpNote)
    setEditingId(null)
    setFollowUpNote('')
  }

  const filters: { key: FilterType; label: string; icon: typeof FileText }[] = [
    { key: 'all', label: '全部', icon: FileText },
    { key: 'pending', label: '待转诊', icon: Clock },
    { key: 'referred', label: '已转诊', icon: Hospital },
    { key: 'completed', label: '已完成', icon: CheckCircle },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="转诊清单"
        subtitle="管理高危人群转诊情况"
        showBack
        backTo="/"
      />

      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {filters.map(f => {
              const Icon = f.icon
              const isActive = filter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {f.label}
                  <span className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    ({stats[f.key]})
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex-1 max-w-xs ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索姓名、电话..."
                className="pl-10"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filteredRecords.length > 0 ? (
          <div className="grid gap-4">
            {filteredRecords.map(record => {
              const { person, assessment, referral } = record
              if (!referral) return null

              return (
                <Card key={person.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          {person.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-gray-900">{person.name}</h4>
                          <ReferralBadge status={referral.status} size="sm" />
                          {assessment && <RiskBadge level={assessment.riskLevel} size="sm" />}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {person.age}岁 · {person.gender === 'male' ? '男' : '女'} · {person.phone}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Hospital className="w-4 h-4" />
                            {referral.hospital || '未指定医院'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {referral.referralDate || '未安排'}
                          </span>
                        </div>
                        {referral.followUpNote && (
                          <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg">
                            随访记录：{referral.followUpNote}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/screening/${person.id}`)}
                      >
                        查看详情
                      </Button>
                      
                      {editingId === person.id ? (
                        <div className="space-y-2">
                          <textarea
                            placeholder="请输入随访记录"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                            rows={2}
                            value={followUpNote}
                            onChange={(e) => setFollowUpNote(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(person.id, 'completed')}
                            >
                              确认完成
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(null)
                                setFollowUpNote('')
                              }}
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {referral.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(person.id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              标记完成
                            </Button>
                          )}
                          {referral.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(person.id, 'cancelled')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              取消转诊
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">暂无转诊记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
