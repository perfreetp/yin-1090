import { useState } from 'react'
import { BookOpen, Copy, Search, ChevronDown, ChevronUp, Volume2, Plus, Pencil, X, Check, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import Input from '@/components/Form/Input'
import type { EducationTemplate } from '@/types'

const CATEGORIES = ['筛查前', '低风险', '中风险', '高风险', '转诊', '随访']

interface FormState {
  id?: string
  category: string
  title: string
  content: string
}

const EMPTY_FORM: FormState = {
  category: CATEGORIES[0],
  title: '',
  content: ''
}

export default function Education() {
  const { educationTemplates, addEducationTemplate, updateEducationTemplate } = useAppStore()
  const [searchText, setSearchText] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const categories = [...new Set(educationTemplates.map(t => t.category))]

  const filteredTemplates = educationTemplates.filter(t => {
    const matchSearch = t.title.includes(searchText) || t.content.includes(searchText)
    const matchCategory = selectedCategory ? t.category === selectedCategory : true
    return matchSearch && matchCategory
  })

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const openAddModal = () => {
    setFormData(EMPTY_FORM)
    setFormErrors({})
    setShowModal(true)
  }

  const openEditModal = (template: EducationTemplate) => {
    setFormData({
      id: template.id,
      category: template.category,
      title: template.title,
      content: template.content
    })
    setFormErrors({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData(EMPTY_FORM)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {}
    if (!formData.title.trim()) errors.title = '请输入话术标题'
    if (!formData.content.trim()) errors.content = '请输入话术内容'
    if (!formData.category.trim()) errors.category = '请选择分类'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    if (formData.id) {
      updateEducationTemplate(formData.id, {
        category: formData.category,
        title: formData.title.trim(),
        content: formData.content.trim()
      })
    } else {
      addEducationTemplate({
        category: formData.category,
        title: formData.title.trim(),
        content: formData.content.trim()
      })
    }
    closeModal()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <PageHeader
        title="宣教话术"
        subtitle="标准化健康宣教话术库"
        showBack
        backTo="/"
      />

      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="搜索话术标题或内容..."
              className="pl-10"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(template => {
              const isExpanded = expandedId === template.id
              const isCopied = copiedId === template.id

              return (
                <Card key={template.id}>
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => toggleExpand(template.id)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-bold text-gray-900 text-lg">{template.title}</h4>
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                            {template.category}
                          </span>
                        </div>
                        {!isExpanded && (
                          <p className="text-gray-500 mt-1 line-clamp-2">
                            {template.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(template)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑话术"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                        {template.content}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(template.id, template.content)
                          }}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          {isCopied ? '已复制' : '复制话术'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Volume2 className="w-4 h-4 mr-1" />
                          语音播报
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400 mb-4">
                {searchText || selectedCategory ? '未找到匹配的宣教话术' : '暂无宣教话术，点击右下角新增'}
              </p>
              {!searchText && !selectedCategory && (
                <Button onClick={openAddModal} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  新增第一条话术
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={openAddModal}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="新增话术"
      >
        <Plus className="w-7 h-7" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {formData.id ? '编辑话术' : '新增话术'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border-2 ${
                        formData.category === cat
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  话术标题 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="例如：高风险人群告知话术"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  error={formErrors.title}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  话术内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  placeholder="请输入详细的宣教话术内容..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none resize-none text-sm ${
                    formErrors.content
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {formErrors.content && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.content}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  已输入 {formData.content.length} 字
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <Button variant="ghost" onClick={closeModal}>
                取消
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <Check className="w-4 h-4 mr-1" />
                保存话术
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
