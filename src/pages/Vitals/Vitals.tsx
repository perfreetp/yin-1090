import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Ruler, Scale, Activity, RefreshCw } from 'lucide-react'
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
  const { getPersonById, saveVitals, currentPersonId, setCurrentPerson } = useAppStore()
  
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

  useEffect(() => {
    if (personId) {
      const record = getPersonById(personId)
      if (record?.vitals) {
        const v = record.vitals
        setFormData({
          height: v.height?.toString() || '',
          weight: v.weight?.toString() || '',
          systolicBp: v.systolicBp?.toString() || '',
          diastolicBp: v.diastolicBp?.toString() || '',
          neckCircumference: v.neckCircumference?.toString() || '',
          waistCircumference: v.waistCircumference?.toString() || ''
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
  }

  const getBmiStatus = () => {
    if (bmi === 0) return { text: '待计算', color: 'text-gray-400', bg: 'bg-gray-100' }
    if (bmi < 18.5) return { text: '偏瘦', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (bmi < 24) return { text: '正常', color: 'text-green-600', bg: 'bg-green-100' }
    if (bmi < 28) return { text: '超重', color: 'text-amber-600', bg: 'bg-amber-100' }
    return { text: '肥胖', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const bmiStatus = getBmiStatus()

  const handleSubmit = () => {
    if (!personId) {
      navigate('/registration')
      return
    }

    if (!formData.height || !formData.weight) {
      alert('请填写身高和体重')
      return
    }

    saveVitals(personId, {
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      systolicBp: formData.systolicBp ? parseInt(formData.systolicBp) : undefined,
      diastolicBp: formData.diastolicBp ? parseInt(formData.diastolicBp) : undefined,
      neckCircumference: formData.neckCircumference ? parseFloat(formData.neckCircumference) : undefined,
      waistCircumference: formData.waistCircumference ? parseFloat(formData.waistCircumference) : undefined
    })

    navigate('/assessment' + (personId ? `/${personId}` : ''))
  }

  const record = personId ? getPersonById(personId) : undefined

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

          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <Scale className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">身体测量</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="身高"
                type="number"
                placeholder="请输入身高"
                suffix="cm"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
              <Input
                label="体重"
                type="number"
                placeholder="请输入体重"
                suffix="kg"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-100 rounded-lg">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">血压</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="收缩压（高压）"
                type="number"
                placeholder="请输入收缩压"
                suffix="mmHg"
                value={formData.systolicBp}
                onChange={(e) => handleInputChange('systolicBp', e.target.value)}
              />
              <Input
                label="舒张压（低压）"
                type="number"
                placeholder="请输入舒张压"
                suffix="mmHg"
                value={formData.diastolicBp}
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
              <h3 className="text-lg font-bold text-gray-900">围度测量</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="颈围"
                type="number"
                placeholder="请输入颈围"
                suffix="cm"
                value={formData.neckCircumference}
                onChange={(e) => handleInputChange('neckCircumference', e.target.value)}
              />
              <Input
                label="腰围"
                type="number"
                placeholder="请输入腰围"
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
    </div>
  )
}
