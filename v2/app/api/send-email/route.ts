import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { google } from 'googleapis'
import type { Lead } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { lead_id } = await req.json()
  if (!lead_id) return Response.json({ error: 'lead_id required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data: lead, error } = await supabase.from('leads').select('*').eq('id', lead_id).single()
  if (error || !lead) return Response.json({ error: 'lead not found' }, { status: 404 })

  const l = lead as Lead

  // Must be awaiting_approval
  if (l.status !== 'awaiting_approval') {
    return Response.json({ error: 'lead is not awaiting approval' }, { status: 400 })
  }

  if (!l.email_draft) {
    return Response.json({ error: 'no email draft' }, { status: 400 })
  }

  try {
    const oauth2 = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    )
    oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })

    const gmail = google.gmail({ version: 'v1', auth: oauth2 })

    // Build email
    const to = l.contact_name
      ? `${l.contact_name} <${l.contact_name}>`
      : `${l.business_name}`

    const subject = l.email_subject ?? `הצעה ל${l.business_name}`
    const body = l.email_draft

    const message = [
      `To: ${to}`,
      `From: יוני אלוני <yoniautomation@gmail.com>`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(body).toString('base64'),
    ].join('\r\n')

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: Buffer.from(message).toString('base64url') },
    })

    await supabase.from('leads').update({ status: 'sent' }).eq('id', lead_id)
    await supabase.from('agent_logs').insert({
      lead_id, agent_name: 'email-sender', action: 'send_email', result: 'success',
    })

    return Response.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    await supabase.from('agent_logs').insert({
      lead_id, agent_name: 'email-sender', action: 'send_email_failed', error: msg,
    })
    return Response.json({ error: msg }, { status: 500 })
  }
}
