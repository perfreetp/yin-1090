import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Ruler, Scale, Activity, RefreshCw, AlertCircle, Lock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { calculateBMI } from '@/utils/assessment'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import Input from '@/components/Form/Input'

interface VitalsForm {
  height: string
  weight: string
  systolicBp: string
  diastolicBp: string
  neckCircumference: string
  waistCircumference: string
}

export default function VitalsPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { getPersonById, saveVitals, currentPersonId, setCurrentPerson, isSessionArchived } = useAppStore()
  
  const personId = params.id || currentPersonId
  
  const [formData, setFormData] = useState<VitalsForm>({
    height: '',
    weight: '',
    systolicBp: '',
    diastolicBp: '',
    neckCircumference: '',
    waistCircumference: ''
  })

  const [bmi, setBmi] = useState<number>(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showModModal, setShowModModal] = useState(false)
  const [modReason, setModReason] = useState('')

  useEffect(() => {
    if (personId) {
      const record = getPersonById(personId)
      if (record?.vitals) {
        const v = record.vitals
        setFormData({
          height: v.height > 0 ? v.height.toString() : '',
          weight: v.weight > 0 ? v.weight.toString() : '',
          systolicBp: v.systolicBp > 0 ? v.systolicBp.toString() : '',
          diastolicBp: v.diastolicBp > 0 ? v.diastolicBp.toString() : '',
          neckCircumference: v.neckCircumference > 0 ? v.neckCircumference.toString() : '',
          waistCircumference: v.waistCircumference > 0 ? v.waistCircumference.toString() : ''
        })
        setBmi(v.bmi)
      }
      setCurrentPerson(personId)
    }
  }, [personId, getPersonById, setCurrentPerson])

  useEffect(() => {
    const h = parseFloat(formData.height)
    const w = parseFloat(formData.weight)
    if (h > 0 && w > 0) {
      setBmi(calculateBMI(h, w))
    } else {
      setBmi(0)
    }
  }, [formData.height, formData.weight])

  const handleInputChange = (field: keyof VitalsForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const getBmiStatus = () => {
    if (bmi === 0) return { text: '待计算', color: 'text-gray-400', bg: 'bg-gray-100' }
    if (bmi < 18.5) return { text: '偏瘦', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (bmi < 24) return { text: '正常', color: 'text-green-600', bg: 'bg-green-100' }
    if (bmi < 28) return { text: '超重', color: 'text-amber-600', bg: 'bg-amber-100' }
    return { text: '肥胖', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const bmiStatus = getBmiStatus()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.height || parseFloat(formData.height) <= 0) {
      newErrors.height = '请填写身高'
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = '请填写体重'
    }
    if (!formData.systolicBp || parseInt(formData.systolicBp) <= 0) {
      newErrors.systolicBp = '请填写收缩压'
    }
    if (!formData.diastolicBp || parseInt(formData.diastolicBp) <= 0) {
      newErrors.diastolicBp = '请填写舒张压'
    }
    if (!formData.neckCircumference || parseFloat(formData.neckCircumference) <= 0) {
      newErrors.neckCircumference = '请填写颈围'
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      const fieldLabels: Record<string, string> = {
        height: '身高',
        weight: '体重',
        systolicBp: '收缩压',
        diastolicBp: '舒张压',
        neckCircumference: '颈围'
      }
      const missingFields = Object.keys(newErrors).map(k => fieldLabels[k]).join('、')
      alert(`请补全必填项：${missingFields}`)
      return false
    }
    
    return true
  }

  const handleSubmit = () => {
    if (!personId) {
      navigate('/registration')
      return
    }

    if (!validateForm()) {
      return
    }

    const archived = isSessionArchived()
    if (archived) {
      setShowModModal(true)
      return
    }

    doSave()
  }

  const doSave = (reason?: string) => {
    if (!personId) return
    saveVitals(personId, {
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      systolicBp: parseInt(formData.systolicBp),
      diastolicBp: parseInt(formData.diastolicBp),
      neckCircumference: parseFloat(formData.neckCircumference),
      waistCircumference: formData.waistCircumference ? parseFloat(formData.waistCircumference) : undefined
    }, reason)

    navigate('/assessment' + (personId ? `/${personId}` : ''))
  }

  const record = personId ? getPersonById(personId) : undefined

  const requiredLabel = (label: string) => (
    <span>
      {label} <span className="text-red-500">*</span>
    </span>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="体征录入"
        subtitle="请测量并录入体格指标"
        showBack
        backTo={personId ? `/screening/${personId}` : '/'}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {record && (
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">当前筛查对象</p>
                  <p className="text-xl font-bold text-blue-900 mt-1">{record.person.name}</p>
                  <p className="text-sm text-blue-700 mt-0.5">
                    {record.person.age}岁 · {record.person.gender === 'male' ? '男' : '女'}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full ${bmiStatus.bg}`}>
                  <span className={`font-bold ${bmiStatus.color}`}>
                    BMI: {bmi > 0 ? bmi.toFixed(1) : '--'}
                  </span>
                  <span className={`text-sm ml-2 ${bmiStatus.color}`}>{bmiStatus.text}</span>
                </div>
              </div>
            </Card>
          )}

          <Card className="border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">重要提示</p>
                <p className="mt-1">身高、体重、血压、颈围为<span className="font-bold">必填项</span>，未填写完整将无法进行风险判定。</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <Scale className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">身体测量</h3>
                <p className="text-xs text-gray-400 mt-0.5">必填项</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input
                label={requiredLabel('身高')}
                type="number"
                placeholder="请输入身高"
                suffix="cm"
                value={formData.height}
                error={errors.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
              <Input
                label={requiredLabel('体重')}
                type="number"
                placeholder="请输入体重"
                suffix="kg"
                value={formData.weight}
                error={errors.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-100 rounded-lg">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">血压</h3>
                <p className="text-xs text-gray-400 mt-0.5">必填项</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input
                label={requiredLabel('收缩压（高压）')}
                type="number"
                placeholder="请输入收缩压"
                suffix="mmHg"
                value={formData.systolicBp}
                error={errors.systolicBp}
                onChange={(e) => handleInputChange('systolicBp', e.target.value)}
              />
              <Input
                label={requiredLabel('舒张压（低压）')}
                type="number"
                placeholder="请输入舒张压"
                suffix="mmHg"
                value={formData.diastolicBp}
                error={errors.diastolicBp}
                onChange={(e) => handleInputChange('diastolicBp', e.target.value)}
              />
            </div>
            
            {formData.systolicBp && formData.diastolicBp && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                parseInt(formData.systolicBp) >= 140 || parseInt(formData.diastolicBp) >= 90
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {parseInt(formData.systolicBp) >= 140 || parseInt(formData.diastolicBp) >= 90
                  ? '⚠️ 血压偏高，请留意'
                  : '✓ 血压正常范围'}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <Ruler className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">围度测量</h3>
                <p className="text-xs text-gray-400 mt-0.5">颈围必填，腰围选填</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input
                label={requiredLabel('颈围')}
                type="number"
                placeholder="请输入颈围"
                suffix="cm"
                value={formData.neckCircumference}
                error={errors.neckCircumference}
                onChange={(e) => handleInputChange('neckCircumference', e.target.value)}
              />
              <Input
                label="腰围"
                type="number"
                placeholder="请输入腰围（选填）"
                suffix="cm"
                value={formData.waistCircumference}
                onChange={(e) => handleInputChange('waistCircumference', e.target.value)}
              />
            </div>
            
            {formData.neckCircumference && record && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                (record.person.gender === 'male' && parseFloat(formData.neckCircumference) >= 40) ||
                (record.person.gender === 'female' && parseFloat(formData.neckCircumference) >= 36)
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {(record.person.gender === 'male' && parseFloat(formData.neckCircumference) >= 40) ||
                (record.person.gender === 'female' && parseFloat(formData.neckCircumference) >= 36)
                  ? '⚠️ 颈围偏大，可能增加OSA风险'
                  : '✓ 颈围在正常范围'}
              </div>
            )}
          </Card>
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
            上一步
          </Button>
          <Button size="lg" onClick={handleSubmit} className="flex-1">
            <RefreshCw className="w-5 h-5 mr-2" />
            计算风险
          </Button>
        </div>
      </div>

      {showModModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <Lock className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-gray-900">归档数据修改</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-amber-700 mb-4">
                当前场次已归档，修改数据需填写修改说明
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                修改说明 <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="请说明修改原因"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                value={modReason}
                onChange={(e) => setModReason(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <Button variant="ghost" onClick={() => { setShowModModal(false); setModReason('') }}>
                取消
              </Button>
              <Button
                onClick={() => {
                  if (!modReason.trim()) {
                    alert('请填写修改说明')
                    return
                  }
                  setShowModModal(false)
                  doSave(modReason.trim())
                  setModReason('')
                }}
              >
                确认修改
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
