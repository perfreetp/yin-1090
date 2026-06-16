import type { ScreeningSession, Person, Questionnaire, Vitals, Assessment, EducationTemplate, Referral, ScreeningRecord } from '@/types'
import { calculateAssessment, calculateBMI } from '@/utils/assessment'
import { generateId } from '@/utils/storage'

export const mockSessions: ScreeningSession[] = [
  {
    id: 'session_001',
    name: '2024年春季社区义诊',
    date: '2024-03-15',
    location: '阳光社区卫生服务中心',
    type: 'group',
    totalCount: 50,
    completedCount: 32
  },
  {
    id: 'session_002',
    name: '老年活动日睡眠筛查',
    date: '2024-03-20',
    location: '幸福里老年活动中心',
    type: 'activity',
    totalCount: 30,
    completedCount: 30
  }
]

const names = [
  '张建国', '李桂兰', '王德福', '赵秀珍', '刘长海',
  '陈美玲', '杨文华', '黄丽华', '周国强', '吴淑芬',
  '徐志明', '孙桂英', '马金宝', '朱凤珍', '胡永年'
]

function randomIdCard(): string {
  const prefix = '110101'
  const year = 1945 + Math.floor(Math.random() * 40)
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${prefix}${year}${month}${day}${suffix}`
}

function randomPhone(): string {
  return '1' + String(3 + Math.floor(Math.random() * 7)) + String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')
}

export function generateMockData(sessionId: string, count: number): ScreeningRecord[] {
  const records: ScreeningRecord[] = []

  for (let i = 0; i < count; i++) {
    const name = names[i % names.length]
    const gender = Math.random() > 0.5 ? 'male' : 'female'
    const age = 50 + Math.floor(Math.random() * 35)
    const height = gender === 'male' ? 165 + Math.floor(Math.random() * 20) : 155 + Math.floor(Math.random() * 15)
    const weight = 60 + Math.floor(Math.random() * 40)
    const bmi = calculateBMI(height, weight)

    const person: Person = {
      id: generateId('person'),
      sessionId,
      name,
      idCard: randomIdCard(),
      gender,
      age,
      phone: randomPhone(),
      address: '阳光社区' + (i + 1) + '号楼' + (i % 6 + 1) + '单元',
      createdAt: new Date().toISOString(),
      status: i < count * 0.7 ? 'completed' : i < count * 0.85 ? 'vitals_done' : 'registered'
    }

    const hasQuestionnaire = person.status !== 'registered'
    const hasVitals = person.status !== 'registered' && person.status !== 'questionnaire_done'
    const hasAssessment = person.status === 'completed'

    const questionnaire: Questionnaire | undefined = hasQuestionnaire ? {
      id: generateId('q'),
      personId: person.id,
      snoreFrequency: Math.floor(Math.random() * 5),
      nightAwakening: Math.floor(Math.random() * 5),
      daytimeSleepiness: Math.floor(Math.random() * 5),
      hasHypertension: Math.random() > 0.6,
      medicalHistory: Math.random() > 0.7 ? '有糖尿病史' : '',
      familyFeedback: '',
      notes: ''
    } : undefined

    const vitals: Vitals | undefined = hasVitals ? {
      id: generateId('v'),
      personId: person.id,
      height,
      weight,
      bmi,
      systolicBp: 120 + Math.floor(Math.random() * 40),
      diastolicBp: 75 + Math.floor(Math.random() * 20),
      neckCircumference: gender === 'male' ? 36 + Math.floor(Math.random() * 10) : 32 + Math.floor(Math.random() * 8),
      waistCircumference: gender === 'male' ? 85 + Math.floor(Math.random() * 20) : 78 + Math.floor(Math.random() * 18)
    } : undefined

    let assessment: Assessment | undefined
    let referral: Referral | undefined

    if (hasAssessment && questionnaire && vitals) {
      assessment = calculateAssessment(person, questionnaire, vitals)
      
      if (assessment.riskLevel === 'high') {
        referral = {
          id: generateId('ref'),
          personId: person.id,
          status: Math.random() > 0.5 ? 'pending' : 'referred',
          hospital: Math.random() > 0.5 ? '市第一人民医院' : '',
          referralDate: Math.random() > 0.5 ? new Date().toISOString().split('T')[0] : '',
          followUpNote: ''
        }
      }
    }

    records.push({ person, questionnaire, vitals, assessment, referral })
  }

  return records
}

export const mockEducationTemplates: EducationTemplate[] = [
  {
    id: 'edu_001',
    category: '基础科普',
    title: '什么是睡眠呼吸暂停？',
    content: '睡眠呼吸暂停是一种常见的睡眠障碍，表现为睡眠中呼吸反复停止或变浅。每次暂停可持续数秒到数分钟，每晚可能发生数十次甚至上百次。最常见的类型是阻塞性睡眠呼吸暂停（OSA），由睡眠时喉咙肌肉松弛阻塞气道引起。'
  },
  {
    id: 'edu_002',
    category: '危害说明',
    title: '睡眠呼吸暂停的危害',
    content: '长期 untreated 的睡眠呼吸暂停可能导致：\n1. 高血压、心律失常、心衰等心血管疾病\n2. 糖尿病、代谢综合征\n3. 记忆力下降、认知功能减退\n4. 白天嗜睡，增加交通事故和工作事故风险\n5. 影响生活质量和家庭关系\n\n早发现、早干预非常重要！'
  },
  {
    id: 'edu_003',
    category: '生活方式',
    title: '改善睡眠呼吸的生活建议',
    content: '1. 控制体重：减重是改善OSA的重要措施\n2. 侧睡：避免仰卧，可减少舌头后坠\n3. 戒烟限酒：烟酒会加重气道松弛\n4. 规律作息：保持固定的睡眠时间\n5. 避免睡前服用镇静药物\n6. 适当运动：增强肌肉张力\n7. 保持鼻腔通畅：如有鼻炎及时治疗'
  },
  {
    id: 'edu_004',
    category: '诊疗指南',
    title: '怀疑有睡眠呼吸暂停怎么办？',
    content: '如果您或家人有以下情况，建议尽早就医：\n- 打鼾声音大，影响他人休息\n- 睡眠中经常憋气或突然惊醒\n- 白天经常感到困倦、乏力\n- 早晨起床头痛、口干\n- 血压控制不理想\n\n可到医院呼吸科或睡眠中心进行多导睡眠监测（PSG）检查，明确诊断后在医生指导下治疗。'
  },
  {
    id: 'edu_005',
    category: '治疗方式',
    title: '睡眠呼吸暂停的治疗方法',
    content: '睡眠呼吸暂停的治疗方式包括：\n\n1. 持续气道正压通气（CPAP）：中重度患者首选治疗方式\n2. 口腔矫治器：适合轻中度患者\n3. 手术治疗：根据具体情况选择\n4. 生活方式干预：减重、侧睡等\n\n治疗方案需由医生根据病情严重程度和个体情况制定，请遵医嘱治疗。'
  }
]
