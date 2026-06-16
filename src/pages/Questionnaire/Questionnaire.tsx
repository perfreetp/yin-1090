import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Mic } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import ProgressBar from '@/components/Progress/ProgressBar'
import StepIndicator from '@/components/Progress/StepIndicator'

const questions = [
  {
    key: 'snoreFrequency',
    title: '打鼾频率',
    description: '您平时睡觉打鼾的频率是？',
    options: ['从不', '偶尔', '有时', '经常', '总是'],
    scores: [0, 0, 0, 1, 1]
  },
  {
    key: 'nightAwakening',
    title: '夜间憋醒',
    description: '您是否有夜间因憋气或喘息而醒来的情况？',
    options: ['从不', '偶尔', '每周1-2次', '每周3-4次', '几乎每晚'],
    scores: [0, 0, 0, 1, 1]
  },
  {
    key: 'daytimeSleepiness',
    title: '白天嗜睡',
    description: '您白天是否经常感到困倦或想睡觉？',
    options: ['从不', '偶尔', '有时', '经常', '总是'],
    scores: [0, 0, 0, 1, 1]
  },
  {
    key: 'hasHypertension',
    title: '高血压病史',
    description: '您是否有高血压病史或正在服用降压药？',
    options: ['否', '是'],
    scores: [0, 1],
    isBoolean: true
  }
]

const medicalHistories = [
  '糖尿病',
  '冠心病',
  '脑血管疾病',
  '甲状腺疾病',
  '鼻部疾病（鼻炎/鼻息肉等）',
  '其他'
]

export default function Questionnaire() {
  const navigate = useNavigate()
  const params = useParams()
  const { getPersonById, saveQuestionnaire, currentPersonId, setCurrentPerson } = useAppStore()
  
  const personId = params.id || currentPersonId
  
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | boolean>>({
    snoreFrequency: 0,
    nightAwakening: 0,
    daytimeSleepiness: 0,
    hasHypertension: false
  })
  const [medicalHistory, setMedicalHistory] = useState<string[]>([])
  const [showHistoryStep, setShowHistoryStep] = useState(false)

  useEffect(() => {
    if (personId) {
      const record = getPersonById(personId)
      if (record?.questionnaire) {
        const q = record.questionnaire
        setAnswers({
          snoreFrequency: q.snoreFrequency,
          nightAwakening: q.nightAwakening,
          daytimeSleepiness: q.daytimeSleepiness,
          hasHypertension: q.hasHypertension
        })
        if (q.medicalHistory) {
          setMedicalHistory(q.medicalHistory.split(',').filter(Boolean))
        }
      }
      setCurrentPerson(personId)
    }
  }, [personId, getPersonById, setCurrentPerson])

  const currentQuestion = questions[currentQIndex]
  const progress = ((currentQIndex + (showHistoryStep ? 1.5 : 0)) / questions.length) * 100

  const handleSelect = (optionIndex: number) => {
    if (currentQuestion.isBoolean) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.key]: optionIndex === 1
      }))
    } else {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.key]: optionIndex
      }))
    }
  }

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1)
    } else {
      setShowHistoryStep(true)
    }
  }

  const handlePrev = () => {
    if (showHistoryStep) {
      setShowHistoryStep(false)
    } else if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1)
    }
  }

  const toggleMedicalHistory = (item: string) => {
    setMedicalHistory(prev => 
      prev.includes(item) 
        ? prev.filter(h => h !== item)
        : [...prev, item]
    )
  }

  const handleSubmit = () => {
    if (!personId) {
      navigate('/registration')
      return
    }

    saveQuestionnaire(personId, {
      snoreFrequency: answers.snoreFrequency as number,
      nightAwakening: answers.nightAwakening as number,
      daytimeSleepiness: answers.daytimeSleepiness as number,
      hasHypertension: answers.hasHypertension as boolean,
      medicalHistory: medicalHistory.join(',')
    })

    navigate('/vitals' + (personId ? `/${personId}` : ''))
  }

  const currentAnswer = answers[currentQuestion.key]

  const steps = questions.map(q => q.title)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="快速问询"
        subtitle="请逐项询问并记录"
        showBack
        backTo={personId ? `/screening/${personId}` : '/'}
      />

      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <StepIndicator steps={steps} currentStep={currentQIndex} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {!showHistoryStep ? (
            <Card className="min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-500">
                  第 {currentQIndex + 1} / {questions.length} 题
                </span>
                <button className="flex items-center gap-2 text-blue-600 text-sm">
                  <Mic className="w-4 h-4" />
                  语音输入
                </button>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {currentQuestion.title}
              </h3>
              <p className="text-gray-500 mb-8">{currentQuestion.description}</p>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = currentQuestion.isBoolean
                    ? (currentAnswer as boolean) === (index === 1)
                    : (currentAnswer as number) === index

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelect(index)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-lg ${
                          isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'
                        }`}>
                          {option}
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          ) : (
            <Card className="min-h-[400px]">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">既往病史</h3>
              <p className="text-gray-500 mb-6">请勾选相关病史（可多选）</p>

              <div className="grid grid-cols-2 gap-3">
                {medicalHistories.map(item => {
                  const isSelected = medicalHistory.includes(item)
                  return (
                    <button
                      key={item}
                      onClick={() => toggleMedicalHistory(item)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                        {item}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={handlePrev}
            disabled={currentQIndex === 0 && !showHistoryStep}
            className="flex-1"
          >
            <ChevronLeft className="w-5 h-5" />
            上一步
          </Button>
          {!showHistoryStep ? (
            <Button size="lg" onClick={handleNext} className="flex-1">
              下一步
              <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button size="lg" onClick={handleSubmit} className="flex-1">
              完成问诊，下一步
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div className="max-w-2xl mx-auto mt-4">
          <ProgressBar value={progress} color="blue" />
        </div>
      </div>
    </div>
  )
}
