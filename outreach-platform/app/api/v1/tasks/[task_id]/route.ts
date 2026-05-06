import { NextRequest, NextResponse } from 'next/server'
import { validateAgentKey } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ task_id: string }> }
) {
  const authError = validateAgentKey(request)
  if (authError) return authError

  const { task_id } = await params
  const body = await request.json()
  const { status, payload } = body

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (payload) updates.payload = payload

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('agent_tasks')
    .update(updates)
    .eq('task_id', task_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  return NextResponse.json(data)
}
