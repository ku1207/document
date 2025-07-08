import NewDocumentAnalyzer from '@/components/NewDocumentAnalyzer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 상단 영역 - 제목 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            문서 요약/질문 에이전트
          </h1>
        </div>
      </header>
      
      {/* 메인 컨텐츠 영역 */}
      <div className="container mx-auto px-6 py-8">
        <NewDocumentAnalyzer />
      </div>
    </main>
  )
} 