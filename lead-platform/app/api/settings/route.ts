import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export interface SearchSettings {
  industries: string[]
  weakness_criteria: string[]
  max_score: number
}

export const DEFAULT_SETTINGS: SearchSettings = {
  industries: [
    'רפואת שיניים', 'פיזיותרפיה', 'מוסך רכב', 'ספא ועיסוי', 'קוסמטיקאית',
    'שיעורי נגינה', 'גן ילדים פרטי', 'מאפייה', 'משרד עורכי דין', 'מכבסה',
    'חנות ספרים', 'בית קפה', 'אופטיקאי', 'ראיית חשבון', 'מספרה לגברים',
  ],
  weakness_criteria: [
    'אין WhatsApp עסקי',
    'אין הזמנות אונליין',
    'אתר ישן (לפני 2020)',
    'אין ביקורות גוגל',
    'אין נוכחות בסושיאל מדיה',
    'אין גלריה תמונות',
    'אין צ\'אט באתר',
  ],
  max_score: 5,
}

export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_log')
    .select('payload')
    .eq('agent_name', 'system')
    .eq('action', 'search_settings')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const settings: SearchSettings = (data?.payload as SearchSettings) ?? DEFAULT_SETTINGS
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json() as Partial<SearchSettings>
  const supabase = getSupabaseAdmin()

  // Read current, merge, and save
  const { data: current } = await supabase
    .from('agent_log')
    .select('payload')
    .eq('agent_name', 'system')
    .eq('action', 'search_settings')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const merged: SearchSettings = {
    ...DEFAULT_SETTINGS,
    ...(current?.payload as SearchSettings ?? {}),
    ...body,
  }

  await supabase.from('agent_log').insert({
    agent_name:  'system',
    action:      'search_settings',
    status:      'success',
    company_id:  null,
    payload:     merged,
  })

  return NextResponse.json(merged)
}
