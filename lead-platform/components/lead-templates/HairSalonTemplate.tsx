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

const STYLE_GALLERY = [
  { id: '1522337360788-8b13dee7a37e', label: 'עיצוב' },
  { id: '1492106087820-71f1a00d2b11', label: 'תספורת' },
  { id: '1620331311520-246422fd82f9', label: 'צביעה' },
]

export function HairSalonTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const gold  = brand || '#b08d50'
  const dark  = '#1a1208'
  const cream = '#fdf8f0'

  return (
    <div dir="rtl" style={{ fontFamily: "'Raleway','Arial',sans-serif", background: cream, minHeight: '100vh', color: dark }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,600&family=Raleway:wght@300;400;500;600;700&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .hs { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
        a { text-decoration: none; }
        .gal-wrap { position: relative; overflow: hidden; }
        .gal-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s ease; }
        .gal-wrap:hover img { transform: scale(1.06); }
      `}</style>

      {/* Nav */}
      <nav style={{ background: dark, padding: 0, position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="hs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, border: `1px solid ${gold}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontWeight: 700, fontSize: 11, fontFamily: 'Playfair Display,serif' }}>YA</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: cream, letterSpacing: '.04em' }}>יוני אלוני</span>
          </div>
          {reportUrl && <a href={reportUrl} style={{ fontFamily: 'Raleway,sans-serif', fontSize: 12, fontWeight: 600, color: gold, letterSpacing: '.1em', textTransform: 'uppercase' }}>דוח ←</a>}
        </div>
      </nav>

      {/* Hero — full-bleed salon image */}
      <section style={{ position: 'relative', height: '90vh', minHeight: 560, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1600&q=85&auto=format&fit=crop&crop=center"
          alt="hair salon"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(110deg, rgba(26,18,8,0.92) 0%, rgba(26,18,8,0.65) 55%, rgba(26,18,8,0.3) 100%)` }} />

        <div className="hs" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '.35em', textTransform: 'uppercase', color: gold, marginBottom: 20 }}>
            ניתוח אישי עבור {companyName}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(34px,6vw,72px)', fontStyle: 'italic', lineHeight: 1.05, color: cream, maxWidth: 680, marginBottom: 24 }}>
            {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
          </h1>
          {/* Gold divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ flex: '0 0 60px', height: 1, background: gold }} />
            <span style={{ color: gold, fontSize: 12 }}>✦</span>
            <div style={{ flex: '0 0 60px', height: 1, background: gold }} />
          </div>
          <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: 17, color: 'rgba(253,248,240,0.75)', maxWidth: 480, marginBottom: 40, lineHeight: 1.8, fontWeight: 300 }}>
            {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="https://calendly.com/yoniautomation/30min" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 30px', borderRadius: 2, background: gold, color: dark, fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              קבע שיחת ייעוץ חינם →
            </a>
            {reportUrl && (
              <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 30px', borderRadius: 2, background: 'transparent', color: cream, fontFamily: 'Raleway,sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', border: `0.5px solid ${gold}60` }}>
                הדוח המלא
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Style gallery */}
      <section style={{ padding: '72px 0', background: cream }}>
        <div className="hs">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48 }}>
            <div style={{ height: '0.5px', flex: 1, background: `${gold}40` }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: gold, marginBottom: 6 }}>הגלריה שלנו</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 26, color: dark }}>סגנונות שאנחנו בונים</h2>
            </div>
            <div style={{ height: '0.5px', flex: 1, background: `${gold}40` }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, height: 320 }}>
            {STYLE_GALLERY.map((img, i) => (
              <div key={i} className="gal-wrap" style={{ background: '#2a1a0a' }}>
                <img
                  src={`https://images.unsplash.com/photo-${img.id}?w=600&q=80&auto=format&fit=crop`}
                  alt={img.label}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,8,0.7) 0%, transparent 50%)' }} />
                <span style={{ position: 'absolute', bottom: 16, right: 18, fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 16, color: cream }}>{img.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '64px 0', background: '#fff' }}>
          <div className="hs">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48 }}>
              <div style={{ height: '0.5px', flex: 1, background: `#c0392b40` }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: '#c0392b', marginBottom: 6 }}>מה מפסידים</p>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 26, color: dark }}>האתגרים שמעכבים אותך</h2>
              </div>
              <div style={{ height: '0.5px', flex: 1, background: `#c0392b40` }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 24 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: cream, border: `0.5px solid ${gold}30`, padding: '28px 24px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#c0392b' }} />
                  <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 40, color: `${gold}25`, display: 'block', marginBottom: 16, lineHeight: 1 }}>0{i + 1}</span>
                  <h3 style={{ fontFamily: 'Raleway,sans-serif', fontSize: 15, fontWeight: 700, color: dark, marginBottom: 10, letterSpacing: '.03em' }}>{p.title}</h3>
                  <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: 14, color: '#5a4a2a', lineHeight: 1.75, fontWeight: 300 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '64px 0', background: dark }}>
          <div className="hs">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48 }}>
              <div style={{ height: '0.5px', flex: 1, background: `${gold}30` }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: gold, marginBottom: 6 }}>הפתרון שלנו</p>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 26, color: cream }}>מה נעשה עבורך</h2>
              </div>
              <div style={{ height: '0.5px', flex: 1, background: `${gold}30` }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 2, background: `${gold}15` }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ background: '#221808', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to left, ${gold}, transparent)` }} />
                  <div style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontSize: 14, fontWeight: 700, marginBottom: 18 }}>✓</div>
                  <h3 style={{ fontFamily: 'Raleway,sans-serif', fontSize: 15, fontWeight: 700, color: cream, marginBottom: 10, letterSpacing: '.02em' }}>{s.title}</h3>
                  <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: 14, color: 'rgba(253,248,240,0.6)', lineHeight: 1.75, fontWeight: 300 }}>{s.description}</p>
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
            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 24, color: dark, lineHeight: 1.5 }}>
              ✦ {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '72px 0', background: cream, textAlign: 'center' }}>
        <div className="hs">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ width: 50, height: '0.5px', background: gold }} />
            <span style={{ color: gold }}>✦</span>
            <div style={{ width: 50, height: '0.5px', background: gold }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: 32, color: dark, marginBottom: 14 }}>
            {contactName ? `${contactName}, בוא נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: 15, color: '#5a4a2a', marginBottom: 36, fontWeight: 300, lineHeight: 1.8 }}>
            שיחה של 10 דקות — ללא התחייבות.
          </p>
          <a href="https://calendly.com/yoniautomation/30min" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 34px', borderRadius: 2, background: dark, color: gold, fontFamily: 'Raleway,sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '.15em', textTransform: 'uppercase' }}>
            קבע שיחה עכשיו →
          </a>
          <p style={{ marginTop: 24, fontFamily: 'Raleway,sans-serif', fontSize: 12, color: '#9a8a6a', letterSpacing: '.06em' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
