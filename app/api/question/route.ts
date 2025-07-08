import { NextRequest, NextResponse } from 'next/server'
import { createCompletion, createThread, addMessageToThread, addAssistantMessage, getThreadMessages, createChatCompletion, cleanJsonResponse } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { question, content, fileName, threadId, isFollowUp } = await request.json()

    if (!question || !content) {
      return NextResponse.json(
        { error: 'Question and content are required' },
        { status: 400 }
      )
    }

    let newThreadId = threadId

    // 새 질문이거나 threadId가 없는 경우 새 스레드 생성
    if (!isFollowUp || !threadId) {
      try {
        newThreadId = await createThread()
      } catch (error) {
        console.error('Failed to create thread, using direct completion:', error)
        newThreadId = null
      }
    }

    // 질의 응답 프롬프트
    const systemPrompt = `###지시사항
아래 출력 규격에 맞추어 문서에서 정보를 찾아 사용자 질문에 대한 답변을 JSON 형태로 생성하십시오.
 
###작성지침
1. 전체 구조
- 결과는 순수 JSON(UTF-8) 만 출력합니다.
- JSON 외의 문장·설명·주석은 절대 출력하지 마십시오.
- 최상위 키는 **answer, evidence** 2개이며 **순서 고정**입니다.
- 문서에 답이 없으면 답변을 추측하지 말고 지침에 따라 표기하십시오.
 
2. 필수 필드 및 값 규칙
(1) **answer**  
  - 문서에서 **직접 확인된 내용**으로만 작성합니다.  
  - 문서에 명시적 근거가 없으면 단일 문자열 \`"문서 내 정보 확인 불가"\` 로 기재합니다.
(2) **evidence**
  - 문서에서 답변을 뒷받침하는 핵심 구절(각 40자 이내)을 배열 형태로 최대 3개까지 제시합니다. 문서에 작성된 글자를 수정하지 말고 그대로 기입하십시오.
  - \`answer\` 가 \`"문서 내 정보 확인 불가"\` 인 경우 \`["-"]\` 만 넣습니다.
 
3. 검증 규칙
- \`answer\` 가 \`"-"\` 이면 \`evidence\` 는 반드시 \`["-"]\` 여야 합니다.  
- \`answer\` 가 유효 문자열이면 \`evidence\` 는 최소 1개 이상이어야 합니다.  
- 불필요한 줄바꿈·공백을 제거하여 JSON 파싱 오류가 없도록 하십시오.
 
###출력형태
{
  "answer": "-",
  "evidence": ["-"]
}`

    const prompt = `###문서
${content}
 
###질문
${question}`

    let answer: string
    let sourceText: string

    try {
      let response: string

      // 후속 질문이고 threadId가 있는 경우 Thread 기반 대화 사용
      if (isFollowUp && threadId) {
        const threadMessages = await getThreadMessages(threadId)
        
        // 시스템 메시지와 이전 대화 내용을 포함한 메시지 배열 생성
        const messages: any[] = [
          { role: 'system', content: systemPrompt },
          ...threadMessages,
          { role: 'user', content: prompt }
        ]
        
        // createChatCompletion 사용하여 전체 대화 맥락 전달
        response = await createChatCompletion(messages)
        
        // Thread에 메시지 추가
        await addMessageToThread(threadId, prompt)
        await addAssistantMessage(threadId, response)
      } else {
        // 새 질문이거나 threadId가 없는 경우 단순 completion 사용
        response = await createCompletion(prompt, systemPrompt)
        
        // 새 thread에 메시지 추가
        if (newThreadId) {
          await addMessageToThread(newThreadId, prompt)
          await addAssistantMessage(newThreadId, response)
        }
      }

      // JSON 파싱 시도 (마크다운 코드 블록 제거 후)
      let parsedResponse
      try {
        const cleanedResponse = cleanJsonResponse(response)
        parsedResponse = JSON.parse(cleanedResponse)
        
        answer = parsedResponse.answer || '답변을 생성할 수 없습니다.'
        
        // evidence 배열을 sourceText로 변환
        if (parsedResponse.evidence && Array.isArray(parsedResponse.evidence)) {
          const validEvidence = parsedResponse.evidence.filter((e: string) => e !== '-')
          sourceText = validEvidence.length > 0 ? validEvidence.join('\n\n') : '참고할 문서 구절이 없습니다.'
        } else {
          sourceText = '참고할 문서 구절이 없습니다.'
        }
        
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError)
        answer = '답변 생성 중 JSON 파싱 오류가 발생했습니다. 다시 시도해주세요.'
        sourceText = '오류로 인해 참고 문서를 찾을 수 없습니다.'
      }

    } catch (error) {
      console.error('Error processing question:', error)
      return NextResponse.json(
        { error: 'Failed to process question' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      answer,
      sourceText,
      threadId: newThreadId,
    })
  } catch (error) {
    console.error('Error in question API:', error)
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
} 