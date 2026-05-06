import { NextRequest, NextResponse } from 'next/server'

export function validateAgentKey(request: NextRequest): NextResponse | null {
  const auth = request.headers.get('authorization')
  const agentKey = process.env.AGENT_API_KEY

  if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== agentKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export function getAgentId(request: NextRequest): string {
  return request.headers.get('x-agent-id') ?? 'unknown'
}
