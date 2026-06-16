export type RiskLevel = 'low' | 'medium' | 'high'

export type Gender = 'male' | 'female'

export type ScreeningStatus = 'pending' | 'registered' | 'questionnaire_done' | 'vitals_done' | 'completed'

export type ReferralStatus = 'pending' | 'referred' | 'completed' | 'cancelled'

export type FollowUpStatus = 'pending_contact' | 'contacted' | 'scheduled' | 'arrived' | 'no_show' | 'completed'

export type ReviewStatus = 'pending' | 'reviewed' | 'needs_review'

export interface ArchiveSummary {
  totalPeople: number
  completedPeople: number
  incompletePeople: number
  pendingReview: number
  pendingFollowUp: number
  highRiskList: { name: string; age: number; gender: Gender; phone: string; riskLevel: RiskLevel; referralStatus?: ReferralStatus }[]
  incompleteList: { name: string; age: number; gender: Gender; status: ScreeningStatus }[]
}

export interface ModificationRecord {
  id: string
  personId: string
  field: string
  oldValue: string
  newValue: string
  reason: string
  modifiedBy: string
  modifiedAt: string
}

export interface ScreeningSession {
  id: string
  name: string
  date: string
  location: string
  type: 'group' | 'home' | 'activity'
  totalCount: number
  completedCount: number
  isArchived: boolean
  archivedAt?: string
  archiveSummary?: ArchiveSummary
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
  isReassessment: boolean
  reassessmentCount: number
  previousAssessmentId?: string
}

export interface FollowUpRecord {
  id: string
  referralId: string
  status: FollowUpStatus
  contactDate: string
  contactPerson: string
  note: string
  createdAt: string
}

export interface Referral {
  id: string
  personId: string
  status: ReferralStatus
  hospital: string
  referralDate: string
  followUpNote: string
  completedDate?: string
  followUpProgress: FollowUpStatus
  scheduledDate?: string
  noShowReason?: string
  followUpRecords: FollowUpRecord[]
}

export interface ReviewRecord {
  id: string
  personId: string
  status: ReviewStatus
  reviewedAt: string
  reviewedBy: string
  notes: string
  assignedReviewer?: string
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
  review?: ReviewRecord
  assessmentHistory: Assessment[]
  modificationRecords: ModificationRecord[]
}
