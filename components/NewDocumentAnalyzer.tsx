'use client'

import { useState } from 'react'
import DocumentUpload from './DocumentUpload'
import DocumentResults from './DocumentResults'

export default function NewDocumentAnalyzer() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [documentContent, setDocumentContent] = useState<string>('')
  const [activeMode, setActiveMode] = useState<'none' | 'summary' | 'question'>('none')
  const [summary, setSummary] = useState<string>('')

  const handleFileUpload = (file: File, content: string) => {
    setUploadedFile(file)
    setDocumentContent(content)
    setActiveMode('none')
    setSummary('')
  }

  const handleSummaryRequest = () => {
    setActiveMode('summary')
  }

  const handleQuestionRequest = () => {
    setActiveMode('question')
  }

  const handleSummaryGenerated = (summaryText: string) => {
    setSummary(summaryText)
  }

  return (
    <div className="flex gap-6 min-h-[80vh]">
      {/* 좌측 영역 - 문서 업로드 (40%) */}
      <div className="w-2/5 bg-white rounded-lg shadow-md p-6">
        <DocumentUpload onFileUpload={handleFileUpload} />
      </div>

      {/* 우측 영역 - 버튼 및 결과 (60%) */}
      <div className="w-3/5 bg-white rounded-lg shadow-md p-6">
        <DocumentResults
          uploadedFile={uploadedFile}
          documentContent={documentContent}
          activeMode={activeMode}
          summary={summary}
          onSummaryRequest={handleSummaryRequest}
          onQuestionRequest={handleQuestionRequest}
          onSummaryGenerated={handleSummaryGenerated}
        />
      </div>
    </div>
  )
} 