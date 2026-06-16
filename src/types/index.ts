export type RiskLevel = 'low' | 'medium' | 'high'

export type Gender = 'male' | 'female'

export type ScreeningStatus = 'pending' | 'registered' | 'questionnaire_done' | 'vitals_done' | 'completed'

export type ReferralStatus = 'pending' | 'referred' | 'completed' | 'cancelled'

export interface ScreeningSession {
  id: string
  name: string
  date: string
  location: string
  type: 'group' | 'home' | 'activity'
  totalCount: number
  completedCount: number
}

export interface Person {
  id: string
  sessionId: string
  name: string
  idCard: string
  gender: Gender
  age: number
  phone: string
  address: string
  createdAt: string
  status: ScreeningStatus
}

export interface Questionnaire {
  id: string
  personId: string
  snoreFrequency: number
  nightAwakening: number
  daytimeSleepiness: number
  hasHypertension: boolean
  medicalHistory: string
  familyFeedback: string
  notes: string
}

export interface Vitals {
  id: string
  personId: string
  height: number
  weight: number
  bmi: number
  systolicBp: number
  diastolicBp: number
  neckCircumference: number
  waistCircumference: number
}

export interface ScoreDetail {
  name: string
  score: number
  maxScore: number
  description: string
}

export interface Assessment {
  id: string
  personId: string
  totalScore: number
  maxScore: number
  riskLevel: RiskLevel
  scoreDetails: ScoreDetail[]
  needDeepInterview: boolean
  deepInterviewDone: boolean
  assessedAt: string
}

export interface Referral {
  id: string
  personId: string
  status: ReferralStatus
  hospital: string
  referralDate: string
  followUpNote: string
  completedDate?: string
}

export interface EducationTemplate {
  id: string
  category: string
  title: string
  content: string
}

export interface ScreeningRecord {
  person: Person
  questionnaire?: Questionnaire
  vitals?: Vitals
  assessment?: Assessment
  referral?: Referral
}
