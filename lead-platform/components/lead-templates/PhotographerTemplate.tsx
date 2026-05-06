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

const GALLERY = [
  { id: '1531804294405-29abd0a3b518', label: 'דיוקן' },
  { id: '1519741497674-611481863552', label: 'אירועים' },
  { id: '1492684223066-81342ee5ff30', label: 'סטודיו' },
]

export function PhotographerTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const gold = brand || '#c8a96e'

  return (
    <div dir="rtl" style={{ fontFamily: "'Lato','Arial',sans-serif", background: '#0c0c0c', minHeight: '100vh', color: '#f0e8d8' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;1,400;1,600&family=Lato:wght@300;400;700&display=swap" />
      <style>{`
        * { box-sizing: border-box; }
        .pt { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
        a { text-decoration: none; }
        .pt-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s ease; }
        .pt-img-wrap:hover .pt-img { transform: scale(1.04); }
        .grain::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 2;
        }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(12px)', borderBottom: `0.5px solid ${gold}25`, padding: 0 }}>
        <div className="pt" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 30, height: 30, border: `1px solid ${gold}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: '.15em' }}>YA</div>
            <span style={{ fontFamily: 'Cinzel,serif', fontSize: 13, color: '#f0e8d8', letterSpacing: '.2em', textTransform: 'uppercase' }}>יוני אלוני</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {reportUrl && <a href={reportUrl} style={{ fontFamily: 'Cinzel,serif', fontSize: 11, color: gold, letterSpacing: '.15em', textTransform: 'uppercase' }}>דוח ←</a>}
          </div>
        </div>
      </nav>

      {/* Hero — full-bleed camera image */}
      <section className="grain" style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&q=85&auto=format&fit=crop"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(12,12,12,0.82) 0%, rgba(12,12,12,0.55) 50%, rgba(12,12,12,0.88) 100%)', zIndex: 1 }} />

        {/* Content */}
        <div className="pt" style={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 80 }}>
          <p style={{ fontFamily: 'EB Garamond,serif', fontStyle: 'italic', fontSize: 17, color: gold, marginBottom: 20, letterSpacing: '.08em' }}>
            ניתוח אישי עבור {companyName}
          </p>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(32px,5.5vw,62px)', fontWeight: 700, lineHeight: 1.05, color: '#fff', maxWidth: 680, marginBottom: 24, letterSpacing: '.03em' }}>
            {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
          </h1>
          <div style={{ width: 60, height: 1, background: gold, marginBottom: 28, boxShadow: `0 0 10px ${gold}60` }} />
          <p style={{ fontFamily: 'EB Garamond,serif', fontStyle: 'italic', fontSize: 19, color: 'rgba(240,232,216,0.8)', maxWidth: 520, marginBottom: 44, lineHeight: 1.8 }}>
            {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך.'}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="https://calendly.com/yoniautomation/30min" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 30px', background: gold, color: '#0c0c0c', fontFamily: 'Cinzel,serif', fontWeight: 600, fontSize: 12, letterSpacing: '.15em', textTransform: 'uppercase', boxShadow: `0 6px 20px ${gold}45` }}>
              קבע שיחת ייעוץ חינם
            </a>
            {reportUrl && (
              <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 30px', background: 'transparent', color: '#f0e8d8', fontFamily: 'Cinzel,serif', fontSize: 12, letterSpacing: '.15em', border: '0.5px solid rgba(240,232,216,0.35)', textTransform: 'uppercase' }}>
                צפה בדוח
              </a>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: `${gold}80`, letterSpacing: '.2em', textTransform: 'uppercase' }}>גלול</span>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${gold}60, transparent)` }} />
        </div>
      </section>

      {/* Gallery — portfolio showcase */}
      <section style={{ padding: '80px 0', background: '#111' }}>
        <div className="pt">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 48 }}>
            <p style={{ fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '.25em', textTransform: 'uppercase', color: gold }}>Portfolio</p>
            <div style={{ height: '0.5px', flex: 1, background: `${gold}25` }} />
            <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 22, color: '#f0e8d8', letterSpacing: '.06em' }}>מה אנחנו בונים עבורך</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '280px', gap: 3 }}>
            {GALLERY.map((img, i) => (
              <div key={i} className="pt-img-wrap" style={{ position: 'relative', overflow: 'hidden', background: `#${['1a1a1a','222','1e1e1e'][i]}` }}>
                <img
                  className="pt-img"
                  src={`https://images.unsplash.com/photo-${img.id}?w=800&q=80&auto=format&fit=crop`}
                  alt={img.label}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,12,12,0.7) 0%, transparent 60%)', zIndex: 1 }} />
                <span style={{ position: 'absolute', bottom: 14, right: 16, zIndex: 2, fontFamily: 'Cinzel,serif', fontSize: 11, color: gold, letterSpacing: '.18em', textTransform: 'uppercase' }}>{img.label}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontFamily: 'EB Garamond,serif', fontStyle: 'italic', fontSize: 15, color: 'rgba(240,232,216,0.45)', marginTop: 18 }}>
            דוגמאות לסוג תוכן שאנחנו בונים עבור {companyName}
          </p>
        </div>
      </section>

      {/* Pain points — film strip style */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '72px 0', background: '#0c0c0c', borderTop: `0.5px solid ${gold}15` }}>
          <div className="pt">
            <p style={{ fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: '#ef4444', marginBottom: 12 }}>מה מפסידים</p>
            <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 26, color: '#f0e8d8', marginBottom: 10, letterSpacing: '.04em' }}>האתגרים שמעכבים אותך</h2>
            <div style={{ width: 60, height: '0.5px', background: gold, marginBottom: 48 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 1, background: `${gold}15` }}>
              {page.pain_points.map((p, i) => (
                <div key={i} style={{ background: '#0f0f0f', padding: '32px 28px', position: 'relative' }}>
                  <div style={{ fontFamily: 'Cinzel,serif', fontSize: 42, color: `${gold}18`, lineHeight: 1, marginBottom: 20 }}>0{i + 1}</div>
                  <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: 14, color: '#f0e8d8', marginBottom: 12, letterSpacing: '.06em' }}>{p.title}</h3>
                  <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 16, color: 'rgba(240,232,216,0.55)', lineHeight: 1.75 }}>{p.description}</p>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 2, height: '100%', background: `linear-gradient(to bottom, ${gold}, transparent)` }} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solutions */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '72px 0', background: '#111' }}>
          <div className="pt">
            <p style={{ fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase', color: gold, marginBottom: 12 }}>הפתרון</p>
            <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 26, color: '#f0e8d8', marginBottom: 10, letterSpacing: '.04em' }}>מה נבנה עבורך</h2>
            <div style={{ width: 60, height: '0.5px', background: gold, marginBottom: 48 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {page.solutions.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 32, padding: '28px 0', borderBottom: `0.5px solid ${gold}15`, alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'Cinzel,serif', fontSize: 13, color: gold, letterSpacing: '.15em', minWidth: 60, paddingTop: 3 }}>0{i + 1}</div>
                  <div>
                    <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: 15, color: '#f0e8d8', marginBottom: 10, letterSpacing: '.06em' }}>{s.title}</h3>
                    <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 17, color: 'rgba(240,232,216,0.6)', lineHeight: 1.75 }}>{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Result promise */}
      {page?.result_promise && (
        <section style={{ padding: '48px 0', background: `${gold}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="pt" style={{ textAlign: 'center', position: 'relative' }}>
            <p style={{ fontFamily: 'Cinzel,serif', fontSize: 18, color: '#0c0c0c', fontWeight: 600, letterSpacing: '.06em' }}>
              ✦ {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '80px 0', background: '#0c0c0c', textAlign: 'center', borderTop: `0.5px solid ${gold}20` }}>
        <div className="pt">
          <div style={{ width: 60, height: '0.5px', background: gold, margin: '0 auto 36px' }} />
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 30, color: '#f0e8d8', marginBottom: 16, letterSpacing: '.04em' }}>
            {contactName ? `${contactName}, בוא נדבר` : 'מוכן להתחיל?'}
          </h2>
          <p style={{ fontFamily: 'EB Garamond,serif', fontStyle: 'italic', fontSize: 18, color: 'rgba(240,232,216,0.55)', marginBottom: 40, lineHeight: 1.8 }}>
            שיחה של 10 דקות — ללא התחייבות.
          </p>
          <a href="https://calendly.com/yoniautomation/30min" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '15px 36px', background: gold, color: '#0c0c0c', fontFamily: 'Cinzel,serif', fontWeight: 600, fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', boxShadow: `0 8px 28px ${gold}40` }}>
            קבע שיחה עכשיו
          </a>
          <p style={{ marginTop: 24, fontFamily: 'Cinzel,serif', fontSize: 11, color: `rgba(240,232,216,0.25)`, letterSpacing: '.12em' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
