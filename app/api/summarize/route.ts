import { NextRequest, NextResponse } from 'next/server'
import { createCompletion, cleanJsonResponse } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { content, fileName } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // 문서 요약 프롬프트
    const systemPrompt = `###지시사항
아래 출력 규격에 맞추어 문서 요약을 JSON 형태로 생성하십시오.
 
###작성지침
1. 전체 구조
- 결과는 순수 JSON(UTF-8) 만 출력합니다.
- JSON 외의 문장·설명·주석은 절대 출력하지 마십시오.
- 최상위 키는 **overview, keyMessages, summary** 의 3개이며 **순서 고정**입니다.
- 모든 키와 하위 필드는 반드시 출력하며, 값이 없거나 파악 불가한 경우 단일 문자열 "-" 로 기재합니다.
- 텍스트에서 중요 용어·고유명사는 원문 그대로 유지하십시오.
- 인용은 15단어 이하로만 사용하고 따옴표로 표기하십시오.
 
2. 필수 필드 및 값 규칙
(1) **overview**  
   - 문서 목적·배경·범위를 **2~3문장**으로 요약  
(2) **keyMessages**  
   - 문서에서 전달하는 핵심 메시지를 **최대 5개 항목** 배열로 작성  
   - 각 항목은 **한글 40자 이내**로 간결하게 기술
(3) **summary**  
   - 문서 전체를 **1~5문장**으로 집약하여 결론·시사점을 제시  
   - 800자 이내 권장
 
3. 검증 규칙
- \`keyMessages\` 는 배열이어야 하며 요소가 **최소 1개 이상** 존재해야 합니다.  
- 모든 문자열 값 앞뒤에 불필요한 공백이나 줄바꿈이 없어야 합니다.  
- JSON 파싱 오류가 없도록 필드명·구조를 정확히 지켜 출력하십시오.
 
###출력형태
{
  "overview": "-",
  "keyMessages": ["-"],
  "summary": "-"
}`

    const prompt = `###문서
${content}`

    const rawSummary = await createCompletion(prompt, systemPrompt)
    const cleanedSummary = cleanJsonResponse(rawSummary)

    return NextResponse.json({ summary: cleanedSummary })
  } catch (error) {
    console.error('Error in summarize API:', error)
    return NextResponse.json(
      { error: 'Failed to summarize document' },
      { status: 500 }
    )
  }
} 