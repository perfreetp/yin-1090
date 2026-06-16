import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  AlertTriangle, FileText, MessageSquareText, Printer, ChevronDown, ChevronUp, 
  Download, AlertCircle, ArrowRight, RefreshCw, Clock, CheckCircle, 
  TrendingUp, TrendingDown, Minus, History 
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { getRiskLevelText, getRiskLevelBgColor, getRiskLevelColor } from '@/utils/assessment'
import { printResult } from '@/utils/export'
import { formatDateTime } from '@/utils/storage'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import { RiskBadge } from '@/components/Badge/Badge'
import type { Assessment, ScoreDetail } from '@/types'

interface MissingField {
  name: string
  step: string
  stepLabel: string
}

interface ScoreDiff {
  name: string
  oldScore: number
  newScore: number
  oldDesc: string
  newDesc: string
  changed: boolean
}

export default function AssessmentPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { 
    getPersonById, performAssessment, rePerformAssessment, refreshAssessment, 
    saveDeepInterview, currentPersonId, setCurrentPerson, addReferral 
  } = useAppStore()
  
  const personId = params.id || currentPersonId
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [previousAssessment, setPreviousAssessment] = useState<Assessment | null>(null)
  const [showDeepInterview, setShowDeepInterview] = useState(false)
  const [deepInterviewData, setDeepInterviewData] = useState({
    familyFeedback: '',
    notes: ''
  })
  const [referralHospital, setReferralHospital] = useState('')
  const [showReferralForm, setShowReferralForm] = useState(false)
  const [missingFields, setMissingFields] = useState<MissingField[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  useEffect(() => {
    if (personId) {
      setCurrentPerson(personId)
      const record = getPersonById(personId)
      
      if (record?.assessment) {
        if (record.person.status === 'completed' && record.questionnaire && record.vitals) {
          const v = record.vitals
          if (v.height && v.weight && v.systolicBp && v.diastolicBp && v.neckCircumference) {
            const freshResult = refreshAssessment(personId)
            if (freshResult) {
              setAssessment(freshResult)
              const updated = getPersonById(personId)
              if (updated?.assessmentHistory && updated.assessmentHistory.length >= 2) {
                const len = updated.assessmentHistory.length
                setPreviousAssessment(updated.assessmentHistory[len - 2])
                setShowDiff(true)
              }
            } else {
              setAssessment(record.assessment)
            }
          } else {
            setAssessment(record.assessment)
          }
        } else {
          setAssessment(record.assessment)
        }
        setMissingFields([])
        if (record.questionnaire) {
          setDeepInterviewData({
            familyFeedback: record.questionnaire.familyFeedback || '',
            notes: record.questionnaire.notes || ''
          })
        }
        if (record.assessmentHistory && record.assessmentHistory.length >= 2) {
          const len = record.assessmentHistory.length
          setPreviousAssessment(record.assessmentHistory[len - 2])
        }
      } else {
        const missing: MissingField[] = []
        if (!record?.questionnaire) {
          missing.push({ name: '问诊问卷', step: '/questionnaire', stepLabel: '快速问询' })
        }
        if (!record?.vitals) {
          missing.push({ name: '体征数据', step: '/vitals', stepLabel: '体征录入' })
        } else {
          const v = record.vitals
          if (!v.height || !v.weight) {
            missing.push({ name: '身高/体重', step: '/vitals', stepLabel: '体征录入' })
          }
          if (!v.systolicBp || !v.diastolicBp) {
            missing.push({ name: '血压', step: '/vitals', stepLabel: '体征录入' })
          }
          if (!v.neckCircumference) {
            missing.push({ name: '颈围', step: '/vitals', stepLabel: '体征录入' })
          }
        }
        
        if (missing.length > 0) {
          setMissingFields(missing)
          setAssessment(null)
        } else if (record?.questionnaire && record?.vitals) {
          const result = performAssessment(personId)
          setAssessment(result)
          setMissingFields([])
        }
      }
    }
  }, [personId, getPersonById, performAssessment, refreshAssessment, setCurrentPerson])

  const record = personId ? getPersonById(personId) : undefined

  const handleReAssess = () => {
    if (!personId) return
    const result = rePerformAssessment(personId)
    if (result) {
      setAssessment(result)
      const updated = getPersonById(personId)
      if (updated?.assessmentHistory && updated.assessmentHistory.length >= 2) {
        const len = updated.assessmentHistory.length
        setPreviousAssessment(updated.assessmentHistory[len - 2])
      }
      setShowDiff(true)
    }
  }

  const handleSaveDeepInterview = () => {
    if (!personId) return
    saveDeepInterview(personId, deepInterviewData)
    setShowDeepInterview(false)
    const updated = getPersonById(personId)
    if (updated?.assessment) {
      setAssessment(updated.assessment)
    }
  }

  const handleAddReferral = () => {
    if (!personId) return
    if (!referralHospital) {
      alert('请输入转诊医院')
      return
    }
    addReferral(personId, referralHospital)
    setShowReferralForm(false)
    setReferralHospital('')
    alert('已加入转诊清单')
  }

  const handlePrint = () => {
    if (record) {
      printResult(record)
    }
  }

  const goToMissingStep = (step: string) => {
    navigate(step + (personId ? `/${personId}` : ''))
  }

  const calculateScoreDiffs = (): ScoreDiff[] => {
    if (!assessment || !previousAssessment) return []
    
    return assessment.scoreDetails.map((newDetail, idx) => {
      const oldDetail = previousAssessment.scoreDetails[idx]
      return {
        name: newDetail.name,
        oldScore: oldDetail?.score || 0,
        newScore: newDetail.score,
        oldDesc: oldDetail?.description || '-',
        newDesc: newDetail.description,
        changed: (oldDetail?.score || 0) !== newDetail.score
      }
    })
  }

  const scoreDiffs = calculateScoreDiffs()
  const hasScoreChanges = scoreDiffs.some(d => d.changed)

  if (!record) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="风险判定" showBack backTo="/" />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          请先选择筛查对象
        </div>
      </div>
    )
  }

  const hasMissing = missingFields.length > 0
  const gaugePercent = assessment ? (assessment.totalScore / assessment.maxScore) * 100 : 0
  const riskColor = assessment?.riskLevel === 'high' ? '#ef4444' :
    assessment?.riskLevel === 'medium' ? '#f59e0b' : '#22c55e'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="风险判定"
        subtitle="自动评分与风险分级"
        showBack
        backTo={personId ? `/screening/${personId}` : '/'}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {hasMissing ? (
            <Card className="border-red-300 bg-red-50/30">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900 mb-2">数据不完整，无法进行风险判定</h3>
                  <p className="text-red-700 mb-4">
                    请先补全以下必填信息，避免空值被误判为低风险：
                  </p>
                  <div className="space-y-2">
                    {missingFields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                        <span className="text-red-800 font-medium">缺少：{field.name}</span>
                        <Button size="sm" variant="outline" onClick={() => goToMissingStep(field.step)}>
                          去{field.stepLabel}补全
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {assessment?.isReassessment && (
                <Card className="border-purple-300 bg-purple-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <RefreshCw className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-900">
                          第 {assessment.reassessmentCount} 次重新评估
                        </h4>
                        <p className="text-sm text-purple-700">
                          已根据最新体征和问诊信息重新计算评分
                        </p>
                      </div>
                    </div>
                    {previousAssessment && (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant={showDiff ? 'primary' : 'outline'}
                          onClick={() => setShowDiff(!showDiff)}
                        >
                          {showDiff ? '隐藏差异' : '查看差异'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setShowHistory(!showHistory)}
                        >
                          <History className="w-4 h-4 mr-1" />
                          历史记录
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {showDiff && previousAssessment && hasScoreChanges && (
                <Card className="border-amber-300 bg-amber-50/30">
                  <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    评分变化对比
                  </h3>
                  <div className="space-y-3">
                    {scoreDiffs.filter(d => d.changed).map((diff, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{diff.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {diff.oldScore}分 → 
                            </span>
                            <span className={`text-sm font-bold ${
                              diff.newScore > diff.oldScore ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {diff.newScore > diff.oldScore ? '+' : ''}{diff.newScore - diff.oldScore}分
                            </span>
                            {diff.newScore > diff.oldScore ? (
                              <TrendingUp className="w-4 h-4 text-red-500" />
                            ) : diff.newScore < diff.oldScore ? (
                              <TrendingDown className="w-4 h-4 text-green-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="text-gray-400">原由：{diff.oldDesc}</span>
                          <br />
                          <span className="text-amber-700 font-medium">现为：{diff.newDesc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-white rounded-lg border border-amber-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">总分变化</p>
                        <p className="text-2xl font-bold">
                          <span className="text-gray-400 line-through mr-2">
                            {previousAssessment.totalScore}分
                          </span>
                          <span className={
                            assessment.totalScore > previousAssessment.totalScore 
                              ? 'text-red-600' 
                              : assessment.totalScore < previousAssessment.totalScore
                                ? 'text-green-600'
                                : 'text-gray-900'
                          }>
                            {assessment.totalScore}分
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <RiskBadge level={previousAssessment.riskLevel} size="sm" />
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <RiskBadge level={assessment.riskLevel} size="sm" />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {showHistory && record.assessmentHistory.length > 0 && (
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    评估历史记录
                  </h3>
                  <div className="space-y-3">
                    {[...record.assessmentHistory].reverse().map((hist, idx) => (
                      <div 
                        key={hist.id}
                        className={`p-4 rounded-xl border-2 ${
                          assessment?.id === hist.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {assessment?.id === hist.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {idx === 0 ? '当前结果' : `第 ${record.assessmentHistory.length - idx} 次评估`}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(hist.assessedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-gray-900">
                              {hist.totalScore}/{hist.maxScore}分
                            </span>
                            <RiskBadge level={hist.riskLevel} size="sm" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="text-center py-8">
                <h3 className="text-lg text-gray-600 mb-2">{record.person.name} 的筛查结果</h3>
                <p className="text-sm text-gray-400 mb-6">
                  {record.person.age}岁 · {record.person.gender === 'male' ? '男' : '女'}
                </p>
                
                <div className="relative w-64 h-64 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                      fill="none"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      stroke={riskColor}
                      strokeWidth="20"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${gaugePercent * 6.28} 628`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold" style={{ color: riskColor }}>
                      {assessment?.totalScore || 0}
                    </div>
                    <div className="text-gray-500 mt-1">/ {assessment?.maxScore || 11} 分</div>
                    <div className="mt-3">
                      {assessment && <RiskBadge level={assessment.riskLevel} />}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600">
                  {assessment?.riskLevel === 'low' && '睡眠呼吸暂停风险较低，建议保持健康生活方式。'}
                  {assessment?.riskLevel === 'medium' && '存在一定睡眠呼吸暂停风险，建议进一步检查。'}
                  {assessment?.riskLevel === 'high' && '睡眠呼吸暂停风险较高，建议尽快就医进行多导睡眠监测。'}
                </p>

                {assessment?.assessedAt && (
                  <p className="text-sm text-gray-400 mt-4">
                    评估时间：{formatDateTime(assessment.assessedAt)}
                  </p>
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">评分明细</h3>
                  {assessment && record.person.status === 'completed' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleReAssess}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      重新评估
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {assessment?.scoreDetails.map((detail, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-gray-700 font-medium">{detail.name}</span>
                        <span className={`text-sm font-medium ${
                          detail.score > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {detail.score} / {detail.maxScore} 分
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            detail.score > 0 ? 'bg-red-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${(detail.score / detail.maxScore) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{detail.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {assessment?.needDeepInterview && (
                <Card className={assessment.deepInterviewDone ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'}>
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowDeepInterview(!showDeepInterview)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <MessageSquareText className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">深度问诊</h3>
                        <p className="text-sm text-gray-500">
                          {assessment.deepInterviewDone ? '已完成' : '高危人群，建议加做深度问诊'}
                        </p>
                      </div>
                    </div>
                    {showDeepInterview ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </div>

                  {showDeepInterview && (
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          家属反馈
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          rows={3}
                          placeholder="请记录家属观察到的情况，如打鼾声音大小、呼吸暂停时长等"
                          value={deepInterviewData.familyFeedback}
                          onChange={(e) => setDeepInterviewData(prev => ({ ...prev, familyFeedback: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          现场备注
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          rows={3}
                          placeholder="请记录现场观察、特殊情况说明等"
                          value={deepInterviewData.notes}
                          onChange={(e) => setDeepInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>
                      <Button onClick={handleSaveDeepInterview} className="w-full">
                        保存深度问诊记录
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">基本信息回顾</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">年龄</span>
                    <span className="font-medium text-gray-900">{record.person.age} 岁</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">性别</span>
                    <span className="font-medium text-gray-900">{record.person.gender === 'male' ? '男' : '女'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">BMI</span>
                    <span className={`font-medium ${
                      record.vitals?.bmi >= 28 ? 'text-red-600' :
                      record.vitals?.bmi >= 24 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {record.vitals?.bmi || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">血压</span>
                    <span className={`font-medium ${
                      (record.vitals?.systolicBp || 0) >= 140 || (record.vitals?.diastolicBp || 0) >= 90
                        ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {record.vitals?.systolicBp || '-'}/{record.vitals?.diastolicBp || '-'} mmHg
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">颈围</span>
                    <span className="font-medium text-gray-900">{record.vitals?.neckCircumference || '-'} cm</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">腰围</span>
                    <span className="font-medium text-gray-900">{record.vitals?.waistCircumference || '-'} cm</span>
                  </div>
                </div>
              </Card>

              {assessment?.riskLevel === 'high' && !record.referral && (
                <Card className="border-amber-300 bg-amber-50/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-900">建议转诊</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        该人员属于高风险人群，建议转诊至上级医院进行进一步检查和确诊。
                      </p>
                      
                      {!showReferralForm ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 border-amber-400 text-amber-700 hover:bg-amber-100"
                          onClick={() => setShowReferralForm(true)}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          加入转诊清单
                        </Button>
                      ) : (
                        <div className="mt-3 space-y-3">
                          <input
                            type="text"
                            placeholder="请输入转诊医院"
                            className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                            value={referralHospital}
                            onChange={(e) => setReferralHospital(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleAddReferral}>确认转诊</Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setShowReferralForm(false)}
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {record.referral && (
                <Card className="border-blue-300 bg-blue-50/30">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-blue-900">已纳入转诊清单</h4>
                      <p className="text-sm text-blue-700 mt-0.5">
                        转诊医院：{record.referral.hospital || '未指定'}
                      </p>
                      <p className="text-sm text-blue-600">
                        转诊日期：{record.referral.referralDate || '-'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            返回修改
          </Button>
          {!hasMissing && (
            <>
              {record.person.status === 'completed' && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReAssess}
                  className="flex-1"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  重新评估
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrint}
                className="flex-1"
              >
                <Printer className="w-5 h-5 mr-2" />
                打印结果
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <Download className="w-5 h-5 mr-2" />
                完成筛查
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
