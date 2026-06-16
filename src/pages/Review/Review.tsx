import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Eye, CheckCircle, Clock, AlertTriangle, FileText, User, 
  Search, Filter, ChevronRight, X, AlertCircle, XCircle 
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { 
  getRiskLevelText, getReviewStatusText, getReviewStatusColor,
  getStatusText
} from '@/utils/assessment'
import { formatDateTime } from '@/utils/storage'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import Input from '@/components/Form/Input'
import { RiskBadge, StatusBadge } from '@/components/Badge/Badge'
import type { ScreeningRecord, ReviewStatus } from '@/types'

type FilterKey = 'all' | 'high' | 'medium' | 'missing' | 'referred' | 'pending_review' | 'reviewed' | 'needs_review'

const filterConfigs: Record<FilterKey, { label: string; icon: typeof Clock; color: string }> = {
  all: { label: '全部', icon: User, color: 'bg-gray-500' },
  high: { label: '高风险', icon: AlertTriangle, color: 'bg-red-500' },
  medium: { label: '中风险', icon: Clock, color: 'bg-amber-500' },
  missing: { label: '信息缺失', icon: AlertCircle, color: 'bg-orange-500' },
  referred: { label: '已转诊', icon: FileText, color: 'bg-blue-500' },
  pending_review: { label: '待复核', icon: Clock, color: 'bg-amber-500' },
  reviewed: { label: '已复核', icon: CheckCircle, color: 'bg-green-500' },
  needs_review: { label: '需再核', icon: XCircle, color: 'bg-red-500' }
}

export default function Review() {
  const navigate = useNavigate()
  const { getRecordsForReview, markAsReviewed, markAsNeedsReview, getCurrentSessionRecords } = useAppStore()
  
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [searchText, setSearchText] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<ScreeningRecord | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewerName, setReviewerName] = useState('')

  const getFilteredRecords = () => {
    let records: ScreeningRecord[] = []
    
    switch (activeFilter) {
      case 'high':
        records = getRecordsForReview({ riskLevel: 'high' })
        break
      case 'medium':
        records = getRecordsForReview({ riskLevel: 'medium' })
        break
      case 'missing':
        records = getRecordsForReview({ hasMissingData: true })
        break
      case 'referred':
        records = getRecordsForReview({ isReferred: true })
        break
      case 'pending_review':
        records = getRecordsForReview({ reviewStatus: 'pending' })
        break
      case 'reviewed':
        records = getRecordsForReview({ reviewStatus: 'reviewed' })
        break
      case 'needs_review':
        records = getRecordsForReview({ reviewStatus: 'needs_review' })
        break
      default:
        records = getRecordsForReview()
    }
    
    if (searchText) {
      records = records.filter(r => 
        r.person.name.includes(searchText) || 
        r.person.phone.includes(searchText)
      )
    }
    
    return records
  }

  const filteredRecords = getFilteredRecords()
  const allRecords = getCurrentSessionRecords()
  
  const stats = {
    total: allRecords.filter(r => r.person.status === 'completed').length,
    pending: getRecordsForReview({ reviewStatus: 'pending' }).length,
    reviewed: getRecordsForReview({ reviewStatus: 'reviewed' }).length,
    needsReview: getRecordsForReview({ reviewStatus: 'needs_review' }).length,
    highRisk: getRecordsForReview({ riskLevel: 'high' }).length,
    referred: getRecordsForReview({ isReferred: true }).length
  }

  const openDetail = (record: ScreeningRecord) => {
    setSelectedRecord(record)
    setShowDetailModal(true)
    setReviewNotes(record.review?.notes || '')
  }

  const handleMarkReviewed = () => {
    if (!selectedRecord) return
    if (!reviewerName.trim()) {
      alert('请输入复核人姓名')
      return
    }
    markAsReviewed(selectedRecord.person.id, {
      reviewedBy: reviewerName.trim(),
      notes: reviewNotes.trim()
    })
    const updated = getRecordsForReview().find(r => r.person.id === selectedRecord.person.id)
    if (updated) setSelectedRecord(updated)
  }

  const handleMarkNeedsReview = () => {
    if (!selectedRecord) return
    if (!reviewNotes.trim()) {
      alert('请注明需要再次复核的原因')
      return
    }
    markAsNeedsReview(selectedRecord.person.id, reviewNotes.trim())
    const updated = getRecordsForReview().find(r => r.person.id === selectedRecord.person.id)
    if (updated) setSelectedRecord(updated)
  }

  const getReviewStatus = (record: ScreeningRecord): ReviewStatus => {
    if (record.review) return record.review.status
    return 'pending'
  }

  const hasMissingData = (record: ScreeningRecord): boolean => {
    if (!record.questionnaire || !record.vitals) return true
    return !record.questionnaire.medicalHistory || !record.vitals.waistCircumference
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="复核台"
        subtitle="活动收尾·结果复核管理"
        showBack
        backTo="/"
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-6 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">需复核总数</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-gray-500">待复核</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.reviewed}</p>
              <p className="text-xs text-gray-500">已复核</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.needsReview}</p>
              <p className="text-xs text-gray-500">需再核</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
              <p className="text-xs text-gray-500">高风险</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.referred}</p>
              <p className="text-xs text-gray-500">已转诊</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索姓名或电话..."
                className="pl-10"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(Object.keys(filterConfigs) as FilterKey[]).map(key => {
                const config = filterConfigs[key]
                const Icon = config.icon
                return (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeFilter === key
                        ? `${config.color} text-white`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-3">
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => {
                const reviewStatus = getReviewStatus(record)
                const isMissing = hasMissingData(record)
                
                return (
                  <Card key={record.person.id} className="hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {record.assessment && (
                          <RiskBadge level={record.assessment.riskLevel} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-gray-900">{record.person.name}</h4>
                          <span className="text-sm text-gray-500">
                            {record.person.age}岁·{record.person.gender === 'male' ? '男' : '女'}
                          </span>
                          {isMissing && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              信息缺失
                            </span>
                          )}
                          {record.referral && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              已转诊
                            </span>
                          )}
                          {record.assessment?.isReassessment && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              第{record.assessment.reassessmentCount}次重评
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>电话：{record.person.phone || '-'}</span>
                          <span>
                            血压：{record.vitals?.systolicBp || '-'}/{record.vitals?.diastolicBp || '-'}
                          </span>
                          <span>
                            总分：{record.assessment?.totalScore || 0}分
                          </span>
                        </div>
                        {record.review && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${getReviewStatusColor(reviewStatus)}`}>
                              {getReviewStatusText(reviewStatus)}
                            </span>
                            <span className="text-gray-400">
                              {record.review.reviewedBy ? `复核人：${record.review.reviewedBy}` : ''}
                              {record.review.reviewedAt ? ` · ${formatDateTime(record.review.reviewedAt)}` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/screening/${record.person.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看详情
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openDetail(record)}
                        >
                          复核
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-16">
                <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400">没有符合筛选条件的记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  复核 - {selectedRecord.person.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedRecord.person.age}岁 · {selectedRecord.person.gender === 'male' ? '男' : '女'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedRecord(null)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-220px)]">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">风险等级</p>
                  {selectedRecord.assessment && (
                    <RiskBadge level={selectedRecord.assessment.riskLevel} />
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">评估总分</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedRecord.assessment?.totalScore || 0}/
                    {selectedRecord.assessment?.maxScore || 11}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">复核状态</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getReviewStatusColor(getReviewStatus(selectedRecord))}`}>
                    {getReviewStatusText(getReviewStatus(selectedRecord))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">血压：</span>
                  <span className="font-medium">
                    {selectedRecord.vitals?.systolicBp || '-'}/{selectedRecord.vitals?.diastolicBp || '-'} mmHg
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">BMI：</span>
                  <span className="font-medium">{selectedRecord.vitals?.bmi || '-'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">颈围：</span>
                  <span className="font-medium">{selectedRecord.vitals?.neckCircumference || '-'} cm</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">既往病史：</span>
                  <span className="font-medium">
                    {selectedRecord.questionnaire?.medicalHistory || '未填写'}
                  </span>
                </div>
              </div>

              {selectedRecord.referral && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">转诊信息</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-600">转诊医院：</span>
                      <span className="text-blue-900 font-medium">{selectedRecord.referral.hospital}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">转诊日期：</span>
                      <span className="text-blue-900 font-medium">{selectedRecord.referral.referralDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedRecord.assessment?.scoreDetails && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">评分明细</h4>
                  <div className="space-y-2">
                    {selectedRecord.assessment.scoreDetails.map((d, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="text-gray-700">{d.name}</span>
                        <span className={`font-medium ${d.score > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {d.score}/{d.maxScore}分
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  复核人姓名 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="请输入复核人姓名"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  复核备注
                  <span className="text-gray-400 text-xs ml-1">（标注"需再核"时必填）</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="请输入复核意见或需再核原因..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                />
              </div>

              {selectedRecord.review && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-2">上次复核记录</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>状态：
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getReviewStatusColor(selectedRecord.review.status)}`}>
                        {getReviewStatusText(selectedRecord.review.status)}
                      </span>
                    </p>
                    <p>复核人：{selectedRecord.review.reviewedBy || '-'}</p>
                    <p>复核时间：{selectedRecord.review.reviewedAt ? formatDateTime(selectedRecord.review.reviewedAt) : '-'}</p>
                    {selectedRecord.review.notes && (
                      <p>备注：{selectedRecord.review.notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedRecord(null)
                }}
              >
                取消
              </Button>
              <Button 
                variant="outline"
                className="border-red-400 text-red-600 hover:bg-red-50"
                onClick={handleMarkNeedsReview}
              >
                <XCircle className="w-4 h-4 mr-1" />
                需再核
              </Button>
              <Button onClick={handleMarkReviewed}>
                <CheckCircle className="w-4 h-4 mr-1" />
                确认复核通过
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
