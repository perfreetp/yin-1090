import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, UserPlus, Search, ListTodo, QrCode } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import Input from '@/components/Form/Input'
import { StatusBadge } from '@/components/Badge/Badge'
import { generateId } from '@/utils/storage'
import type { Gender } from '@/types'

type TabType = 'scan' | 'manual' | 'list'

export default function Registration() {
  const navigate = useNavigate()
  const { addPerson, records, currentSessionId } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>('scan')
  const [searchText, setSearchText] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    idCard: '',
    gender: '' as Gender | '',
    age: '',
    phone: '',
    address: ''
  })

  const sessionRecords = records.filter(r => r.person.sessionId === currentSessionId)
  const filteredRecords = sessionRecords.filter(r => 
    r.person.name.includes(searchText) || r.person.idCard.includes(searchText) || r.person.phone.includes(searchText)
  )

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.gender || !formData.age) {
      alert('请填写姓名、性别和年龄')
      return
    }

    const newPerson = addPerson({
      name: formData.name,
      idCard: formData.idCard,
      gender: formData.gender as Gender,
      age: parseInt(formData.age),
      phone: formData.phone,
      address: formData.address
    })

    navigate(`/screening/${newPerson.id}`)
  }

  const handleSimulateScan = () => {
    const mockNames = ['王建国', '李秀英', '张明德', '刘桂芳', '陈志强']
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)]
    const randomGender = Math.random() > 0.5 ? 'male' : 'female'
    const randomAge = 55 + Math.floor(Math.random() * 25)
    
    setFormData({
      name: randomName,
      idCard: '11010119' + (60 + Math.floor(Math.random() * 20)) + '0101' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      gender: randomGender,
      age: randomAge.toString(),
      phone: '1' + (3 + Math.floor(Math.random() * 6)).toString() + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'),
      address: '阳光社区' + (Math.floor(Math.random() * 20) + 1) + '号楼'
    })
    setActiveTab('manual')
  }

  const startScreening = (personId: string) => {
    navigate(`/screening/${personId}`)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="扫码建档"
        subtitle="扫描身份证或手动录入建立筛查档案"
        showBack
        backTo="/"
      />

      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {[
            { key: 'scan', label: '扫码录入', icon: Camera },
            { key: 'manual', label: '手动录入', icon: UserPlus },
            { key: 'list', label: '人员名单', icon: ListTodo }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-colors ${
                  isActive 
                    ? 'border-blue-600 text-blue-600 font-medium' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'scan' && (
          <div className="max-w-xl mx-auto">
            <Card className="text-center">
              <div className="py-8">
                <div className="w-48 h-48 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden mb-6">
                  <QrCode className="w-20 h-20 text-gray-300" />
                  <div className="absolute inset-0 border-4 border-dashed border-gray-200 rounded-2xl m-4" />
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-blue-500/50 animate-pulse" style={{ marginTop: '-1px' }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">将身份证放入扫描框</h3>
                <p className="text-gray-500 mb-6">自动识别姓名、身份证号等信息</p>
                <Button onClick={handleSimulateScan} size="lg" className="w-full">
                  <Camera className="w-5 h-5 mr-2" />
                  模拟扫码（演示）
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="max-w-xl mx-auto">
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-6">人员信息登记</h3>
              <div className="space-y-5">
                <Input
                  label="姓名 *"
                  placeholder="请输入姓名"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">性别 *</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleInputChange('gender', 'male')}
                        className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                          formData.gender === 'male' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        男
                      </button>
                      <button
                        onClick={() => handleInputChange('gender', 'female')}
                        className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                          formData.gender === 'female' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        女
                      </button>
                    </div>
                  </div>
                  <Input
                    label="年龄 *"
                    type="number"
                    placeholder="请输入年龄"
                    suffix="岁"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>

                <Input
                  label="身份证号"
                  placeholder="请输入身份证号"
                  value={formData.idCard}
                  onChange={(e) => handleInputChange('idCard', e.target.value)}
                />

                <Input
                  label="联系电话"
                  placeholder="请输入联系电话"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />

                <Input
                  label="家庭住址"
                  placeholder="请输入家庭住址"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />

                <div className="pt-4">
                  <Button size="lg" block onClick={handleSubmit}>
                    开始筛查
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="搜索姓名、身份证号、手机号..."
                  className="pl-12"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500">
                共 {filteredRecords.length} 人
              </div>
            </div>

            <Card padding="none">
              <div className="divide-y divide-gray-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map(record => (
                    <div 
                      key={record.person.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => startScreening(record.person.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {record.person.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.person.name}</p>
                          <p className="text-sm text-gray-500">
                            {record.person.age}岁 · {record.person.gender === 'male' ? '男' : '女'} · {record.person.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={record.person.status} size="sm" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>暂无人员记录</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
