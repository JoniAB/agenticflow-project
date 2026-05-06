interface PageContent {
  tagline: string
  hero_description: string
  pain_points: { title: string; description: string }[]
  solutions: { title: string; description: string }[]
  result_promise: string
}

interface Props {
  companyName: string
  contactName: string | null
  reportUrl: string | null
  brand: string
  page: PageContent | null
}

export function AutoTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const blue   = brand || '#1a56db'
  const light  = '#f0f5ff'

  return (
    <div dir="rtl" style={{ fontFamily: "'Inter','Arial',sans-serif", background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .at { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        a { text-decoration: none; }
        .grotesk { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: 0 }}>
        <div className="at" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: '.04em' }}>YA</div>
            <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '-.01em' }}>יוני אלוני</span>
          </div>
          {reportUrl && (
            <a href={reportUrl} style={{ fontSize: 13, fontWeight: 600, color: blue }}>צפה בדוח ←</a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #fff 0%, ${light} 100%)`, padding: '64px 0 56px', borderBottom: `1px solid #e2e8f0` }}>
        <div className="at">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${blue}12`, border: `1px solid ${blue}30`, color: blue, padding: '4px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, background: blue, borderRadius: '50%', display: 'inline-block' }} />
            ניתוח דיגיטלי · {companyName}
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 'clamp(26px,4.5vw,48px)', fontWeight: 700, lineHeight: 1.1, color: '#0f172a', maxWidth: 640, marginBottom: 18, letterSpacing: '-.02em' }}>
            {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
          </h1>
          <div style={{ width: 48, height: 3, background: blue, borderRadius: 2, marginBottom: 24 }} />
          <p style={{ fontSize: 17, lineHeight: 1.8, color: '#475569', maxWidth: 520, marginBottom: 32, fontWeight: 400 }}>
            {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 6, background: blue, color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '.04em', boxShadow: `0 4px 14px ${blue}35` }}>
              קבע שיחת ייעוץ חינם →
            </a>
            {reportUrl && (
              <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 6, background: '#fff', color: '#334155', fontWeight: 600, fontSize: 14, border: '1px solid #cbd5e1' }}>
                הדוח המלא
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '56px 0', background: '#fff' }}>
          <div className="at">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: '#ef4444', marginBottom: 8 }}>מה זיהינו</p>
            <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 8, letterSpacing: '-.01em' }}>האתגרים שמעכבים אותך</h2>
            <div style={{ width: 48, height: 3, background: '#ef4444', borderRadius: 2, marginBottom: 32 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '22px 20px', borderRight: `3px solid #ef4444` }}>
                  <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 28, fontWeight: 700, color: '#ef444420', display: 'block', marginBottom: 12, lineHeight: 1 }}>0{i + 1}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 7 }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '56px 0', background: light }}>
          <div className="at">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: blue, marginBottom: 8 }}>הפתרון שלנו</p>
            <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 8, letterSpacing: '-.01em' }}>מה נעשה עבורך</h2>
            <div style={{ width: 48, height: 3, background: blue, borderRadius: 2, marginBottom: 32 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ background: '#fff', border: `1px solid ${blue}20`, borderRadius: 8, padding: '22px 20px', borderTop: `3px solid ${blue}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 14 }}>✓</div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 7 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result promise */}
      {page?.result_promise && (
        <section style={{ padding: '36px 0', background: blue }}>
          <div className="at" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
              🔧 {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '60px 0', background: '#fff', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
        <div className="at">
          <h2 style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 12, letterSpacing: '-.02em' }}>
            {contactName ? `${contactName}, בוא נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 32, lineHeight: 1.7 }}>
            שיחה של 10 דקות — ללא התחייבות. ניתוח כנה של מה שאפשר לשפר.
          </p>
          <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 6, background: blue, color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: `0 4px 16px ${blue}40` }}>
            קבע שיחה עכשיו →
          </a>
          <p style={{ marginTop: 20, fontSize: 12, color: '#94a3b8' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
