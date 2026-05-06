import { BoardId, LeadStatus } from './types'

export const BOARD_HEBREW: Record<BoardId, string> = {
  'B-01': 'בריכת מועמדים',
  'B-02': 'לידים מועשרים',
  'B-03': 'כישורים',
  'B-04': 'תור פנייה',
  'B-05': 'פנייה פעילה',
  'B-06': 'מעקב',
  'B-07': 'הגיב',
  'B-08': 'ארכיון',
}

export const STATUS_HEBREW: Record<LeadStatus, string> = {
  new:                'חדש',
  in_progress:        'בתהליך',
  ready:              'מוכן',
  pending_review:     'ממתין לסקירה',
  qualified:          'מוסמך',
  rejected:           'נדחה',
  needs_human_review: 'נדרשת סקירה אנושית',
  queued:             'בתור',
  contacted:          'נוצר קשר',
  no_response:        'אין תגובה',
  send_failed:        'שליחה נכשלה',
  following_up:       'במעקב',
  exhausted:          'מוצה',
  responded:          'הגיב',
  archived:           'בארכיון',
}

export const COLUMN_HEBREW: Record<string, string> = {
  Status:         'סטטוס',
  Company:        'חברה',
  Industry:       'תעשייה',
  Contact:        'איש קשר',
  Agent:          'סוכן',
  'Last Activity':'פעילות אחרונה',
  'Days in Stage':'ימים בשלב',
  'ICP Score':    'ציון התאמה',
  Channel:        'ערוץ',
}

export const NAV_HEBREW: Record<string, string> = {
  Dashboard:       'לוח בקרה',
  'Prospect Pool': 'בריכת מועמדים',
  'Enriched Leads':'לידים מועשרים',
  Qualification:   'כישורים',
  'Outreach Queue':'תור פנייה',
  'Active Outreach':'פנייה פעילה',
  'Follow-up':     'מעקב',
  Responded:       'הגיב',
  Archive:         'ארכיון',
  'Agent Activity':'פעילות סוכנים',
  'API Docs':      'תיעוד API',
}
