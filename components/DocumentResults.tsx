'use client'

import { useState } from 'react'
import { Brain, MessageCircle, FileText, Search, Copy, Check, RefreshCw, Plus } from 'lucide-react'

interface DocumentResultsProps {
  uploadedFile: File | null
  documentContent: string
  activeMode: 'none' | 'summary' | 'question'
  summary: string
  onSummaryRequest: () => void
  onQuestionRequest: () => void
  onSummaryGenerated: (summary: string) => void
}

interface QASession {
  question: string
  answer: string
  sourceText: string
  timestamp: Date
}

interface FollowUpSession {
  question: string
  answer: string
  sourceText: string
  timestamp: Date
}

export default function DocumentResults({
  uploadedFile,
  documentContent,
  activeMode,
  summary,
  onSummaryRequest,
  onQuestionRequest,
  onSummaryGenerated
}: DocumentResultsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [question, setQuestion] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [qaSession, setQASession] = useState<QASession | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isFollowUpMode, setIsFollowUpMode] = useState(false)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [isFollowUpSearching, setIsFollowUpSearching] = useState(false)
  const [followUpSession, setFollowUpSession] = useState<FollowUpSession | null>(null)

  const generateSummary = async () => {
    if (!uploadedFile || !documentContent) return

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: documentContent,
          fileName: uploadedFile.name,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      
      // JSON 파싱 시도
      let parsedSummary
      try {
        parsedSummary = JSON.parse(data.summary)
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError)
        onSummaryGenerated('요약 생성 중 JSON 파싱 오류가 발생했습니다. 다시 시도해주세요.')
        return
      }
      
      // 구조화된 요약 텍스트로 변환
      const formattedSummary = formatStructuredSummary(parsedSummary)
      onSummaryGenerated(formattedSummary)
    } catch (error) {
      console.error('Error generating summary:', error)
      onSummaryGenerated('요약 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatStructuredSummary = (summaryData: any) => {
    try {
      let formatted = ''
      
      if (summaryData.overview && summaryData.overview !== '-') {
        formatted += `📄 **문서 개요**\n${summaryData.overview}\n\n`
      }
      
      if (summaryData.keyMessages && Array.isArray(summaryData.keyMessages) && summaryData.keyMessages.length > 0) {
        formatted += `🔑 **핵심 메시지**\n`
        summaryData.keyMessages.forEach((message: string, index: number) => {
          if (message !== '-') {
            formatted += `${index + 1}. ${message}\n`
          }
        })
        formatted += '\n'
      }
      
      if (summaryData.summary && summaryData.summary !== '-') {
        formatted += `📋 **요약**\n${summaryData.summary}`
      }
      
      return formatted || '요약 정보를 구성하는 중 오류가 발생했습니다.'
    } catch (error) {
      console.error('요약 포맷팅 오류:', error)
      return '요약 정보를 구성하는 중 오류가 발생했습니다.'
    }
  }

  const handleSearch = async () => {
    if (!question.trim() || !uploadedFile || !documentContent) return

    setIsSearching(true)
    
    try {
      const response = await fetch('/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          content: documentContent,
          fileName: uploadedFile.name,
          threadId,
          isFollowUp: qaSession !== null && threadId !== null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get answer')
      }

      const data = await response.json()
      
      const newQASession: QASession = {
        question,
        answer: data.answer,
        sourceText: data.sourceText,
        timestamp: new Date()
      }
      
      setQASession(newQASession)
      setQuestion('')
      
      // threadId 업데이트
      if (data.threadId) {
        setThreadId(data.threadId)
      }
    } catch (error) {
      console.error('Error processing question:', error)
      const errorSession: QASession = {
        question,
        answer: '질문 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        sourceText: '오류로 인해 참고 문서를 찾을 수 없습니다.',
        timestamp: new Date()
      }
      setQASession(errorSession)
      setQuestion('')
    } finally {
      setIsSearching(false)
    }
  }

  const handleNewQuestion = () => {
    setQASession(null)
    setQuestion('')
    setThreadId(null) // 새 thread를 위해 초기화
    setIsFollowUpMode(false)
    setFollowUpQuestion('')
    setFollowUpSession(null)
  }

  const handleFollowUpQuestion = () => {
    setIsFollowUpMode(true)
    setFollowUpQuestion('')
    setFollowUpSession(null)
  }

  const handleFollowUpSearch = async () => {
    if (!followUpQuestion.trim() || !uploadedFile || !documentContent) return

    setIsFollowUpSearching(true)
    
    try {
      const response = await fetch('/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: followUpQuestion,
          content: documentContent,
          fileName: uploadedFile.name,
          threadId,
          isFollowUp: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get answer')
      }

      const data = await response.json()
      
      const newFollowUpSession: FollowUpSession = {
        question: followUpQuestion,
        answer: data.answer,
        sourceText: data.sourceText,
        timestamp: new Date()
      }
      
      setFollowUpSession(newFollowUpSession)
      setFollowUpQuestion('')
      
    } catch (error) {
      console.error('Error processing follow-up question:', error)
      const errorSession: FollowUpSession = {
        question: followUpQuestion,
        answer: '후속 질문 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        sourceText: '오류로 인해 참고 문서를 찾을 수 없습니다.',
        timestamp: new Date()
      }
      setFollowUpSession(errorSession)
      setFollowUpQuestion('')
    } finally {
      setIsFollowUpSearching(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  const handleSummaryClick = () => {
    onSummaryRequest()
    if (uploadedFile && !summary) {
      generateSummary()
    }
  }

  const handleQuestionClick = () => {
    onQuestionRequest()
    setQASession(null)
    setQuestion('')
    setThreadId(null) // 새 질문 모드로 전환 시 thread 초기화
  }

  return (
    <div className="h-full flex flex-col">
      {/* 버튼 영역 */}
      {uploadedFile && (
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={handleSummaryClick}
              disabled={isGenerating}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : activeMode === 'summary'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              <Brain size={20} />
              <span>{isGenerating ? '요약 생성 중...' : '문서 요약하기'}</span>
            </button>
            
            <button
              onClick={handleQuestionClick}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeMode === 'question'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              <MessageCircle size={20} />
              <span>질문하기</span>
            </button>
          </div>
        </div>
      )}

      {/* 결과 영역 */}
      <div className="flex-1 overflow-hidden">
        {!uploadedFile ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">문서를 업로드해주세요</p>
              <p className="text-sm mt-2">문서를 업로드하면 요약 및 질문 기능을 사용할 수 있습니다.</p>
            </div>
          </div>
        ) : activeMode === 'summary' ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">문서 요약</h3>
              {summary && (
                <button
                  onClick={() => handleCopy(summary)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? '복사됨' : '복사'}</span>
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4">
              {isGenerating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">GPT-4.1이 문서를 분석하여 요약을 생성하고 있습니다...</p>
                  </div>
                </div>
              ) : summary ? (
                <div className="whitespace-pre-wrap text-gray-700">
                  {summary}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>요약을 생성하려면 "문서 요약하기" 버튼을 클릭해주세요.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeMode === 'question' ? (
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-4">질문하기</h3>
            
            <div className="flex-1 flex flex-col space-y-4">
              {/* 질문 입력 영역 */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="문서에서 궁금한 사항을 입력해 주세요."
                  className="flex-1 input-field"
                  disabled={isSearching || isFollowUpMode}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isFollowUpMode) {
                      handleSearch()
                    }
                  }}
                />
                <button
                  onClick={handleSearch}
                  disabled={!question.trim() || isSearching || isFollowUpMode}
                  className="btn-primary flex items-center space-x-1"
                >
                  <Search size={16} />
                  <span>{isSearching ? '검색 중...' : '검색'}</span>
                </button>
              </div>

              {isFollowUpMode && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 mb-2">후속 질문 모드입니다. 아래에서 추가 질문을 입력해주세요.</p>
                </div>
              )}

              {/* 답변 및 문서 원본 영역 */}
              {qaSession && (
                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* 답변 영역 */}
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">답변</h4>
                      <button
                        onClick={() => handleCopy(qaSession.answer)}
                        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copied ? '복사됨' : '복사'}</span>
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {qaSession.answer}
                    </div>
                  </div>

                  {/* 증거 문서 영역 */}
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">📑 증거 문서</h4>
                    <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                      <div className="whitespace-pre-line">
                        {qaSession.sourceText}
                      </div>
                    </div>

                    {/* 후속 질문 입력 영역 */}
                    {isFollowUpMode && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">🔄 후속 질문</h5>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={followUpQuestion}
                            onChange={(e) => setFollowUpQuestion(e.target.value)}
                            placeholder="추가로 궁금한 내용을 입력해주세요..."
                            className="flex-1 input-field"
                            disabled={isFollowUpSearching}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleFollowUpSearch()
                              }
                            }}
                          />
                          <button
                            onClick={handleFollowUpSearch}
                            disabled={!followUpQuestion.trim() || isFollowUpSearching}
                            className="btn-primary flex items-center space-x-1"
                          >
                            <Search size={16} />
                            <span>{isFollowUpSearching ? '검색 중...' : '검색'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 후속 질문 답변 영역 */}
                  {followUpSession && (
                    <div className="space-y-4">
                      {/* 후속 답변 영역 */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">🔄 후속 답변</h4>
                          <button
                            onClick={() => handleCopy(followUpSession.answer)}
                            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copied ? '복사됨' : '복사'}</span>
                          </button>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {followUpSession.answer}
                        </div>
                      </div>

                      {/* 후속 증거 문서 영역 */}
                      <div className="bg-gray-50 border rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">📑 추가 증거 문서</h4>
                        <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                          <div className="whitespace-pre-line">
                            {followUpSession.sourceText}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 새 질문하기 / 후속 질문하기 버튼 */}
                  {!isFollowUpMode && (
                    <div className="flex justify-center space-x-3 pt-4">
                      <button
                        onClick={handleNewQuestion}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={16} />
                        <span>새 질문하기</span>
                      </button>
                      <button
                        onClick={handleFollowUpQuestion}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <RefreshCw size={16} />
                        <span>후속 질문하기</span>
                      </button>
                    </div>
                  )}

                  {/* 후속 질문 답변 후 버튼들 */}
                  {followUpSession && (
                    <div className="flex justify-center space-x-3 pt-4">
                      <button
                        onClick={handleNewQuestion}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={16} />
                        <span>새 질문하기</span>
                      </button>
                      <button
                        onClick={handleFollowUpQuestion}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <RefreshCw size={16} />
                        <span>후속 질문하기</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 검색 중 상태 */}
              {(isSearching || isFollowUpSearching) && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">
                      GPT-4.1이 {isFollowUpSearching ? '후속 ' : ''}질문에 대한 답변을 생성하고 있습니다...
                    </p>
                  </div>
                </div>
              )}

              {/* 질문 대기 상태 */}
              {!qaSession && !isSearching && !isFollowUpSearching && (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">질문을 입력해주세요</p>
                    <p className="text-sm mt-2">문서에 대해 궁금한 사항을 질문해보세요.</p>
                    {threadId && (
                      <p className="text-xs text-gray-400 mt-2">Thread ID: {threadId}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">기능을 선택해주세요</p>
              <p className="text-sm mt-2">문서 요약 또는 질문하기 버튼을 클릭해주세요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 