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

export function BeautyTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const rose  = brand || '#9b1152'
  const pink  = '#e8a0bf'

  return (
    <div dir="rtl" style={{ fontFamily: "'Montserrat','Arial',sans-serif", background: '#fdf5f8', minHeight: '100vh', color: '#3d0030' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400;1,600&family=Montserrat:wght@300;400;600;700&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .bt { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        a { text-decoration: none; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: '#fdf5f8', borderBottom: `1px solid ${pink}50`, padding: 0 }}>
        <div className="bt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: rose, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>YA</div>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontStyle: 'italic', color: rose, letterSpacing: '.04em' }}>יוני אלוני</span>
          </div>
          {reportUrl && (
            <a href={reportUrl} style={{ fontSize: 13, fontWeight: 600, color: rose, letterSpacing: '.05em' }}>צפה בדוח ←</a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #fdf5f8 0%, #f9e4ee 50%, #f5d0e4 100%)', padding: '68px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, left: -30, fontSize: '16rem', opacity: .04, userSelect: 'none', lineHeight: 1 }}>💎</div>
        <div className="bt">
          <span style={{ display: 'inline-block', border: `1px solid ${pink}`, color: rose, padding: '4px 14px', borderRadius: 20, fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 20 }}>
            ניתוח אישי עבור {companyName}
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(28px,5.5vw,54px)', lineHeight: 1.1, color: '#3d0030', maxWidth: 620, marginBottom: 20 }}>
            {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
          </h1>
          <div style={{ width: 52, height: 1, background: rose, marginBottom: 24 }} />
          <p style={{ fontSize: 16, lineHeight: 1.85, color: '#7d3060', maxWidth: 500, marginBottom: 32, fontWeight: 300, letterSpacing: '.02em' }}>
            {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 40, background: rose, color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '.08em' }}>
              קבע שיחת ייעוץ חינם →
            </a>
            {reportUrl && (
              <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 40, background: 'transparent', color: rose, fontWeight: 600, fontSize: 13, border: `1px solid ${pink}` }}>
                הדוח המלא
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '56px 0', background: '#fff' }}>
          <div className="bt">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: '#c0392b', marginBottom: 8 }}>מה זיהינו</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 30, color: '#3d0030', marginBottom: 32 }}>האתגרים שמעכבים אותך</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: '#fdf5f8', borderRadius: 12, padding: '22px 20px', borderTop: `3px solid ${pink}` }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, color: `${pink}60`, lineHeight: 1, marginBottom: 12 }}>0{i + 1}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#3d0030', marginBottom: 7, letterSpacing: '.02em' }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: '#7d3060', lineHeight: 1.7, fontWeight: 300 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '56px 0', background: '#fdf5f8' }}>
          <div className="bt">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: rose, marginBottom: 8 }}>הפתרון שלנו</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 30, color: '#3d0030', marginBottom: 32 }}>מה נעשה עבורך</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '22px 20px', border: `1px solid ${pink}40`, borderBottom: `3px solid ${rose}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: rose, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, marginBottom: 14 }}>✓</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#3d0030', marginBottom: 7, letterSpacing: '.02em' }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#7d3060', lineHeight: 1.7, fontWeight: 300 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result promise */}
      {page?.result_promise && (
        <section style={{ padding: '36px 0', background: `linear-gradient(135deg, ${rose}, #7b0040)` }}>
          <div className="bt" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 24, color: '#fff', lineHeight: 1.5 }}>
              ✦ {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '64px 0', background: '#fff', textAlign: 'center' }}>
        <div className="bt">
          <div style={{ width: 52, height: 1, background: pink, margin: '0 auto 28px' }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 32, color: '#3d0030', marginBottom: 14 }}>
            {contactName ? `${contactName}, בואי נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontSize: 15, color: '#7d3060', marginBottom: 32, fontWeight: 300, lineHeight: 1.8, maxWidth: 420, margin: '0 auto 32px' }}>
            שיחה של 10 דקות — ללא התחייבות. ניתוח כנה של מה שאפשר לשפר.
          </p>
          <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px', borderRadius: 40, background: rose, color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '.08em' }}>
            קבע שיחה עכשיו →
          </a>
          <p style={{ marginTop: 20, fontSize: 12, color: '#c0a0b0' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
