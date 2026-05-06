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

export function HairSalonTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const gold = brand || '#c9a84c'

  return (
    <div dir="rtl" style={{ fontFamily: "'Raleway','Arial',sans-serif", background: '#faf6ec', minHeight: '100vh', color: '#1a0a2e' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,500&family=Raleway:wght@300;400;600;700&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .hs { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        .gold-line { width: 52px; height: 1px; background: ${gold}; margin-bottom: 2rem; }
        .gold-line-c { width: 52px; height: 1px; background: ${gold}; margin: 0 auto 2rem; }
        a { text-decoration: none; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: '#faf6ec', borderBottom: `1px solid ${gold}30`, padding: '0' }}>
        <div className="hs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#1a0a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontWeight: 800, fontSize: 12, fontFamily: 'Raleway' }}>YA</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: '#1a0a2e', letterSpacing: '.03em' }}>יוני אלוני</span>
          </div>
          {reportUrl && (
            <a href={reportUrl} style={{ fontSize: 13, fontWeight: 600, color: gold, letterSpacing: '.06em' }}>צפה בדוח ←</a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #faf6ec 0%, #f5e9d0 100%)', padding: '72px 0 64px', borderBottom: `1px solid ${gold}20`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, left: -40, fontSize: '18rem', opacity: .04, userSelect: 'none', lineHeight: 1 }}>✦</div>
        <div className="hs">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: gold, marginBottom: 14 }}>ניתוח אישי עבור {companyName}</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,5vw,52px)', lineHeight: 1.15, color: '#1a0a2e', maxWidth: 640, marginBottom: 20 }}>
            {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
          </h1>
          <div className="gold-line" />
          <p style={{ fontSize: 17, lineHeight: 1.8, color: '#3d2a0a', maxWidth: 520, marginBottom: 32, fontWeight: 300 }}>
            {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 40, background: '#1a0a2e', color: gold, fontWeight: 700, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              קבע שיחת ייעוץ חינם →
            </a>
            {reportUrl && (
              <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 40, background: 'transparent', color: '#1a0a2e', fontWeight: 600, fontSize: 13, border: '1px solid #1a0a2e30' }}>
                הדוח המלא
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '60px 0', background: '#faf6ec' }}>
          <div className="hs">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: '#c0392b', marginBottom: 8 }}>מה זיהינו</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: '#1a0a2e', marginBottom: 24 }}>האתגרים שמעכבים אותך</h2>
            <div className="gold-line" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 20 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: '#fff', border: `0.5px solid ${gold}30`, borderRadius: 4, padding: '24px 22px', position: 'relative', borderTop: `2px solid ${gold}` }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, color: `${gold}40`, position: 'absolute', top: 12, left: 16, lineHeight: 1 }}>0{i + 1}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a0a2e', marginBottom: 8, marginTop: 16 }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: '#5a4a2a', lineHeight: 1.7, fontWeight: 300 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '60px 0', background: '#1a0a2e' }}>
          <div className="hs">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>הפתרון שלנו</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: '#f5e6c8', marginBottom: 24 }}>מה נעשה עבורך</h2>
            <div style={{ width: 52, height: 1, background: '#f5e6c830', marginBottom: '2rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 20 }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ border: `0.5px solid ${gold}30`, borderRadius: 4, padding: '24px 22px', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a0a2e', fontSize: 13, fontWeight: 800, marginBottom: 14 }}>✓</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f5e6c8', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(245,230,200,0.65)', lineHeight: 1.7, fontWeight: 300 }}>{s.description}</p>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(to left, ${gold}, transparent)` }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result promise */}
      {page?.result_promise && (
        <section style={{ padding: '40px 0', background: gold }}>
          <div className="hs" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 22, color: '#1a0a2e', lineHeight: 1.5 }}>
              ✦ {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '64px 0', background: '#faf6ec', textAlign: 'center' }}>
        <div className="hs">
          <div className="gold-line-c" />
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, color: '#1a0a2e', marginBottom: 12 }}>
            {contactName ? `${contactName}, בוא נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontSize: 15, color: '#5a4a2a', marginBottom: 32, fontWeight: 300, lineHeight: 1.7 }}>
            שיחה של 10 דקות — ללא התחייבות. ניתוח כנה של מה שאפשר לשפר.
          </p>
          <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 40, background: '#1a0a2e', color: gold, fontWeight: 700, fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            קבע שיחה עכשיו →
          </a>
          <p style={{ marginTop: 20, fontSize: 12, color: '#9a8a6a' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
