'use client'

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

const SERVICES = ['אבחון ממוחשב', 'פחחות וצבע', 'מנוע ותיבה', 'מערכת בלמים', 'מיזוג אוויר', 'טיפול שוטף']

export function AutoTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const orange = brand || '#e05c00'
  const dark   = '#111214'

  return (
    <div dir="rtl" style={{ fontFamily: "'Barlow Condensed','Arial',sans-serif", background: dark, minHeight: '100vh', color: '#f0f0f0' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Barlow:wght@300;400;500&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .at { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
        a { text-decoration: none; }
        .srv-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); border: 0.5px solid rgba(255,255,255,0.12); padding: 7px 14px; font-size: 13px; color: #bbb; letter-spacing: .04em; }
        .srv-tag::before { content: '⬡'; color: ${orange}; font-size: 10px; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: `rgba(17,18,20,0.97)`, backdropFilter: 'blur(10px)', borderBottom: `2px solid ${orange}`, padding: 0 }}>
        <div className="at" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.04em' }}>YA</div>
            <span style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 16, fontWeight: 700, color: '#f0f0f0', letterSpacing: '.1em', textTransform: 'uppercase' }}>יוני אלוני</span>
          </div>
          {reportUrl && <a href={reportUrl} style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 13, fontWeight: 700, color: orange, letterSpacing: '.15em', textTransform: 'uppercase' }}>דוח ←</a>}
        </div>
      </nav>

      {/* Hero — car image full-bleed */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 580, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=85&auto=format&fit=crop&crop=center"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        {/* Heavy dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(100deg, rgba(17,18,20,0.95) 0%, rgba(17,18,20,0.75) 55%, rgba(17,18,20,0.45) 100%)` }} />
        {/* Orange accent bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: orange }} />

        <div className="at" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 60 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 10, height: 10, background: orange, transform: 'rotate(45deg)' }} />
            <span style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 13, fontWeight: 600, color: orange, letterSpacing: '.2em', textTransform: 'uppercase' }}>
              ניתוח דיגיטלי — {companyName}
            </span>
          </div>
          <h1 style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 'clamp(40px,7vw,88px)', fontWeight: 800, lineHeight: 0.95, color: '#fff', maxWidth: 720, marginBottom: 24, letterSpacing: '-.01em', textTransform: 'uppercase' }}>
            {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
          </h1>
          <p style={{ fontFamily: 'Barlow,sans-serif', fontSize: 17, color: 'rgba(240,240,240,0.7)', maxWidth: 500, marginBottom: 36, lineHeight: 1.7, fontWeight: 300 }}>
            {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: orange, color: '#fff', fontFamily: 'Barlow Condensed,sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '.15em', textTransform: 'uppercase', boxShadow: `0 6px 24px ${orange}50` }}>
              קבע שיחת ייעוץ חינם ←
            </a>
            {reportUrl && (
              <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: 'transparent', color: '#f0f0f0', fontFamily: 'Barlow Condensed,sans-serif', fontWeight: 600, fontSize: 16, letterSpacing: '.12em', textTransform: 'uppercase', border: '1px solid rgba(240,240,240,0.25)' }}>
                הדוח המלא
              </a>
            )}
          </div>
        </div>

        {/* Mechanic image — side panel */}
        <div style={{ position: 'absolute', bottom: 4, left: 0, width: '38%', height: '55%', zIndex: 1, overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80&auto=format&fit=crop&crop=top"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.35, filter: 'grayscale(30%)' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(17,18,20,0.95), rgba(17,18,20,0) 70%), linear-gradient(to top, rgba(17,18,20,0.9), transparent 40%)' }} />
        </div>
      </section>

      {/* Services strip */}
      <section style={{ padding: '28px 0', background: '#1a1b1e', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div className="at">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SERVICES.map((s) => (
              <div key={s} className="srv-tag">{s}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '72px 0', background: dark }}>
          <div className="at">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
              <div style={{ width: 4, height: 36, background: '#ef4444' }} />
              <div>
                <p style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: '#ef4444', marginBottom: 4 }}>בעיות שזיהינו</p>
                <h2 style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 30, fontWeight: 800, color: '#f0f0f0', letterSpacing: '.03em', textTransform: 'uppercase' }}>מה עוצר אותך</h2>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 2, background: 'rgba(255,255,255,0.05)' }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: '#161718', padding: '28px 24px', borderBottom: `3px solid #ef4444` }}>
                  <div style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 52, fontWeight: 800, color: 'rgba(239,68,68,0.12)', lineHeight: 1, marginBottom: 16 }}>0{i + 1}</div>
                  <h3 style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 18, fontWeight: 700, color: '#f0f0f0', marginBottom: 10, letterSpacing: '.04em', textTransform: 'uppercase' }}>{p.title}</h3>
                  <p style={{ fontFamily: 'Barlow,sans-serif', fontSize: 14, color: 'rgba(240,240,240,0.55)', lineHeight: 1.7, fontWeight: 300 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '72px 0', background: '#1a1b1e' }}>
          <div className="at">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
              <div style={{ width: 4, height: 36, background: orange }} />
              <div>
                <p style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: orange, marginBottom: 4 }}>הפתרון שלנו</p>
                <h2 style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 30, fontWeight: 800, color: '#f0f0f0', letterSpacing: '.03em', textTransform: 'uppercase' }}>מה נעשה עבורך</h2>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 2, background: 'rgba(255,255,255,0.05)' }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ background: '#161718', padding: '28px 24px', borderTop: `3px solid ${orange}` }}>
                  <div style={{ width: 32, height: 32, background: orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, marginBottom: 16 }}>✓</div>
                  <h3 style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 18, fontWeight: 700, color: '#f0f0f0', marginBottom: 10, letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.title}</h3>
                  <p style={{ fontFamily: 'Barlow,sans-serif', fontSize: 14, color: 'rgba(240,240,240,0.55)', lineHeight: 1.7, fontWeight: 300 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result promise */}
      {page?.result_promise && (
        <section style={{ padding: '0', background: orange, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(0,0,0,0.06) 14px, rgba(0,0,0,0.06) 28px)' }} />
          <div className="at" style={{ padding: '36px 28px', position: 'relative' }}>
            <p style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              🔧 {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '72px 0', background: dark, textAlign: 'center', borderTop: `2px solid ${orange}` }}>
        <div className="at">
          <h2 style={{ fontFamily: 'Barlow Condensed,sans-serif', fontSize: 36, fontWeight: 800, color: '#f0f0f0', marginBottom: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            {contactName ? `${contactName}, בוא נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontFamily: 'Barlow,sans-serif', fontSize: 16, color: 'rgba(240,240,240,0.5)', marginBottom: 36, fontWeight: 300 }}>
            שיחה של 10 דקות — ללא התחייבות.
          </p>
          <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 36px', background: orange, color: '#fff', fontFamily: 'Barlow Condensed,sans-serif', fontWeight: 700, fontSize: 18, letterSpacing: '.12em', textTransform: 'uppercase', boxShadow: `0 8px 28px ${orange}50` }}>
            קבע שיחה עכשיו ←
          </a>
          <p style={{ marginTop: 24, fontFamily: 'Barlow Condensed,sans-serif', fontSize: 12, color: 'rgba(240,240,240,0.25)', letterSpacing: '.12em' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
