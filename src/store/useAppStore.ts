import { create } from 'zustand'
import type { 
  ScreeningSession, ScreeningRecord, Person, Questionnaire, Vitals, 
  Assessment, Referral, EducationTemplate, ReviewRecord, 
  FollowUpRecord, FollowUpStatus, ReviewStatus, ModificationRecord, 
  ArchiveSummary 
} from '@/types'
import { getStorageItem, setStorageItem, generateId } from '@/utils/storage'
import { calculateAssessment, calculateBMI } from '@/utils/assessment'
import { mockSessions, generateMockData, mockEducationTemplates } from '@/mock/data'

interface ReviewerStat {
  name: string
  total: number
  reviewed: number
  pending: number
}

interface FollowUpAlert {
  personId: string
  personName: string
  phone: string
  alertType: 'upcoming' | 'overdue' | 'no_show'
  daysUntilAppointment?: number
  daysSinceLastContact?: number
  noShowReason?: string
  scheduledDate?: string
  referral: Referral
}

interface AppState {
  currentSessionId: string
  sessions: ScreeningSession[]
  records: ScreeningRecord[]
  currentPersonId: string | null
  educationTemplates: EducationTemplate[]
  initialized: boolean
  
  initApp: () => void
  setCurrentSession: (sessionId: string) => void
  setCurrentPerson: (personId: string | null) => void
  
  addPerson: (data: Omit<Person, 'id' | 'sessionId' | 'createdAt' | 'status'>) => Person
  updatePerson: (id: string, data: Partial<Person>) => void
  getPersonById: (id: string) => ScreeningRecord | undefined
  
  isSessionArchived: () => boolean
  archiveSession: () => ArchiveSummary
  saveQuestionnaire: (personId: string, data: Partial<Questionnaire>, modificationReason?: string) => void
  saveVitals: (personId: string, data: Partial<Vitals>, modificationReason?: string) => void
  performAssessment: (personId: string) => Assessment | null
  rePerformAssessment: (personId: string) => Assessment | null
  saveDeepInterview: (personId: string, data: { familyFeedback: string; notes: string }) => void
  recordModification: (personId: string, field: string, oldValue: string, newValue: string, reason: string, modifiedBy: string) => void
  
  addReferral: (personId: string, hospital: string) => void
  updateReferralStatus: (personId: string, status: Referral['status'], note?: string) => void
  updateReferralFollowUp: (personId: string, progress: FollowUpStatus, data?: {
    scheduledDate?: string
    noShowReason?: string
  }) => void
  addFollowUpRecord: (personId: string, data: {
    status: FollowUpStatus
    contactPerson: string
    note: string
  }) => void
  getFollowUpAlerts: (daysThreshold?: number) => FollowUpAlert[]
  
  markAsReviewed: (personId: string, data: { reviewedBy: string; notes?: string }) => void
  markAsNeedsReview: (personId: string, notes?: string) => void
  batchAssignReviewer: (personIds: string[], reviewer: string) => void
  batchMarkReviewed: (personIds: string[], data: { reviewedBy: string; notes?: string }) => void
  getReviewerStats: () => ReviewerStat[]
  getRecordsForReview: (filters?: {
    riskLevel?: 'high' | 'medium' | 'low'
    hasMissingData?: boolean
    isReferred?: boolean
    reviewStatus?: ReviewStatus
    assignedReviewer?: string
  }) => ScreeningRecord[]
  
  getCompletedRecords: () => ScreeningRecord[]
  getPendingRecords: () => ScreeningRecord[]
  getHighRiskRecords: () => ScreeningRecord[]
  getReferralRecords: () => ScreeningRecord[]
  getCurrentSessionRecords: () => ScreeningRecord[]
  
  addEducationTemplate: (data: Omit<EducationTemplate, 'id'>) => void
  updateEducationTemplate: (id: string, data: Partial<Omit<EducationTemplate, 'id'>>) => void
  
  getStatistics: () => {
    total: number
    completed: number
    pending: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
    referralPending: number
    referralCompleted: number
    reviewed: number
    pendingReview: number
    followUpPending: number
    followUpContacted: number
    followUpScheduled: number
    followUpArrived: number
    followUpNoShow: number
    followUpCompleted: number
    reassessed: number
  }
}

const STORAGE_KEYS = {
  sessions: 'sessions',
  records: 'records',
  currentSessionId: 'currentSessionId',
  educationTemplates: 'educationTemplates'
}

export const useAppStore = create<AppState>((set, get) => ({
  currentSessionId: '',
  sessions: [],
  records: [],
  currentPersonId: null,
  educationTemplates: [],
  initialized: false,

  initApp: () => {
    if (get().initialized) return

    let sessions = getStorageItem<ScreeningSession[]>(STORAGE_KEYS.sessions, [])
    let records = getStorageItem<ScreeningRecord[]>(STORAGE_KEYS.records, [])
    let currentSessionId = getStorageItem<string>(STORAGE_KEYS.currentSessionId, '')
    let educationTemplates = getStorageItem<EducationTemplate[]>(STORAGE_KEYS.educationTemplates, [])

    if (sessions.length === 0) {
      sessions = mockSessions
      records = generateMockData(sessions[0].id, 20)
      currentSessionId = sessions[0].id
      educationTemplates = mockEducationTemplates

      setStorageItem(STORAGE_KEYS.sessions, sessions)
      setStorageItem(STORAGE_KEYS.records, records)
      setStorageItem(STORAGE_KEYS.currentSessionId, currentSessionId)
      setStorageItem(STORAGE_KEYS.educationTemplates, educationTemplates)
    }

    set({
      sessions,
      records,
      currentSessionId,
      educationTemplates,
      initialized: true
    })
  },

  setCurrentSession: (sessionId: string) => {
    set({ currentSessionId: sessionId })
    setStorageItem(STORAGE_KEYS.currentSessionId, sessionId)
  },

  setCurrentPerson: (personId: string | null) => {
    set({ currentPersonId: personId })
  },

  isSessionArchived: () => {
    const { currentSessionId, sessions } = get()
    const session = sessions.find(s => s.id === currentSessionId)
    return session?.isArchived || false
  },

  archiveSession: () => {
    const { currentSessionId, sessions, records } = get()
    const sessionRecords = records.filter(r => r.person.sessionId === currentSessionId)
    
    const completedPeople = sessionRecords.filter(r => r.person.status === 'completed')
    const incompletePeople = sessionRecords.filter(r => r.person.status !== 'completed')
    const pendingReview = completedPeople.filter(r => !r.review || r.review.status !== 'reviewed')
    const pendingFollowUp = sessionRecords.filter(r => r.referral && r.referral.followUpProgress !== 'arrived' && r.referral.followUpProgress !== 'completed')
    const highRiskPeople = completedPeople.filter(r => r.assessment?.riskLevel === 'high')

    const summary: ArchiveSummary = {
      totalPeople: sessionRecords.length,
      completedPeople: completedPeople.length,
      incompletePeople: incompletePeople.length,
      pendingReview: pendingReview.length,
      pendingFollowUp: pendingFollowUp.length,
      highRiskList: highRiskPeople.map(r => ({
        name: r.person.name,
        age: r.person.age,
        gender: r.person.gender,
        phone: r.person.phone,
        riskLevel: r.assessment!.riskLevel,
        referralStatus: r.referral?.status
      })),
      incompleteList: incompletePeople.map(r => ({
        name: r.person.name,
        age: r.person.age,
        gender: r.person.gender,
        status: r.person.status
      }))
    }

    const newSessions = sessions.map(s => 
      s.id === currentSessionId 
        ? { ...s, isArchived: true, archivedAt: new Date().toISOString(), archiveSummary: summary }
        : s
    )

    set({ sessions: newSessions })
    setStorageItem(STORAGE_KEYS.sessions, newSessions)

    return summary
  },

  addPerson: (data) => {
    const { currentSessionId, records } = get()
    const newPerson: Person = {
      id: generateId('person'),
      sessionId: currentSessionId,
      ...data,
      createdAt: new Date().toISOString(),
      status: 'registered'
    }
    
    const newRecord: ScreeningRecord = { 
      person: newPerson, 
      assessmentHistory: [],
      modificationRecords: []
    }
    const newRecords = [...records, newRecord]
    
    set({ records: newRecords, currentPersonId: newPerson.id })
    setStorageItem(STORAGE_KEYS.records, newRecords)
    
    return newPerson
  },

  updatePerson: (id, data) => {
    const { records } = get()
    const newRecords = records.map(r => 
      r.person.id === id ? { ...r, person: { ...r.person, ...data } } : r
    )
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  getPersonById: (id) => {
    return get().records.find(r => r.person.id === id)
  },

  recordModification: (personId, field, oldValue, newValue, reason, modifiedBy) => {
    const { records } = get()
    const mod: ModificationRecord = {
      id: generateId('mod'),
      personId,
      field,
      oldValue,
      newValue,
      reason,
      modifiedBy,
      modifiedAt: new Date().toISOString()
    }
    const newRecords = records.map(r => 
      r.person.id === personId 
        ? { ...r, modificationRecords: [...r.modificationRecords, mod] }
        : r
    )
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  saveQuestionnaire: (personId, data, modificationReason) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (r.person.id !== personId) return r
      
      const existingQ = r.questionnaire || { 
        id: generateId('q'), 
        personId,
        snoreFrequency: 0,
        nightAwakening: 0,
        daytimeSleepiness: 0,
        hasHypertension: false,
        medicalHistory: '',
        familyFeedback: '',
        notes: ''
      }
      
      return {
        ...r,
        questionnaire: { ...existingQ, ...data },
        person: { ...r.person, status: 'questionnaire_done' as const }
      }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  saveVitals: (personId, data, modificationReason) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (r.person.id !== personId) return r
      
      const existingV = r.vitals || {
        id: generateId('v'),
        personId,
        height: 0,
        weight: 0,
        bmi: 0,
        systolicBp: 0,
        diastolicBp: 0,
        neckCircumference: 0,
        waistCircumference: 0
      }
      
      const newVitals = { ...existingV, ...data }
      if (newVitals.height && newVitals.weight) {
        newVitals.bmi = calculateBMI(newVitals.height, newVitals.weight)
      }
      
      return {
        ...r,
        vitals: newVitals,
        person: { ...r.person, status: 'vitals_done' as const }
      }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  performAssessment: (personId) => {
    const { records } = get()
    const record = records.find(r => r.person.id === personId)
    
    if (!record || !record.questionnaire || !record.vitals) {
      return null
    }

    const v = record.vitals
    if (!v.height || !v.weight || !v.systolicBp || !v.diastolicBp || !v.neckCircumference) {
      return null
    }

    const baseAssessment = calculateAssessment(record.person, record.questionnaire, record.vitals)
    const assessment: Assessment = {
      ...baseAssessment,
      isReassessment: false,
      reassessmentCount: 0
    }
    
    const newRecords = records.map(r => {
      if (r.person.id !== personId) return r
      return {
        ...r,
        assessment,
        assessmentHistory: [...r.assessmentHistory, assessment],
        person: { ...r.person, status: 'completed' as const }
      }
    })
    
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
    
    return assessment
  },

  rePerformAssessment: (personId) => {
    const { records } = get()
    const record = records.find(r => r.person.id === personId)
    
    if (!record || !record.questionnaire || !record.vitals || !record.assessment) {
      return null
    }

    const v = record.vitals
    if (!v.height || !v.weight || !v.systolicBp || !v.diastolicBp || !v.neckCircumference) {
      return null
    }

    const previousAssessment = record.assessment
    const newCount = previousAssessment.reassessmentCount + 1
    
    const baseAssessment = calculateAssessment(record.person, record.questionnaire, record.vitals)
    const newAssessment: Assessment = {
      ...baseAssessment,
      id: generateId('assessment'),
      isReassessment: true,
      reassessmentCount: newCount,
      previousAssessmentId: previousAssessment.id
    }
    
    const newRecords = records.map(r => {
      if (r.person.id !== personId) return r
      return {
        ...r,
        assessment: newAssessment,
        assessmentHistory: [...r.assessmentHistory, newAssessment],
        review: r.review ? { ...r.review, status: 'needs_review' as const } : undefined
      }
    })
    
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
    
    return newAssessment
  },

  saveDeepInterview: (personId, data) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (r.person.id !== personId) return r
      if (!r.questionnaire) return r
      if (!r.assessment) return r
      
      return {
        ...r,
        questionnaire: {
          ...r.questionnaire,
          familyFeedback: data.familyFeedback,
          notes: data.notes
        },
        assessment: {
          ...r.assessment,
          deepInterviewDone: true
        }
      }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  addReferral: (personId, hospital) => {
    const { records } = get()
    const referral: Referral = {
      id: generateId('ref'),
      personId,
      status: 'referred',
      hospital,
      referralDate: new Date().toISOString().split('T')[0],
      followUpNote: '',
      followUpProgress: 'pending_contact',
      followUpRecords: []
    }
    
    const newRecords = records.map(r => 
      r.person.id === personId ? { ...r, referral } : r
    )
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  updateReferralStatus: (personId, status, note) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (r.person.id !== personId || !r.referral) return r
      return {
        ...r,
        referral: {
          ...r.referral,
          status,
          followUpNote: note || r.referral.followUpNote,
          completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined
        }
      }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  updateReferralFollowUp: (personId, progress, data) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (r.person.id !== personId || !r.referral) return r
      return {
        ...r,
        referral: {
          ...r.referral,
          followUpProgress: progress,
          ...(data?.scheduledDate && { scheduledDate: data.scheduledDate }),
          ...(data?.noShowReason && { noShowReason: data.noShowReason })
        }
      }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  addFollowUpRecord: (personId, data) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (r.person.id !== personId || !r.referral) return r
      
      const followUpRecord: FollowUpRecord = {
        id: generateId('fu'),
        referralId: r.referral.id,
        status: data.status,
        contactDate: new Date().toISOString().split('T')[0],
        contactPerson: data.contactPerson,
        note: data.note,
        createdAt: new Date().toISOString()
      }
      
      return {
        ...r,
        referral: {
          ...r.referral,
          followUpProgress: data.status,
          followUpRecords: [...r.referral.followUpRecords, followUpRecord]
        }
      }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  getFollowUpAlerts: (daysThreshold = 3) => {
    const { currentSessionId, records } = get()
    const now = new Date()
    const alerts: FollowUpAlert[] = []

    records.filter(r => r.person.sessionId === currentSessionId && r.referral).forEach(r => {
      const ref = r.referral!
      
      if (ref.followUpProgress === 'scheduled' && ref.scheduledDate) {
        const scheduledDate = new Date(ref.scheduledDate)
        const diffDays = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays <= daysThreshold) {
          alerts.push({
            personId: r.person.id,
            personName: r.person.name,
            phone: r.person.phone,
            alertType: 'upcoming',
            daysUntilAppointment: diffDays,
            scheduledDate: ref.scheduledDate,
            referral: ref
          })
        }
      }

      if (ref.followUpProgress === 'pending_contact' || ref.followUpProgress === 'contacted') {
        const lastRecord = ref.followUpRecords.length > 0 
          ? ref.followUpRecords[ref.followUpRecords.length - 1]
          : null
        const lastDate = lastRecord ? new Date(lastRecord.createdAt) : new Date(ref.referralDate)
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays >= daysThreshold) {
          alerts.push({
            personId: r.person.id,
            personName: r.person.name,
            phone: r.person.phone,
            alertType: 'overdue',
            daysSinceLastContact: diffDays,
            referral: ref
          })
        }
      }

      if (ref.followUpProgress === 'no_show') {
        alerts.push({
          personId: r.person.id,
          personName: r.person.name,
          phone: r.person.phone,
          alertType: 'no_show',
          noShowReason: ref.noShowReason,
          referral: ref
        })
      }
    })

    return alerts.sort((a, b) => {
      const priority = { overdue: 0, no_show: 1, upcoming: 2 }
      return priority[a.alertType] - priority[b.alertType]
    })
  },

  markAsReviewed: (personId, data) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (r.person.id !== personId) return r
      
      const review: ReviewRecord = {
        id: generateId('review'),
        personId,
        status: 'reviewed',
        reviewedAt: new Date().toISOString(),
        reviewedBy: data.reviewedBy,
        notes: data.notes || '',
        assignedReviewer: r.review?.assignedReviewer
      }
      
      return { ...r, review }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  markAsNeedsReview: (personId, notes) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (r.person.id !== personId) return r
      
      const review: ReviewRecord = {
        id: generateId('review'),
        personId,
        status: 'needs_review',
        reviewedAt: new Date().toISOString(),
        reviewedBy: '',
        notes: notes || '',
        assignedReviewer: r.review?.assignedReviewer
      }
      
      return { ...r, review }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  batchAssignReviewer: (personIds, reviewer) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (!personIds.includes(r.person.id)) return r
      
      const review: ReviewRecord = r.review || {
        id: generateId('review'),
        personId: r.person.id,
        status: 'pending',
        reviewedAt: '',
        reviewedBy: '',
        notes: ''
      }
      
      return { ...r, review: { ...review, assignedReviewer: reviewer } }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  batchMarkReviewed: (personIds, data) => {
    const { records } = get()
    const newRecords = records.map(r => {
      if (!personIds.includes(r.person.id)) return r
      
      const review: ReviewRecord = {
        id: generateId('review'),
        personId: r.person.id,
        status: 'reviewed',
        reviewedAt: new Date().toISOString(),
        reviewedBy: data.reviewedBy,
        notes: data.notes || '',
        assignedReviewer: r.review?.assignedReviewer
      }
      
      return { ...r, review }
    })
    set({ records: newRecords })
    setStorageItem(STORAGE_KEYS.records, newRecords)
  },

  getReviewerStats: () => {
    const { currentSessionId, records } = get()
    const sessionRecords = records.filter(r => 
      r.person.sessionId === currentSessionId && r.person.status === 'completed'
    )
    
    const reviewerMap = new Map<string, { total: number; reviewed: number; pending: number }>()
    
    sessionRecords.forEach(r => {
      const reviewer = r.review?.assignedReviewer
      if (!reviewer) return
      
      if (!reviewerMap.has(reviewer)) {
        reviewerMap.set(reviewer, { total: 0, reviewed: 0, pending: 0 })
      }
      const stat = reviewerMap.get(reviewer)!
      stat.total++
      if (r.review?.status === 'reviewed') {
        stat.reviewed++
      } else {
        stat.pending++
      }
    })

    return Array.from(reviewerMap.entries()).map(([name, stat]) => ({
      name,
      ...stat
    }))
  },

  getRecordsForReview: (filters) => {
    const { currentSessionId, records } = get()
    let result = records.filter(r => r.person.sessionId === currentSessionId && r.person.status === 'completed')
    
    if (filters) {
      if (filters.riskLevel) {
        result = result.filter(r => r.assessment?.riskLevel === filters.riskLevel)
      }
      if (filters.hasMissingData) {
        result = result.filter(r => {
          if (!r.questionnaire || !r.vitals) return true
          const q = r.questionnaire
          const v = r.vitals
          return !q.medicalHistory || !v.waistCircumference
        })
      }
      if (filters.isReferred) {
        result = result.filter(r => !!r.referral)
      }
      if (filters.reviewStatus) {
        result = result.filter(r => r.review?.status === filters.reviewStatus || 
          (filters.reviewStatus === 'pending' && !r.review))
      }
      if (filters.assignedReviewer) {
        result = result.filter(r => r.review?.assignedReviewer === filters.assignedReviewer)
      }
    }
    
    return result
  },

  getCompletedRecords: () => {
    const { currentSessionId, records } = get()
    return records.filter(r => r.person.sessionId === currentSessionId && r.person.status === 'completed')
  },

  getPendingRecords: () => {
    const { currentSessionId, records } = get()
    return records.filter(r => r.person.sessionId === currentSessionId && r.person.status !== 'completed')
  },

  getHighRiskRecords: () => {
    const { currentSessionId, records } = get()
    return records.filter(r => 
      r.person.sessionId === currentSessionId && 
      r.assessment?.riskLevel === 'high'
    )
  },

  getReferralRecords: () => {
    const { currentSessionId, records } = get()
    return records.filter(r => 
      r.person.sessionId === currentSessionId && 
      r.referral
    )
  },

  getCurrentSessionRecords: () => {
    const { currentSessionId, records } = get()
    return records.filter(r => r.person.sessionId === currentSessionId)
  },

  addEducationTemplate: (data) => {
    const { educationTemplates } = get()
    const newTemplate: EducationTemplate = {
      id: generateId('edu'),
      ...data
    }
    const newTemplates = [...educationTemplates, newTemplate]
    set({ educationTemplates: newTemplates })
    setStorageItem(STORAGE_KEYS.educationTemplates, newTemplates)
  },

  updateEducationTemplate: (id, data) => {
    const { educationTemplates } = get()
    const newTemplates = educationTemplates.map(t => 
      t.id === id ? { ...t, ...data } : t
    )
    set({ educationTemplates: newTemplates })
    setStorageItem(STORAGE_KEYS.educationTemplates, newTemplates)
  },

  getStatistics: () => {
    const { currentSessionId, records } = get()
    const sessionRecords = records.filter(r => r.person.sessionId === currentSessionId)
    
    const completed = sessionRecords.filter(r => r.person.status === 'completed').length
    const pending = sessionRecords.length - completed
    
    let highRisk = 0
    let mediumRisk = 0
    let lowRisk = 0
    let reviewed = 0
    let pendingReview = 0
    let reassessed = 0
    
    sessionRecords.forEach(r => {
      if (r.assessment) {
        if (r.assessment.riskLevel === 'high') highRisk++
        else if (r.assessment.riskLevel === 'medium') mediumRisk++
        else lowRisk++
        if (r.assessment.isReassessment) reassessed++
      }
      if (r.review) {
        if (r.review.status === 'reviewed') reviewed++
        else if (r.review.status === 'needs_review' || r.review.status === 'pending') pendingReview++
      } else if (r.person.status === 'completed') {
        pendingReview++
      }
    })
    
    const referralPending = sessionRecords.filter(r => 
      r.referral && (r.referral.status === 'pending' || r.referral.status === 'referred')
    ).length
    
    const referralCompleted = sessionRecords.filter(r => 
      r.referral && r.referral.status === 'completed'
    ).length
    
    const followUpPending = sessionRecords.filter(r => 
      r.referral && r.referral.followUpProgress === 'pending_contact'
    ).length
    
    const followUpContacted = sessionRecords.filter(r => 
      r.referral && r.referral.followUpProgress === 'contacted'
    ).length
    
    const followUpScheduled = sessionRecords.filter(r => 
      r.referral && r.referral.followUpProgress === 'scheduled'
    ).length
    
    const followUpArrived = sessionRecords.filter(r => 
      r.referral && r.referral.followUpProgress === 'arrived'
    ).length
    
    const followUpNoShow = sessionRecords.filter(r => 
      r.referral && r.referral.followUpProgress === 'no_show'
    ).length

    const followUpCompleted = sessionRecords.filter(r => 
      r.referral && r.referral.followUpProgress === 'completed'
    ).length
    
    return {
      total: sessionRecords.length,
      completed,
      pending,
      highRisk,
      mediumRisk,
      lowRisk,
      referralPending,
      referralCompleted,
      reviewed,
      pendingReview,
      followUpPending,
      followUpContacted,
      followUpScheduled,
      followUpArrived,
      followUpNoShow,
      followUpCompleted,
      reassessed
    }
  }
}))
