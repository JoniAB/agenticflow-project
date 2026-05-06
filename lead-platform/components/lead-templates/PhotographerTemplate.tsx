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

export function PhotographerTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const gold = brand || '#b5860d'
  const warm = '#fdf8f0'

  return (
    <div dir="rtl" style={{ fontFamily: "'Lato','Arial',sans-serif", background: warm, minHeight: '100vh', color: '#1c1410' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,600;1,400;1,600&family=Lato:wght@300;400;700&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .pt { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        a { text-decoration: none; }
        .divider { width: 48px; height: 1px; background: ${gold}; margin-bottom: 2rem; }
        .divider-c { width: 48px; height: 1px; background: ${gold}; margin: 0 auto 2rem; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: warm, borderBottom: `1px solid ${gold}30`, padding: 0 }}>
        <div className="pt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, border: `1.5px solid ${gold}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontWeight: 700, fontSize: 11, letterSpacing: '.12em', fontFamily: 'Lato' }}>YA</div>
            <span style={{ fontFamily: "'Cormorant',serif", fontSize: 18, fontStyle: 'italic', color: '#1c1410', letterSpacing: '.04em' }}>יוני אלוני</span>
          </div>
          {reportUrl && (
            <a href={reportUrl} style={{ fontSize: 12, fontWeight: 700, color: gold, letterSpacing: '.12em', textTransform: 'uppercase' }}>דוח ←</a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: `linear-gradient(160deg, ${warm} 0%, #f5ede0 100%)`, padding: '72px 0 64px', borderBottom: `1px solid ${gold}25` }}>
        <div className="pt">
          <p style={{ fontFamily: "'Cormorant',serif", fontStyle: 'italic', fontSize: 16, color: gold, marginBottom: 18, letterSpacing: '.06em' }}>
            ניתוח אישי עבור {companyName}
          </p>
          <h1 style={{ fontFamily: "'Cormorant',serif", fontSize: 'clamp(30px,5.5vw,56px)', fontWeight: 600, lineHeight: 1.1, color: '#1c1410', maxWidth: 640, marginBottom: 20 }}>
            {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
          </h1>
          <div className="divider" />
          <p style={{ fontSize: 17, lineHeight: 1.85, color: '#5c4a32', maxWidth: 500, marginBottom: 36, fontWeight: 300 }}>
            {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 2, background: '#1c1410', color: gold, fontWeight: 700, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              קבע שיחת ייעוץ חינם →
            </a>
            {reportUrl && (
              <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 2, background: 'transparent', color: '#1c1410', fontWeight: 600, fontSize: 13, border: `1px solid ${gold}60` }}>
                הדוח המלא
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '60px 0', background: '#fff' }}>
          <div className="pt">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: '#c0392b', marginBottom: 8 }}>מה זיהינו</p>
            <h2 style={{ fontFamily: "'Cormorant',serif", fontSize: 30, fontWeight: 600, color: '#1c1410', marginBottom: 16 }}>האתגרים שמעכבים אותך</h2>
            <div className="divider" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: warm, border: `1px solid ${gold}20`, borderRadius: 2, padding: '24px 22px', borderBottom: `2px solid ${gold}60` }}>
                  <span style={{ fontFamily: "'Cormorant',serif", fontSize: 34, fontStyle: 'italic', color: `${gold}30`, display: 'block', marginBottom: 12, lineHeight: 1 }}>0{i + 1}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1c1410', marginBottom: 7, letterSpacing: '.01em' }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: '#7a6450', lineHeight: 1.75, fontWeight: 300 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '60px 0', background: warm }}>
          <div className="pt">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.28em', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>הפתרון שלנו</p>
            <h2 style={{ fontFamily: "'Cormorant',serif", fontSize: 30, fontWeight: 600, color: '#1c1410', marginBottom: 16 }}>מה נעשה עבורך</h2>
            <div className="divider" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ background: '#fff', border: `1px solid ${gold}25`, borderRadius: 2, padding: '24px 22px', borderTop: `2px solid ${gold}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${gold}15`, border: `1px solid ${gold}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>✓</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1c1410', marginBottom: 7 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#7a6450', lineHeight: 1.75, fontWeight: 300 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result promise */}
      {page?.result_promise && (
        <section style={{ padding: '36px 0', background: '#1c1410', borderTop: `1px solid ${gold}30` }}>
          <div className="pt" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'Cormorant',serif", fontStyle: 'italic', fontSize: 24, color: gold, lineHeight: 1.6 }}>
              ✦ {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '64px 0', background: '#fff', textAlign: 'center', borderTop: `1px solid ${gold}25` }}>
        <div className="pt">
          <div className="divider-c" />
          <h2 style={{ fontFamily: "'Cormorant',serif", fontSize: 32, fontWeight: 600, color: '#1c1410', marginBottom: 14 }}>
            {contactName ? `${contactName}, בוא נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontSize: 15, color: '#7a6450', marginBottom: 36, fontWeight: 300, lineHeight: 1.8, maxWidth: 420, margin: '0 auto 36px' }}>
            שיחה של 10 דקות — ללא התחייבות. ניתוח כנה של מה שאפשר לשפר.
          </p>
          <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px', borderRadius: 2, background: '#1c1410', color: gold, fontWeight: 700, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            קבע שיחה עכשיו →
          </a>
          <p style={{ marginTop: 20, fontSize: 12, color: '#b8a090' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
