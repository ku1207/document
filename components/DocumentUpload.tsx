'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, X } from 'lucide-react'

interface DocumentUploadProps {
  onFileUpload: (file: File, content: string) => void
}

export default function DocumentUpload({ onFileUpload }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'docx':
      case 'doc':
        return '📝'
      case 'txt':
        return '📃'
      case 'md':
        return '📋'
      default:
        return '📄'
    }
  }

  const getFileFormat = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return 'PDF'
      case 'docx':
      case 'doc':
        return 'WORD'
      case 'txt':
        return 'TXT'
      case 'md':
        return 'MD'
      default:
        return 'FILE'
    }
  }

  const handleFileRead = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      let text = ''
      
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        text = await file.text()
      } else if (file.name.endsWith('.md')) {
        text = await file.text()
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // PDF 파일의 경우 실제로는 PDF 파싱 라이브러리가 필요하지만, 시뮬레이션으로 처리
        text = `PDF 파일 "${file.name}"이 업로드되었습니다.\n\n이 파일은 PDF 형식으로, 실제 구현에서는 PDF 파싱 라이브러리를 사용하여 텍스트를 추출해야 합니다.\n\n파일 크기: ${Math.round(file.size / 1024)}KB`
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        // Word 파일의 경우도 시뮬레이션으로 처리
        text = `Word 파일 "${file.name}"이 업로드되었습니다.\n\n이 파일은 Word 형식으로, 실제 구현에서는 DOCX 파싱 라이브러리를 사용하여 텍스트를 추출해야 합니다.\n\n파일 크기: ${Math.round(file.size / 1024)}KB`
      } else {
        text = await file.text()
      }
      
      setUploadedFile(file)
      onFileUpload(file, text)
    } catch (err) {
      setError('파일을 읽는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const allowedExtensions = ['.txt', '.pdf', '.docx', '.md']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (file.size > maxSize) {
      setError('파일 크기는 10MB를 초과할 수 없습니다.')
      return
    }

    const isAllowedType = allowedTypes.includes(file.type) || 
                          allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!isAllowedType) {
      setError('지원되는 파일 형식: TXT, PDF, DOCX, MD')
      return
    }

    handleFileRead(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleClick = () => {
    if (!uploadedFile) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">문서 업로드</h2>
      
      <div className="flex-1 flex flex-col">
        {/* 파일 업로드 영역 */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-4 ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : uploadedFile
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx,.md"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-gray-400">
              {isLoading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              ) : uploadedFile ? (
                <div className="text-green-500">
                  <FileText size={48} />
                </div>
              ) : (
                <Upload size={48} />
              )}
            </div>
            
            <div>
              <h3 className={`text-lg font-medium mb-2 ${
                uploadedFile ? 'text-green-900' : 'text-gray-900'
              }`}>
                {uploadedFile ? '파일이 업로드되었습니다' : '파일을 업로드하세요'}
              </h3>
              <p className={`text-sm mb-1 ${
                uploadedFile ? 'text-green-700' : 'text-gray-500'
              }`}>
                {uploadedFile ? '다른 파일을 업로드하려면 클릭하세요' : '드래그 앤 드롭하거나 클릭하여 파일을 선택하세요'}
              </p>
              <p className={`text-xs ${
                uploadedFile ? 'text-green-600' : 'text-gray-400'
              }`}>
                지원 형식: TXT, PDF, DOCX, MD (최대 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* 업로드된 파일 정보 표시 영역 */}
        {uploadedFile && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getFileIcon(uploadedFile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadedFile.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {getFileFormat(uploadedFile.name)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(uploadedFile.size / 1024)}KB
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="파일 제거"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
} 