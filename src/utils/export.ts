import type { ScreeningRecord } from '@/types'
import { getRiskLevelText, getStatusText, getReferralStatusText, getFollowUpStatusText, getReviewStatusText } from './assessment'
import { formatDateTime } from './storage'

export function exportToCSV(records: ScreeningRecord[], filename?: string): void {
  const headers = [
    '序号',
    '姓名',
    '性别',
    '年龄',
    '身份证号',
    '联系电话',
    '住址',
    '筛查状态',
    '身高(cm)',
    '体重(kg)',
    'BMI',
    '收缩压(mmHg)',
    '舒张压(mmHg)',
    '颈围(cm)',
    '腰围(cm)',
    '既往病史',
    '打鼾频率',
    '夜间憋醒',
    '白天嗜睡',
    '总分',
    '风险等级',
    '是否重新评估',
    '重评次数',
    '复核状态',
    '分派复核人',
    '复核人',
    '复核时间',
    '复核备注',
    '转诊状态',
    '转诊医院',
    '随访进度',
    '预约日期',
    '未到院原因',
    '修改次数',
    '建档时间',
    '筛查完成时间'
  ]

  const snoreDescriptions = ['从不', '偶尔', '有时', '经常', '总是']
  const awakeningDescriptions = ['从不', '偶尔', '每周1-2次', '每周3-4次', '几乎每晚']
  const sleepinessDescriptions = ['从不', '偶尔', '有时', '经常', '总是']

  const rows = records.map((record, index) => {
    const { person, questionnaire, vitals, assessment, referral, review } = record
    const reviewStatus = review ? review.status : (person.status === 'completed' ? 'pending' : '')
    return [
      index + 1,
      person.name,
      person.gender === 'male' ? '男' : '女',
      person.age,
      person.idCard || '-',
      person.phone || '-',
      person.address || '-',
      getStatusText(person.status),
      vitals?.height || '-',
      vitals?.weight || '-',
      vitals?.bmi || '-',
      vitals?.systolicBp || '-',
      vitals?.diastolicBp || '-',
      vitals?.neckCircumference || '-',
      vitals?.waistCircumference || '-',
      questionnaire?.medicalHistory || '-',
      questionnaire ? snoreDescriptions[questionnaire.snoreFrequency] || '-' : '-',
      questionnaire ? awakeningDescriptions[questionnaire.nightAwakening] || '-' : '-',
      questionnaire ? sleepinessDescriptions[questionnaire.daytimeSleepiness] || '-' : '-',
      assessment?.totalScore != null ? assessment.totalScore : '-',
      assessment ? getRiskLevelText(assessment.riskLevel) : '-',
      assessment?.isReassessment ? '是' : '否',
      assessment?.reassessmentCount || 0,
      reviewStatus ? getReviewStatusText(reviewStatus) : '-',
      review?.assignedReviewer || '-',
      review?.reviewedBy || '-',
      review?.reviewedAt ? formatDateTime(review.reviewedAt) : '-',
      review?.notes || '-',
      referral ? getReferralStatusText(referral.status) : '-',
      referral?.hospital || '-',
      referral?.followUpProgress ? getFollowUpStatusText(referral.followUpProgress) : '-',
      referral?.scheduledDate || '-',
      referral?.noShowReason || '-',
      record.modificationRecords?.length || 0,
      person.createdAt ? formatDateTime(person.createdAt) : '-',
      assessment?.assessedAt ? formatDateTime(assessment.assessedAt) : '-'
    ]
  })

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `筛查数据_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateResultHTML(record: ScreeningRecord): string {
  const { person, questionnaire, vitals, assessment } = record
  if (!assessment) return ''

  const riskText = getRiskLevelText(assessment.riskLevel)
  const riskColor = assessment.riskLevel === 'low' ? '#52c41a' 
    : assessment.riskLevel === 'medium' ? '#faad14' 
    : '#ff4d4f'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>睡眠呼吸暂停筛查结果</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; max-width: 700px; margin: 0 auto; }
    h1 { text-align: center; color: #1677ff; margin-bottom: 20px; }
    .section { margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .section h2 { margin-top: 0; color: #1f2937; font-size: 18px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item { display: flex; }
    .info-label { color: #6b7280; width: 80px; }
    .info-value { color: #1f2937; font-weight: 500; }
    .risk-box { text-align: center; padding: 24px; border-radius: 8px; margin: 16px 0; }
    .risk-score { font-size: 48px; font-weight: bold; }
    .risk-label { font-size: 24px; font-weight: bold; margin-top: 8px; }
    .score-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .score-item:last-child { border-bottom: none; }
    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <h1>睡眠呼吸暂停初筛结果</h1>
  
  <div class="section">
    <h2>基本信息</h2>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">姓名：</span><span class="info-value">${person.name}</span></div>
      <div class="info-item"><span class="info-label">性别：</span><span class="info-value">${person.gender === 'male' ? '男' : '女'}</span></div>
      <div class="info-item"><span class="info-label">年龄：</span><span class="info-value">${person.age}岁</span></div>
      <div class="info-item"><span class="info-label">电话：</span><span class="info-value">${person.phone}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>体格指标</h2>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">身高：</span><span class="info-value">${vitals?.height || '-'}cm</span></div>
      <div class="info-item"><span class="info-label">体重：</span><span class="info-value">${vitals?.weight || '-'}kg</span></div>
      <div class="info-item"><span class="info-label">BMI：</span><span class="info-value">${vitals?.bmi || '-'}</span></div>
      <div class="info-item"><span class="info-label">血压：</span><span class="info-value">${vitals?.systolicBp || '-'}/${vitals?.diastolicBp || '-'}mmHg</span></div>
      <div class="info-item"><span class="info-label">颈围：</span><span class="info-value">${vitals?.neckCircumference || '-'}cm</span></div>
      <div class="info-item"><span class="info-label">腰围：</span><span class="info-value">${vitals?.waistCircumference || '-'}cm</span></div>
    </div>
  </div>

  <div class="section">
    <h2>风险评估</h2>
    <div class="risk-box" style="background-color: ${riskColor}20;">
      <div class="risk-score" style="color: ${riskColor};">${assessment.totalScore} / ${assessment.maxScore} 分</div>
      <div class="risk-label" style="color: ${riskColor};">${riskText}</div>
    </div>
    <div style="margin-top: 16px;">
      ${assessment.scoreDetails.map(d => `
        <div class="score-item">
          <span>${d.name}：${d.description}</span>
          <span style="color: ${d.score > 0 ? '#ff4d4f' : '#52c41a'};">${d.score}分</span>
        </div>
      `).join('')}
    </div>
  </div>

  ${questionnaire?.notes ? `
  <div class="section">
    <h2>备注</h2>
    <p style="color: #4b5563; margin: 0;">${questionnaire.notes}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>筛查时间：${assessment.assessedAt ? formatDateTime(assessment.assessedAt) : '-'}</p>
    <p>本结果仅作为初筛参考，不作为诊断依据。如有疑虑，请前往医院进一步检查。</p>
  </div>
</body>
</html>
  `
}

export function printResult(record: ScreeningRecord): void {
  const html = generateResultHTML(record)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}
