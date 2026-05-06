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

export function VetClinicTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const forest = brand || '#0a3d2e'
  const green  = '#2ecc71'

  return (
    <div dir="rtl" style={{ fontFamily: "'Nunito','Arial',sans-serif", background: '#fff', minHeight: '100vh', color: '#1a2e28' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Nunito:wght@300;400;600;700&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .vc { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        a { text-decoration: none; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: #fff; padding: 7px 14px; border-radius: 30px; font-size: 13px; font-weight: 700; color: ${forest}; box-shadow: 0 2px 10px rgba(10,61,46,0.1); }
      `}</style>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0f5ea', padding: 0 }}>
        <div className="vc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 50, background: forest, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, fontFamily: 'Poppins' }}>YA</div>
            <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: forest }}>יוני אלוני | AI לעסקים</span>
          </div>
          {reportUrl && (
            <a href={reportUrl} style={{ fontSize: 13, fontWeight: 700, color: forest }}>צפה בדוח ←</a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #f0faf4 0%, #e0f5ea 100%)', padding: '64px 0 56px' }}>
        <div className="vc" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-block', background: `${forest}18`, color: forest, padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 18 }}>
              ניתוח אישי עבור {companyName}
            </span>
            <h1 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(24px,4vw,44px)', lineHeight: 1.2, fontWeight: 700, color: forest, maxWidth: 560, marginBottom: 16 }}>
              {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#4a7c6a', maxWidth: 480, marginBottom: 28, fontWeight: 400 }}>
              {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 40, background: forest, color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins,sans-serif' }}>
                קבע שיחת ייעוץ חינם →
              </a>
              {reportUrl && (
                <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 40, background: '#fff', color: forest, fontWeight: 700, fontSize: 14, border: `2px solid ${forest}` }}>
                  הדוח המלא
                </a>
              )}
            </div>
          </div>
          <div style={{ fontSize: '8rem', lineHeight: 1, opacity: .85 }}>🐾</div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '56px 0', background: '#fff' }}>
          <div className="vc">
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#e74c3c', marginBottom: 6, display: 'block' }}>מה זיהינו</span>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 26, fontWeight: 700, color: forest, marginBottom: 32 }}>האתגרים שמעכבים אותך</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: '#fff', border: '1.5px solid #e0f5ea', borderRadius: 14, padding: '20px', borderRight: '4px solid #e74c3c', transition: 'transform .2s' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 50, background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e74c3c', fontWeight: 800, fontSize: 14, marginBottom: 12, fontFamily: 'Poppins,sans-serif' }}>{i + 1}</div>
                  <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 600, color: '#1a2e28', marginBottom: 6 }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: '#4a7c6a', lineHeight: 1.65 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '56px 0', background: '#f0faf4' }}>
          <div className="vc">
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: forest, marginBottom: 6, display: 'block' }}>הפתרון שלנו</span>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 26, fontWeight: 700, color: forest, marginBottom: 32 }}>מה נעשה עבורך</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ background: '#fff', border: '1.5px solid #b8e6cc', borderRadius: 14, padding: '20px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 50, background: forest, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, marginBottom: 12 }}>✓</div>
                  <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 600, color: forest, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#4a7c6a', lineHeight: 1.65 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result promise */}
      {page?.result_promise && (
        <section style={{ padding: '36px 0', background: forest }}>
          <div className="vc" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
              🎯 {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '60px 0', background: '#fff', textAlign: 'center' }}>
        <div className="vc">
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 28, fontWeight: 700, color: forest, marginBottom: 12 }}>
            {contactName ? `${contactName}, בוא נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontSize: 15, color: '#4a7c6a', marginBottom: 32, lineHeight: 1.7 }}>
            שיחה של 10 דקות — ללא התחייבות, ללא מכירות. ניתוח כנה של מה שאפשר לשפר.
          </p>
          <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 40, background: forest, color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'Poppins,sans-serif' }}>
            קבע שיחה עכשיו →
          </a>
          <p style={{ marginTop: 20, fontSize: 12, color: '#a0b8b0' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
