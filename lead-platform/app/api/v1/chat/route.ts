import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAgent } from '@/lib/agents'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { agentId, messages } = body as {
    agentId: string
    messages: { role: 'user' | 'assistant'; content: string }[]
  }

  const agent = getAgent(agentId)
  if (!agent) {
    return new Response(JSON.stringify({ error: 'Unknown agent' }), { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: agent.system,
          messages,
        })

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(encoder.encode(`\n\n[שגיאה: ${msg}]`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
