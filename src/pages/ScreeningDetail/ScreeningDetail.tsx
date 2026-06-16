import { useParams, useNavigate } from 'react-router-dom'
import { User, ClipboardList, HeartPulse, Activity, FileText, CheckCircle2, Circle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import { StatusBadge, RiskBadge } from '@/components/Badge/Badge'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils/storage'

const steps = [
  { key: 'registration', label: '基本信息', icon: User, path: '' },
  { key: 'questionnaire', label: '快速问询', icon: ClipboardList, path: '/questionnaire' },
  { key: 'vitals', label: '体征录入', icon: HeartPulse, path: '/vitals' },
  { key: 'assessment', label: '风险判定', icon: Activity, path: '/assessment' },
]

export default function ScreeningDetail() {
  const navigate = useNavigate()
  const params = useParams()
  const { getPersonById, setCurrentPerson } = useAppStore()
  
  const personId = params.id || ''
  const record = getPersonById(personId)

  if (!record) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="筛查详情" showBack backTo="/" />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          未找到该人员信息
        </div>
      </div>
    )
  }

  const { person, questionnaire, vitals, assessment, referral } = record

  const getStepStatus = (stepKey: string) => {
    switch (stepKey) {
      case 'registration':
        return 'completed'
      case 'questionnaire':
        return questionnaire ? 'completed' : 'pending'
      case 'vitals':
        return vitals ? 'completed' : 'pending'
      case 'assessment':
        return assessment ? 'completed' : 'pending'
      default:
        return 'pending'
    }
  }

  const getNextStep = () => {
    if (!questionnaire) return '/questionnaire'
    if (!vitals) return '/vitals'
    if (!assessment) return '/assessment'
    return null
  }

  const nextStep = getNextStep()

  const goToStep = (stepKey: string) => {
    setCurrentPerson(personId)
    const step = steps.find(s => s.key === stepKey)
    if (step && step.path) {
      navigate(`${step.path}/${personId}`)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="筛查详情"
        subtitle="查看和编辑筛查信息"
        showBack
        backTo="/"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">{person.name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{person.name}</h2>
                  <p className="text-blue-100 mt-1">
                    {person.age}岁 · {person.gender === 'male' ? '男' : '女'} · {person.phone}
                  </p>
                  <p className="text-blue-200 text-sm mt-0.5">{person.address}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={person.status} size="sm" />
                {assessment && (
                  <div className="mt-2">
                    <RiskBadge level={assessment.riskLevel} size="sm" />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">筛查进度</h3>
            <div className="flex items-stretch">
              {steps.map((step, index) => {
                const Icon = step.icon
                const status = getStepStatus(step.key)
                const isActive = nextStep && steps.find(s => s.path === nextStep)?.key === step.key

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    <button
                      onClick={() => goToStep(step.key)}
                      className={cn(
                        'w-14 h-14 rounded-full flex items-center justify-center transition-all',
                        status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-gray-200 text-gray-400'
                      )}
                      disabled={step.key !== 'registration' && status === 'pending'}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </button>
                    <span className={cn(
                      'mt-2 text-sm font-medium',
                      status === 'completed' ? 'text-green-600' : 
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    )}>
                      {step.label}
                    </span>
                    
                    {index < steps.length - 1 && (
                      <div className={cn(
                        'absolute top-7 left-1/2 w-full h-0.5 -translate-y-1/2',
                        status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
                      )} style={{ marginLeft: '50%' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">基本信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">姓名</span>
                  <span className="font-medium text-gray-900">{person.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">性别</span>
                  <span className="font-medium text-gray-900">{person.gender === 'male' ? '男' : '女'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">年龄</span>
                  <span className="font-medium text-gray-900">{person.age}岁</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">身份证号</span>
                  <span className="font-medium text-gray-900">{person.idCard || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">联系电话</span>
                  <span className="font-medium text-gray-900">{person.phone || '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">住址</span>
                  <span className="font-medium text-gray-900 text-right">{person.address || '-'}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                编辑信息
              </Button>
            </Card>

            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">体格指标</h3>
              {vitals ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">身高</span>
                    <span className="font-medium text-gray-900">{vitals.height} cm</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">体重</span>
                    <span className="font-medium text-gray-900">{vitals.weight} kg</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">BMI</span>
                    <span className={`font-medium ${
                      vitals.bmi >= 28 ? 'text-red-600' :
                      vitals.bmi >= 24 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {vitals.bmi}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">血压</span>
                    <span className="font-medium text-gray-900">
                      {vitals.systolicBp}/{vitals.diastolicBp} mmHg
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">颈围</span>
                    <span className="font-medium text-gray-900">{vitals.neckCircumference} cm</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">腰围</span>
                    <span className="font-medium text-gray-900">{vitals.waistCircumference} cm</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Circle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>尚未录入体征信息</p>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => navigate(`/vitals/${personId}`)}
              >
                {vitals ? '修改体征' : '录入体征'}
              </Button>
            </Card>
          </div>

          {questionnaire && (
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">问诊记录</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">打鼾频率</p>
                  <p className="font-bold text-gray-900 mt-1">
                    {['从不', '偶尔', '有时', '经常', '总是'][questionnaire.snoreFrequency]}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">夜间憋醒</p>
                  <p className="font-bold text-gray-900 mt-1">
                    {['从不', '偶尔', '每周1-2次', '每周3-4次', '几乎每晚'][questionnaire.nightAwakening]}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">白天嗜睡</p>
                  <p className="font-bold text-gray-900 mt-1">
                    {['从不', '偶尔', '有时', '经常', '总是'][questionnaire.daytimeSleepiness]}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">高血压</p>
                  <p className={`font-bold mt-1 ${questionnaire.hasHypertension ? 'text-red-600' : 'text-green-600'}`}>
                    {questionnaire.hasHypertension ? '是' : '否'}
                  </p>
                </div>
              </div>
              {questionnaire.medicalHistory && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">既往病史</p>
                  <p className="text-gray-700 mt-1">{questionnaire.medicalHistory}</p>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => navigate(`/questionnaire/${personId}`)}
              >
                修改问诊
              </Button>
            </Card>
          )}

          {assessment && (
            <Card className={assessment.riskLevel === 'high' ? 'border-red-300' : ''}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">风险评估结果</h3>
                <RiskBadge level={assessment.riskLevel} />
              </div>
              
              <div className="flex items-center gap-6 mb-4">
                <div className="text-4xl font-bold" style={{
                  color: assessment.riskLevel === 'high' ? '#ef4444' :
                         assessment.riskLevel === 'medium' ? '#f59e0b' : '#22c55e'
                }}>
                  {assessment.totalScore} <span className="text-xl text-gray-400">/ {assessment.maxScore} 分</span>
                </div>
                <p className="text-gray-600 flex-1">
                  {assessment.riskLevel === 'low' && '睡眠呼吸暂停风险较低，建议保持健康生活方式。'}
                  {assessment.riskLevel === 'medium' && '存在一定睡眠呼吸暂停风险，建议进一步检查。'}
                  {assessment.riskLevel === 'high' && '睡眠呼吸暂停风险较高，建议尽快就医进行多导睡眠监测。'}
                </p>
              </div>

              {assessment.assessedAt && (
                <p className="text-sm text-gray-400">评估时间：{formatDateTime(assessment.assessedAt)}</p>
              )}

              <div className="mt-4 flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/assessment/${personId}`)}
                >
                  查看详情
                </Button>
                {assessment.riskLevel === 'high' && !referral && (
                  <Button 
                    size="sm"
                    variant="danger"
                    onClick={() => navigate(`/assessment/${personId}`)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    加入转诊
                  </Button>
                )}
              </div>
            </Card>
          )}

          {referral && (
            <Card className="border-blue-300 bg-blue-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-bold text-blue-900">转诊信息</h4>
                    <p className="text-sm text-blue-700">转诊医院：{referral.hospital || '未指定'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  referral.status === 'completed' ? 'bg-green-100 text-green-700' :
                  referral.status === 'referred' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {referral.status === 'pending' ? '待转诊' :
                   referral.status === 'referred' ? '已转诊' :
                   referral.status === 'completed' ? '已完成' : '已取消'}
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex gap-4">
          {nextStep ? (
            <Button 
              size="lg" 
              block
              onClick={() => navigate(`${nextStep}/${personId}`)}
            >
              继续筛查
            </Button>
          ) : (
            <Button 
              size="lg" 
              block
              variant="secondary"
              onClick={() => navigate('/')}
            >
              返回工作台
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
