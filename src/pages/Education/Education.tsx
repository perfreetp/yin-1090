import { useState } from 'react'
import { BookOpen, Copy, Search, ChevronDown, ChevronUp, Volume2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import PageHeader from '@/components/Layout/PageHeader'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import Input from '@/components/Form/Input'

export default function Education() {
  const { educationTemplates } = useAppStore()
  const [searchText, setSearchText] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = [...new Set(educationTemplates.map(t => t.category))]

  const filteredTemplates = educationTemplates.filter(t =>
    t.title.includes(searchText) || t.content.includes(searchText)
  )

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
          <div className="flex gap-2">
            {categories.map(cat => (
              <span
                key={cat}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
              >
                {cat}
              </span>
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
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
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
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                        {template.content}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(template.id, template.content)
                          }}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          {isCopied ? '已复制' : '复制话术'}
                        </Button>
                        <Button size="sm" variant="ghost">
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
              <p className="text-gray-400">未找到匹配的宣教话术</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
