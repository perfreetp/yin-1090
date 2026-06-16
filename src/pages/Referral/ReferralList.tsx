import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, Search, Clock, CheckCircle, XCircle, Filter, Calendar, Hospital,
  Phone, UserCheck, MapPin, X, Plus, MessageSquare, AlertCircle, ChevronDown
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { 
  getFollowUpStatusText, getFollowUpStatusColor
} from '@/utils/assessment'
import { formatDateTime } from '@/utils/storage'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import Input from '@/components/Form/Input'
import { ReferralBadge, RiskBadge } from '@/components/Badge/Badge'
import type { ReferralStatus, FollowUpStatus, FollowUpRecord } from '@/types'

type FilterType = 'all' | ReferralStatus | FollowUpStatus

const FOLLOW_UP_STEPS: { key: FollowUpStatus; label: string; icon: typeof Phone }[] = [
  { key: 'pending_contact', label: '待联系', icon: Phone },
  { key: 'contacted', label: '已联系家属', icon: Phone },
  { key: 'scheduled', label: '已预约医院', icon: Calendar },
  { key: 'arrived', label: '已到院', icon: MapPin },
  { key: 'no_show', label: '未到院', icon: XCircle },
  { key: 'completed', label: '随访完成', icon: CheckCircle },
]

export default function ReferralList() {
  const navigate = useNavigate()
  const { 
    getReferralRecords, updateReferralStatus, 
    updateReferralFollowUp, addFollowUpRecord 
  } = useAppStore()
  
  const [searchText, setSearchText] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [followUpForm, setFollowUpForm] = useState({
    status: 'contacted' as FollowUpStatus,
    contactPerson: '',
    note: '',
    scheduledDate: '',
    noShowReason: ''
  })

  const records = getReferralRecords()
  
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.person.name.includes(searchText) || 
                          r.person.phone.includes(searchText)
    if (filter === 'all') return matchesSearch
    if (['pending', 'referred', 'completed', 'cancelled'].includes(filter)) {
      return matchesSearch && r.referral?.status === filter
    }
    return matchesSearch && r.referral?.followUpProgress === filter
  })

  const stats = {
    all: records.length,
    pending: records.filter(r => r.referral?.status === 'pending').length,
    referred: records.filter(r => r.referral?.status === 'referred').length,
    completed: records.filter(r => r.referral?.status === 'completed').length,
    pending_contact: records.filter(r => r.referral?.followUpProgress === 'pending_contact').length,
    contacted: records.filter(r => r.referral?.followUpProgress === 'contacted').length,
    scheduled: records.filter(r => r.referral?.followUpProgress === 'scheduled').length,
    arrived: records.filter(r => r.referral?.followUpProgress === 'arrived').length,
    no_show: records.filter(r => r.referral?.followUpProgress === 'no_show').length,
  }

  const openFollowUpModal = (personId: string) => {
    setSelectedPersonId(personId)
    const record = records.find(r => r.person.id === personId)
    setFollowUpForm({
      status: record?.referral?.followUpProgress || 'contacted',
      contactPerson: '',
      note: '',
      scheduledDate: record?.referral?.scheduledDate || '',
      noShowReason: record?.referral?.noShowReason || ''
    })
    setShowFollowUpModal(true)
  }

  const handleSaveFollowUp = () => {
    if (!selectedPersonId) return
    if (!followUpForm.contactPerson.trim()) {
      alert('请填写联系人')
      return
    }

    const updateData: Parameters<typeof updateReferralFollowUp>[2] = {}
    if (followUpForm.status === 'scheduled' && followUpForm.scheduledDate) {
      updateData.scheduledDate = followUpForm.scheduledDate
    }
    if (followUpForm.status === 'no_show' && followUpForm.noShowReason) {
      updateData.noShowReason = followUpForm.noShowReason
    }

    updateReferralFollowUp(selectedPersonId, followUpForm.status, updateData)
    addFollowUpRecord(selectedPersonId, {
      status: followUpForm.status,
      contactPerson: followUpForm.contactPerson.trim(),
      note: followUpForm.note.trim()
    })

    setShowFollowUpModal(false)
    setSelectedPersonId(null)
  }

  const handleStatusUpdate = (personId: string, status: ReferralStatus) => {
    updateReferralStatus(personId, status, '')
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const filters: { key: FilterType; label: string; icon: typeof FileText }[] = [
    { key: 'all', label: '全部', icon: FileText },
    { key: 'referred', label: '已转诊', icon: Hospital },
    { key: 'pending_contact', label: '待联系', icon: Phone },
    { key: 'contacted', label: '已联系', icon: Phone },
    { key: 'scheduled', label: '已预约', icon: Calendar },
    { key: 'arrived', label: '已到院', icon: MapPin },
    { key: 'completed', label: '已完成', icon: CheckCircle },
  ]

  const getCurrentStepIndex = (status: FollowUpStatus): number => {
    return FOLLOW_UP_STEPS.findIndex(s => s.key === status)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="转诊清单"
        subtitle="管理高危人群转诊与随访"
        showBack
        backTo="/"
      />

      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex gap-2 flex-wrap">
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
                    ({stats[f.key as keyof typeof stats] || 0})
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

              const isExpanded = expandedId === person.id
              const currentStepIdx = getCurrentStepIndex(referral.followUpProgress)

              return (
                <Card key={person.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">
                            {person.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-bold text-gray-900">{person.name}</h4>
                            <ReferralBadge status={referral.status} size="sm" />
                            {assessment && <RiskBadge level={assessment.riskLevel} size="sm" />}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFollowUpStatusColor(referral.followUpProgress)}`}>
                              {getFollowUpStatusText(referral.followUpProgress)}
                            </span>
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
                              转诊日期：{referral.referralDate || '未安排'}
                            </span>
                            {referral.scheduledDate && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Calendar className="w-4 h-4" />
                                预约：{referral.scheduledDate}
                              </span>
                            )}
                          </div>
                          {referral.noShowReason && (
                            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              未到院原因：{referral.noShowReason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div 
                        className="mt-4 cursor-pointer"
                        onClick={() => toggleExpand(person.id)}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700">随访进度</p>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex items-center justify-between">
                            {FOLLOW_UP_STEPS.map((step, idx) => {
                              const Icon = step.icon
                              const isDone = idx <= currentStepIdx
                              const isCurrent = idx === currentStepIdx
                              return (
                                <div key={step.key} className="flex flex-col items-center relative flex-1">
                                  {idx < FOLLOW_UP_STEPS.length - 1 && (
                                    <div className={`absolute top-3 left-1/2 w-full h-1 ${
                                      idx < currentStepIdx ? 'bg-green-400' : 'bg-gray-200'
                                    }`} />
                                  )}
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                                    isCurrent 
                                      ? 'bg-blue-500 ring-4 ring-blue-100' 
                                      : isDone 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-300'
                                  }`}>
                                    <Icon className={`w-3 h-3 ${isDone || isCurrent ? 'text-white' : 'text-gray-500'}`} />
                                  </div>
                                  <span className={`text-xs mt-1.5 text-center ${
                                    isCurrent ? 'text-blue-600 font-medium' : 
                                    isDone ? 'text-gray-700' : 'text-gray-400'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            随访记录
                          </h5>
                          {referral.followUpRecords && referral.followUpRecords.length > 0 ? (
                            <div className="space-y-3">
                              {[...referral.followUpRecords].reverse().map((f: FollowUpRecord) => (
                                <div key={f.id} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFollowUpStatusColor(f.status)}`}>
                                        {getFollowUpStatusText(f.status)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        联系人：{f.contactPerson}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {formatDateTime(f.createdAt)}
                                    </span>
                                  </div>
                                  {f.note && (
                                    <p className="text-sm text-gray-600">{f.note}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-4">暂无随访记录</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/screening/${person.id}`)}
                      >
                        查看详情
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openFollowUpModal(person.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        记录随访
                      </Button>
                      
                      {referral.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(person.id, 'completed')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          转诊完成
                        </Button>
                      )}
                      {referral.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-400 text-red-600 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(person.id, 'cancelled')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          取消转诊
                        </Button>
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

      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">记录随访</h3>
              <button
                onClick={() => {
                  setShowFollowUpModal(false)
                  setSelectedPersonId(null)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前随访状态 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FOLLOW_UP_STEPS.map(step => {
                    const Icon = step.icon
                    const isSelected = followUpForm.status === step.key
                    return (
                      <button
                        key={step.key}
                        type="button"
                        onClick={() => setFollowUpForm(prev => ({ ...prev, status: step.key }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-2 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {step.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系人 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="请输入联系人姓名或关系"
                  value={followUpForm.contactPerson}
                  onChange={(e) => setFollowUpForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                />
              </div>

              {followUpForm.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预约日期
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                    value={followUpForm.scheduledDate}
                    onChange={(e) => setFollowUpForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
              )}

              {followUpForm.status === 'no_show' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    未到院原因 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="请描述未到院的原因"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                    value={followUpForm.noShowReason}
                    onChange={(e) => setFollowUpForm(prev => ({ ...prev, noShowReason: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  随访备注
                </label>
                <textarea
                  rows={3}
                  placeholder="请记录随访过程中的重要信息、家属反馈等"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                  value={followUpForm.note}
                  onChange={(e) => setFollowUpForm(prev => ({ ...prev, note: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowFollowUpModal(false)
                  setSelectedPersonId(null)
                }}
              >
                取消
              </Button>
              <Button onClick={handleSaveFollowUp}>
                <CheckCircle className="w-4 h-4 mr-1" />
                保存随访记录
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
