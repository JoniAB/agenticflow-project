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

const BEAUTY_GALLERY = [
  { id: '1604654894610-df63bc536371', label: 'ציפורניים' },
  { id: '1519415943484-9fa1873496d4', label: 'טיפוח' },
  { id: '1560869713-7d0a29430803', label: 'עיצוב' },
]

export function BeautyTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const rose   = brand || '#b76e79'
  const roseGold = '#c9a96e'
  const blush  = '#fdf0f2'
  const deep   = '#2d1219'

  return (
    <div dir="rtl" style={{ fontFamily: "'Jost','Arial',sans-serif", background: '#fff', minHeight: '100vh', color: deep }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .bt { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
        a { text-decoration: none; }
        .gal-item { position: relative; overflow: hidden; }
        .gal-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .7s cubic-bezier(.25,.46,.45,.94); }
        .gal-item:hover img { transform: scale(1.07); }
        @keyframes shimmer { 0%,100% { opacity:.6 } 50% { opacity:1 } }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${roseGold}30`, padding: 0 }}>
        <div className="bt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${rose}, ${roseGold})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 10, letterSpacing: '.08em' }}>YA</div>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontStyle: 'italic', color: deep, letterSpacing: '.06em' }}>יוני אלוני</span>
          </div>
          {reportUrl && <a href={reportUrl} style={{ fontFamily: 'Jost,sans-serif', fontSize: 12, fontWeight: 500, color: rose, letterSpacing: '.1em', textTransform: 'uppercase' }}>דוח ←</a>}
        </div>
      </nav>

      {/* Hero — full-bleed beauty image */}
      <section style={{ position: 'relative', height: '92vh', minHeight: 580, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1600&q=85&auto=format&fit=crop&crop=center"
          alt="nail art"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        {/* Elegant dark-to-blush overlay */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(120deg, rgba(45,18,25,0.90) 0%, rgba(45,18,25,0.65) 50%, rgba(183,110,121,0.30) 100%)` }} />
        {/* Rose-gold bottom bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to left, ${roseGold}, ${rose}, ${roseGold})` }} />

        <div className="bt" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Label */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <span style={{ display: 'inline-block', width: 28, height: '0.5px', background: roseGold }} />
            <span style={{ fontFamily: 'Jost,sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '.32em', textTransform: 'uppercase', color: roseGold }}>ניתוח אישי עבור {companyName}</span>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(36px,6vw,74px)', fontWeight: 400, lineHeight: 1.05, color: '#fff', maxWidth: 660, marginBottom: 28 }}>
            {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
          </h1>

          {/* Rose-gold ornament divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 48, height: '0.5px', background: roseGold }} />
            <span style={{ color: roseGold, fontSize: 10 }}>✦</span>
            <div style={{ width: 48, height: '0.5px', background: roseGold }} />
          </div>

          <p style={{ fontFamily: 'Jost,sans-serif', fontSize: 17, fontWeight: 300, color: 'rgba(255,240,242,0.82)', maxWidth: 460, lineHeight: 1.85, marginBottom: 42, letterSpacing: '.02em' }}>
            {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 30px', background: `linear-gradient(135deg, ${rose}, ${roseGold})`, color: '#fff', fontFamily: 'Jost,sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', boxShadow: `0 6px 24px rgba(183,110,121,0.45)` }}>
              קבע שיחת ייעוץ חינם →
            </a>
            {reportUrl && (
              <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 28px', background: 'transparent', color: '#fff', fontFamily: 'Jost,sans-serif', fontWeight: 500, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', border: `0.5px solid rgba(255,255,255,0.35)` }}>
                הדוח המלא
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Beauty gallery */}
      <section style={{ padding: '72px 0', background: blush }}>
        <div className="bt">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48 }}>
            <div style={{ height: '0.5px', flex: 1, background: `${roseGold}40` }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Jost,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', color: roseGold, marginBottom: 6 }}>האסתטיקה שלנו</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 28, color: deep }}>סגנונות שאנחנו בונים</h2>
            </div>
            <div style={{ height: '0.5px', flex: 1, background: `${roseGold}40` }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 3, height: 340 }}>
            {BEAUTY_GALLERY.map((img, i) => (
              <div key={i} className="gal-item" style={{ background: '#e8d0d5' }}>
                <img
                  src={`https://images.unsplash.com/photo-${img.id}?w=700&q=82&auto=format&fit=crop`}
                  alt={img.label}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(45,18,25,0.72) 0%, transparent 55%)' }} />
                <span style={{ position: 'absolute', bottom: 18, right: 20, fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 17, color: '#fff', letterSpacing: '.04em' }}>{img.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '68px 0', background: '#fff' }}>
          <div className="bt">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48 }}>
              <div style={{ height: '0.5px', flex: 1, background: `#c0392b25` }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Jost,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', color: '#c0392b', marginBottom: 6 }}>מה חסר כרגע</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 28, color: deep }}>האתגרים שמעכבים אותך</h2>
              </div>
              <div style={{ height: '0.5px', flex: 1, background: `#c0392b25` }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 20 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: blush, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to left, #e05050, #c0392b)' }} />
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 44, color: `${roseGold}22`, display: 'block', marginBottom: 14, lineHeight: 1 }}>0{i + 1}</span>
                  <h3 style={{ fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600, color: deep, marginBottom: 10, letterSpacing: '.02em' }}>{p.title}</h3>
                  <p style={{ fontFamily: 'Jost,sans-serif', fontSize: 13, color: '#7a4050', lineHeight: 1.8, fontWeight: 300 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions — dark luxe background */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '68px 0', background: deep }}>
          <div className="bt">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48 }}>
              <div style={{ height: '0.5px', flex: 1, background: `${roseGold}25` }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Jost,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', color: roseGold, marginBottom: 6 }}>הפתרון שלנו</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 28, color: '#fff' }}>מה נעשה עבורך</h2>
              </div>
              <div style={{ height: '0.5px', flex: 1, background: `${roseGold}25` }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 1, background: `${roseGold}18` }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ background: '#3d1a22', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to left, ${roseGold}, transparent)` }} />
                  <div style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${roseGold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roseGold, fontSize: 13, fontWeight: 600, marginBottom: 18 }}>✓</div>
                  <h3 style={{ fontFamily: 'Jost,sans-serif', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10, letterSpacing: '.02em' }}>{s.title}</h3>
                  <p style={{ fontFamily: 'Jost,sans-serif', fontSize: 13, color: 'rgba(255,240,242,0.55)', lineHeight: 1.8, fontWeight: 300 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result promise — rose-gold gradient band */}
      {page?.result_promise && (
        <section style={{ padding: '42px 0', background: `linear-gradient(135deg, ${rose} 0%, ${roseGold} 100%)`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="bt" style={{ textAlign: 'center', position: 'relative' }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 24, color: '#fff', lineHeight: 1.5, letterSpacing: '.03em' }}>
              ✦ {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '76px 0', background: blush, textAlign: 'center' }}>
        <div className="bt">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 30 }}>
            <div style={{ width: 44, height: '0.5px', background: roseGold }} />
            <span style={{ color: roseGold, fontSize: 10 }}>✦</span>
            <div style={{ width: 44, height: '0.5px', background: roseGold }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 36, color: deep, marginBottom: 14 }}>
            {contactName ? `${contactName}, בואי נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontFamily: 'Jost,sans-serif', fontSize: 15, color: '#7a4050', marginBottom: 38, fontWeight: 300, lineHeight: 1.85, maxWidth: 400, margin: '0 auto 38px' }}>
            שיחה של 10 דקות — ללא התחייבות.
          </p>
          <a href="https://calendly.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 34px', background: deep, color: roseGold, fontFamily: 'Jost,sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase' }}>
            קבע שיחה עכשיו →
          </a>
          <p style={{ marginTop: 26, fontFamily: 'Jost,sans-serif', fontSize: 11, color: '#c0a0a8', letterSpacing: '.08em' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
