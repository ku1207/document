import OpenAI from 'openai'

// OpenAI 인스턴스를 lazy하게 생성하는 함수
function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable')
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1'

// JSON 응답에서 마크다운 코드 블록 제거 함수
export function cleanJsonResponse(response: string): string {
  // 코드 블록 패턴 제거: ```json...``` 또는 ```...```
  let cleaned = response.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
  
  // 앞뒤 공백 및 줄바꿈 제거
  cleaned = cleaned.trim()
  
  // JSON 시작과 끝 찾기
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1)
  }
  
  return cleaned
}

// 대화 메시지 관리를 위한 간단한 Thread 시뮬레이션
const threads = new Map<string, OpenAI.Chat.Completions.ChatCompletionMessageParam[]>()

export async function createThread(): Promise<string> {
  const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  threads.set(threadId, [])
  return threadId
}

export async function addMessageToThread(threadId: string, content: string): Promise<void> {
  const messages = threads.get(threadId) || []
  messages.push({ role: 'user', content })
  threads.set(threadId, messages)
}

export async function addAssistantMessage(threadId: string, content: string): Promise<void> {
  const messages = threads.get(threadId) || []
  messages.push({ role: 'assistant', content })
  threads.set(threadId, messages)
}

export async function getThreadMessages(threadId: string): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]> {
  return threads.get(threadId) || []
}

export async function createCompletion(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const openai = getOpenAIClient() // 실제 사용 시점에 인스턴스 생성
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      })
    }
    
    messages.push({
      role: 'user',
      content: prompt,
    })

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    return result
  } catch (error) {
    console.error('Error creating completion:', error)
    throw new Error('Failed to create completion')
  }
}

// 간단한 Chat Completion을 위한 함수 (Thread 없이)
export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  try {
    const openai = getOpenAIClient() // 실제 사용 시점에 인스턴스 생성
    
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    return result
  } catch (error) {
    console.error('Error creating chat completion:', error)
    throw new Error('Failed to create chat completion')
  }
} 