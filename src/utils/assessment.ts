import type { Person, Questionnaire, Vitals, Assessment, ScoreDetail, RiskLevel } from '@/types'

export function calculateBMI(height: number, weight: number): number {
  if (height <= 0 || weight <= 0) return 0
  const heightInMeters = height / 100
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

export function calculateAssessment(
  person: Person,
  questionnaire: Questionnaire,
  vitals: Vitals
): Assessment {
  const scoreDetails: ScoreDetail[] = []
  let totalScore = 0
  const maxScore = 11

  const ageScore = person.age >= 50 ? 1 : 0
  scoreDetails.push({
    name: '年龄',
    score: ageScore,
    maxScore: 1,
    description: person.age >= 50 ? '≥50岁' : '<50岁'
  })
  totalScore += ageScore

  const genderScore = person.gender === 'male' ? 1 : 0
  scoreDetails.push({
    name: '性别',
    score: genderScore,
    maxScore: 1,
    description: person.gender === 'male' ? '男性' : '女性'
  })
  totalScore += genderScore

  const bmiScore = vitals.bmi >= 28 ? 1 : 0
  scoreDetails.push({
    name: 'BMI',
    score: bmiScore,
    maxScore: 1,
    description: vitals.bmi >= 28 ? `BMI ${vitals.bmi} ≥ 28` : `BMI ${vitals.bmi} < 28`
  })
  totalScore += bmiScore

  const neckThreshold = person.gender === 'male' ? 40 : 36
  const neckScore = vitals.neckCircumference >= neckThreshold ? 1 : 0
  scoreDetails.push({
    name: '颈围',
    score: neckScore,
    maxScore: 1,
    description: vitals.neckCircumference >= neckThreshold
      ? `颈围 ${vitals.neckCircumference}cm ≥ ${neckThreshold}cm`
      : `颈围 ${vitals.neckCircumference}cm < ${neckThreshold}cm`
  })
  totalScore += neckScore

  const snoreScore = questionnaire.snoreFrequency >= 3 ? 1 : 0
  const snoreDescriptions = ['从不', '偶尔', '有时', '经常', '总是']
  scoreDetails.push({
    name: '打鼾',
    score: snoreScore,
    maxScore: 1,
    description: snoreDescriptions[questionnaire.snoreFrequency] || '未知'
  })
  totalScore += snoreScore

  const awakeningScore = questionnaire.nightAwakening >= 3 ? 1 : 0
  const awakeningDescriptions = ['从不', '偶尔', '每周1-2次', '每周3-4次', '几乎每晚']
  scoreDetails.push({
    name: '夜间憋醒',
    score: awakeningScore,
    maxScore: 1,
    description: awakeningDescriptions[questionnaire.nightAwakening] || '未知'
  })
  totalScore += awakeningScore

  const sleepinessScore = questionnaire.daytimeSleepiness >= 3 ? 1 : 0
  const sleepinessDescriptions = ['从不', '偶尔', '有时', '经常', '总是']
  scoreDetails.push({
    name: '白天嗜睡',
    score: sleepinessScore,
    maxScore: 1,
    description: sleepinessDescriptions[questionnaire.daytimeSleepiness] || '未知'
  })
  totalScore += sleepinessScore

  const hypertensionHistoryScore = questionnaire.hasHypertension ? 1 : 0
  scoreDetails.push({
    name: '高血压病史',
    score: hypertensionHistoryScore,
    maxScore: 1,
    description: questionnaire.hasHypertension ? '有高血压病史' : '无高血压病史'
  })
  totalScore += hypertensionHistoryScore

  const hasHighBp = vitals.systolicBp >= 140 || vitals.diastolicBp >= 90
  const bpScore = hasHighBp ? 1 : 0
  scoreDetails.push({
    name: '现场血压',
    score: bpScore,
    maxScore: 1,
    description: hasHighBp
      ? `血压 ${vitals.systolicBp}/${vitals.diastolicBp}mmHg 偏高`
      : `血压 ${vitals.systolicBp}/${vitals.diastolicBp}mmHg 正常`
  })
  totalScore += bpScore

  const hasDiabetes = questionnaire.medicalHistory.includes('糖尿病')
  const diabetesScore = hasDiabetes ? 1 : 0
  scoreDetails.push({
    name: '糖尿病',
    score: diabetesScore,
    maxScore: 1,
    description: hasDiabetes ? '有糖尿病病史' : '无糖尿病病史'
  })
  totalScore += diabetesScore

  const hasHeartDisease = questionnaire.medicalHistory.includes('冠心病') || 
                         questionnaire.medicalHistory.includes('脑血管疾病')
  const heartScore = hasHeartDisease ? 1 : 0
  scoreDetails.push({
    name: '心脑血管病史',
    score: heartScore,
    maxScore: 1,
    description: hasHeartDisease ? '有冠心病/脑血管病史' : '无相关病史'
  })
  totalScore += heartScore

  let riskLevel: RiskLevel
  if (totalScore <= 3) {
    riskLevel = 'low'
  } else if (totalScore <= 6) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'high'
  }

  const needDeepInterview = riskLevel === 'high'

  return {
    id: `assessment_${person.id}`,
    personId: person.id,
    totalScore,
    maxScore,
    riskLevel,
    scoreDetails,
    needDeepInterview,
    deepInterviewDone: false,
    assessedAt: new Date().toISOString()
  }
}

export function getRiskLevelText(level: RiskLevel): string {
  const map = { low: '低风险', medium: '中风险', high: '高风险' }
  return map[level]
}

export function getRiskLevelColor(level: RiskLevel): string {
  const map = { low: 'text-green-600', medium: 'text-amber-600', high: 'text-red-600' }
  return map[level]
}

export function getRiskLevelBgColor(level: RiskLevel): string {
  const map = { low: 'bg-green-100', medium: 'bg-amber-100', high: 'bg-red-100' }
  return map[level]
}

export function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待筛查',
    registered: '已建档',
    questionnaire_done: '已问诊',
    vitals_done: '已体测',
    completed: '已完成'
  }
  return map[status] || status
}

export function getReferralStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待转诊',
    referred: '已转诊',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || '-'
}
