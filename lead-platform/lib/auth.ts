import { NextResponse } from 'next/server'

export function validateAgentKey(request: Request): NextResponse | null {
  const key = request.headers.get('X-Agent-Key')
  if (!key || key !== process.env.AGENT_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
