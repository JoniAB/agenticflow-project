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

const PET_GALLERY = [
  { id: '1587300003388-59208cc962cb', label: 'כלבים' },
  { id: '1514888286974-6c03e2ca1dba', label: 'חתולים' },
  { id: '1548199973-03cce0bbc87b', label: 'טיפול' },
]

export function VetClinicTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const green = brand || '#166534'
  const mint  = '#f0fdf4'

  return (
    <div dir="rtl" style={{ fontFamily: "'Nunito','Arial',sans-serif", background: '#fff', minHeight: '100vh', color: '#14532d' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=Poppins:ital,wght@0,600;0,700;1,400&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .vc { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
        a { text-decoration: none; }
        .pet-card { position: relative; border-radius: 16px; overflow: hidden; }
        .pet-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
        .pet-card:hover img { transform: scale(1.05); }
      `}</style>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: `2px solid ${green}`, padding: 0, position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="vc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>🐾</span>
            <div>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 700, color: green, lineHeight: 1.1 }}>יוני אלוני</p>
              <p style={{ fontSize: 10, color: '#6b7280', letterSpacing: '.06em' }}>AI לרפואה וטרינרית</p>
            </div>
          </div>
          {reportUrl && <a href={reportUrl} style={{ fontSize: 13, fontWeight: 700, color: green }}>צפה בדוח ←</a>}
        </div>
      </nav>

      {/* Hero — split layout */}
      <section style={{ background: mint, overflow: 'hidden' }}>
        <div className="vc" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, minHeight: 560, alignItems: 'center' }}>
          {/* Text side */}
          <div style={{ padding: '72px 40px 72px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${green}15`, border: `1px solid ${green}30`, color: green, padding: '6px 16px', borderRadius: 30, fontSize: 12, fontWeight: 700, marginBottom: 24, letterSpacing: '.06em' }}>
              🐾 ניתוח אישי עבור {companyName}
            </div>
            <h1 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 'clamp(28px,3.8vw,46px)', fontWeight: 700, lineHeight: 1.15, color: '#052e16', maxWidth: 480, marginBottom: 20 }}>
              {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
            </h1>
            <div style={{ width: 48, height: 4, background: green, borderRadius: 2, marginBottom: 22 }} />
            <p style={{ fontFamily: 'Nunito,sans-serif', fontSize: 16, color: '#166534', lineHeight: 1.85, maxWidth: 420, marginBottom: 36, fontWeight: 400 }}>
              {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 50, background: green, color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: `0 4px 16px ${green}35` }}>
                קבע שיחת ייעוץ חינם →
              </a>
              {reportUrl && (
                <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 50, background: '#fff', color: green, fontWeight: 700, fontSize: 14, border: `1.5px solid ${green}` }}>
                  הדוח המלא
                </a>
              )}
            </div>
          </div>
          {/* Image side */}
          <div style={{ position: 'relative', height: '100%', minHeight: 520 }}>
            <img
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=85&auto=format&fit=crop&crop=top"
              alt="vet with dog"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement
                el.style.display = 'none'
                if (el.parentElement) el.parentElement.style.background = mint
              }}
            />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 50, background: mint, clipPath: 'polygon(0 0, 100% 0, 0 100%)', zIndex: 1 }} />
            <div style={{ position: 'absolute', bottom: 32, right: 28, zIndex: 2, background: '#fff', borderRadius: 16, padding: '12px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>🐾</span>
              <div>
                <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: green, lineHeight: 1.1 }}>4.9 ★</p>
                <p style={{ fontSize: 11, color: '#6b7280' }}>200+ לקוחות מרוצים</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pet gallery */}
      <section style={{ padding: '64px 0', background: '#fff' }}>
        <div className="vc">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: green, marginBottom: 8 }}>הלקוחות שלנו</p>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 26, fontWeight: 700, color: '#052e16' }}>החיות שאנחנו אוהבים</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, height: 240 }}>
            {PET_GALLERY.map((img, i) => (
              <div key={i} className="pet-card" style={{ background: mint }}>
                <img
                  src={`https://images.unsplash.com/photo-${img.id}?w=600&q=80&auto=format&fit=crop`}
                  alt={img.label}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(5,46,22,0.75), transparent)', padding: '24px 16px 12px' }}>
                  <span style={{ fontFamily: 'Nunito,sans-serif', fontWeight: 700, color: '#fff', fontSize: 14 }}>{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '64px 0', background: mint }}>
          <div className="vc">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#ef4444', marginBottom: 8 }}>מה חסר כרגע</p>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 26, fontWeight: 700, color: '#052e16' }}>האתגרים שמעכבים אותך</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 4, background: '#ef4444', borderRadius: '20px 20px 0 0' }} />
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 16 }}>
                    {(['❌', '⚠️', '📭'] as const)[i]}
                  </div>
                  <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 600, color: '#052e16', marginBottom: 8 }}>{p.title}</h3>
                  <p style={{ fontFamily: 'Nunito,sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '64px 0', background: '#fff' }}>
          <div className="vc">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: green, marginBottom: 8 }}>הפתרון שלנו</p>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 26, fontWeight: 700, color: '#052e16' }}>מה נעשה עבורך</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ background: mint, borderRadius: 20, padding: '28px 24px', border: `1.5px solid ${green}20` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 16 }}>
                    {(['✅', '🚀', '⭐'] as const)[i]}
                  </div>
                  <h3 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 600, color: '#052e16', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontFamily: 'Nunito,sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result */}
      {page?.result_promise && (
        <section style={{ padding: '40px 0', background: green }}>
          <div className="vc" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
              🐾 {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '64px 0', background: mint, textAlign: 'center' }}>
        <div className="vc">
          <span style={{ fontSize: 48 }}>🐕</span>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: 28, fontWeight: 700, color: '#052e16', marginBottom: 12, marginTop: 16 }}>
            {contactName ? `${contactName}, בוא נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontFamily: 'Nunito,sans-serif', fontSize: 16, color: '#166534', marginBottom: 36, lineHeight: 1.7 }}>
            שיחה של 10 דקות — ללא התחייבות.
          </p>
          <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 36px', borderRadius: 50, background: green, color: '#fff', fontWeight: 800, fontSize: 16, boxShadow: `0 6px 20px ${green}45` }}>
            קבע שיחה עכשיו 🐾
          </a>
          <p style={{ marginTop: 24, fontSize: 12, color: '#6b7280' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
