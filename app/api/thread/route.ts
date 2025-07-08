import { NextRequest, NextResponse } from 'next/server'
import { createThread } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const threadId = await createThread()
    
    return NextResponse.json({ threadId })
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Thread API endpoint' })
} 