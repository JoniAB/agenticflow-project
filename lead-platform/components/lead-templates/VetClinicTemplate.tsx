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

const PET_GALLERY = [
  { id: '1587300003388-59208cc962cb', label: 'כלבים' },
  { id: '1514888286974-6c03e2ca1dba', label: 'חתולים' },
  { id: '1548199973-03cce0bbc87b', label: 'טיפול' },
]

const ArrowIcon = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ display: 'inline-block', flexShrink: 0 }}>
    <path d="M2.5 11.5L11.5 2.5M11.5 2.5H5.5M11.5 2.5V8.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'block' }}>
    <path d="M2 7.5L5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ display: 'inline-block' }}>
    <path d="M1.5 9.5L9.5 1.5M9.5 1.5H4.5M9.5 1.5V6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PawIcon = ({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'inline-block', flexShrink: 0 }}>
    <circle cx="7.5" cy="6.5" r="2" />
    <circle cx="16.5" cy="6.5" r="2" />
    <circle cx="5" cy="11" r="1.8" />
    <circle cx="19" cy="11" r="1.8" />
    <path d="M12 11c-3.5 0-6 2-6 4.5 0 2.8 2.5 4.5 6 4.5s6-1.7 6-4.5c0-2.5-2.5-4.5-6-4.5z" />
  </svg>
)

export function VetClinicTemplate({ companyName, contactName, reportUrl, brand, page }: Props) {
  const green = brand || '#166534'
  const dark  = '#0B1120'

  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo','Arial',sans-serif", background: '#F8FAFC', minHeight: '100vh', color: '#0F172A' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Heebo:wght@300;400;500;600;700;800&display=swap" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .vc { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
        a { text-decoration: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .a0  { animation: fadeIn  .4s ease both; }
        .a1  { animation: fadeUp  .6s ease .06s both; }
        .a2  { animation: fadeUp  .6s ease .14s both; }
        .a3  { animation: fadeUp  .6s ease .22s both; }
        .a4  { animation: fadeUp  .6s ease .30s both; }
        .a5  { animation: fadeUp  .6s ease .38s both; }
        .pc0 { animation: fadeUp  .5s ease .04s both; }
        .pc1 { animation: fadeUp  .5s ease .12s both; }
        .pc2 { animation: fadeUp  .5s ease .20s both; }
        .sc0 { animation: fadeUp  .5s ease .04s both; }
        .sc1 { animation: fadeUp  .5s ease .12s both; }
        .sc2 { animation: fadeUp  .5s ease .20s both; }
        .pain-card:hover { transform: translateY(-2px); transition: transform .2s ease; }
        .sol-card:hover  { transform: translateY(-2px); transition: transform .2s ease; }
        .cta-btn:hover   { opacity: .9; transform: translateY(-1px); transition: all .15s ease; }
        .pet-img-wrap { position: relative; overflow: hidden; border-radius: 14px; }
        .pet-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
        .pet-img-wrap:hover img { transform: scale(1.05); }
      `}</style>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 16px rgba(0,0,0,0.05)' }}>
        <div className="vc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: green, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${green}50` }}>
              <PawIcon size={16} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-.01em' }}>יוני אלוני</p>
              <p style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '.04em', lineHeight: 1 }}>AI לרפואה וטרינרית</p>
            </div>
          </div>
          {reportUrl && (
            <a href={reportUrl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: green }}>
              הדוח המלא <ExternalIcon />
            </a>
          )}
        </div>
      </nav>

      {/* ── Hero — dark text / photo split ─────────────────────────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 600, overflow: 'hidden' }}>

        {/* Text panel (visually right in RTL) */}
        <div style={{ background: dark, padding: '80px 28px 80px 60px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -80, left: '20%', width: 360, height: 360, borderRadius: '50%', background: `${green}18`, filter: 'blur(80px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 460, width: '100%', position: 'relative', zIndex: 1 }}>

            <div className="a0" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${green}1A`, border: `1px solid ${green}38`, color: green, padding: '6px 16px', borderRadius: 30, fontSize: 12, fontWeight: 700, marginBottom: 28, letterSpacing: '.06em' }}>
              <PawIcon size={11} color={green} />
              ניתוח אישי עבור {companyName}
            </div>

            <h1 className="a1" style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 'clamp(28px,3.8vw,52px)', fontWeight: 900, lineHeight: 1.1, color: '#F1F5F9', maxWidth: 460, marginBottom: 20, letterSpacing: '-.02em' }}>
              {page?.tagline ?? `${companyName} — הגיע הזמן לצמוח`}
            </h1>

            <div className="a2" style={{ width: 52, height: 3, background: green, borderRadius: 2, marginBottom: 24 }} />

            <p className="a3" style={{ fontSize: 16, color: 'rgba(241,245,249,0.65)', lineHeight: 1.85, maxWidth: 420, marginBottom: 40 }}>
              {page?.hero_description ?? 'זיהינו הזדמנויות ספציפיות לשיפור הנוכחות הדיגיטלית שלך. הנה מה שמצאנו.'}
            </p>

            <div className="a4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <a href="https://calendly.com/yoniautomation/30min" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: green, color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: `0 4px 22px ${green}50`, cursor: 'pointer' }}>
                קבע שיחת ייעוץ חינם <ArrowIcon color="#fff" size={14} />
              </a>
              {reportUrl && (
                <a href={reportUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 22px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: 'rgba(241,245,249,0.8)', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>
                  הדוח המלא
                </a>
              )}
            </div>

            <div className="a5" style={{ display: 'flex', paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { num: '10', label: 'דקות שיחה ראשונה' },
                { num: '100%', label: 'חינם, ללא התחייבות' },
                { num: 'AI', label: 'ניתוח מבוסס נתונים' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, paddingLeft: i < 2 ? 28 : 0, marginLeft: i < 2 ? 28 : 0, borderLeft: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#F1F5F9', lineHeight: 1, marginBottom: 5, letterSpacing: '-.01em' }}>{s.num}</p>
                  <p style={{ fontSize: 11, color: 'rgba(241,245,249,0.45)', letterSpacing: '.01em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Photo panel (visually left in RTL) */}
        <div style={{ position: 'relative', minHeight: 600 }}>
          <img
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900&q=85&auto=format&fit=crop&crop=top"
            alt="vet with dog"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement
              el.style.display = 'none'
              if (el.parentElement) el.parentElement.style.background = dark
            }}
          />
          {/* Gradient blend into text panel (right edge in physical layout) */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 50%, #0B1120 100%)', pointerEvents: 'none' }} />
          {/* Floating trust card */}
          <div style={{ position: 'absolute', bottom: 32, left: 28, zIndex: 2, background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 24px rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${green}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PawIcon size={20} color={green} />
            </div>
            <div>
              <p style={{ fontFamily: "'Frank Ruhl Libre',serif", fontWeight: 700, fontSize: 14, color: green, lineHeight: 1.2 }}>4.9 / 5.0</p>
              <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.3 }}>200+ לקוחות מרוצים</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pet gallery ──────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="vc">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: green, marginBottom: 10 }}>הלקוחות שלנו</p>
          <h2 style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 28, fontWeight: 700, color: '#0F172A', marginBottom: 10, letterSpacing: '-.02em' }}>החיות שאנחנו מטפלים בהן</h2>
          <div style={{ width: 40, height: 3, background: green, borderRadius: 2, marginBottom: 40 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, height: 260 }}>
            {PET_GALLERY.map((img, i) => (
              <div key={i} className="pet-img-wrap">
                <img
                  src={`https://images.unsplash.com/photo-${img.id}?w=600&q=80&auto=format&fit=crop`}
                  alt={img.label}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(5,46,22,0.78), transparent)', padding: '24px 16px 14px' }}>
                  <span style={{ fontFamily: "'Frank Ruhl Libre',serif", fontWeight: 700, color: '#fff', fontSize: 15 }}>{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain Points ──────────────────────────────────────────────────── */}
      {page?.pain_points && page.pain_points.length > 0 && (
        <section style={{ padding: '80px 0', background: '#F8FAFC' }}>
          <div className="vc">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#EF4444', marginBottom: 10 }}>מה זיהינו</p>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 32, fontWeight: 700, color: '#0F172A', marginBottom: 10, letterSpacing: '-.02em' }}>האתגרים שמעכבים אותך</h2>
            <div style={{ width: 40, height: 3, background: '#EF4444', borderRadius: 2, marginBottom: 52 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(265px,1fr))', gap: 20 }}>
              {page.pain_points.map((p, i) => (
                <div key={i} className={`pain-card pc${i}`} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', borderTop: '3px solid #EF4444', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)', cursor: 'default' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontWeight: 900, fontSize: 16, marginBottom: 18, fontFamily: "'Frank Ruhl Libre',serif" }}>{i + 1}</div>
                  <h3 style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 8, letterSpacing: '-.01em', lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.75 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Solutions ────────────────────────────────────────────────────── */}
      {page?.solutions && page.solutions.length > 0 && (
        <section style={{ padding: '80px 0', background: '#fff' }}>
          <div className="vc">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: green, marginBottom: 10 }}>הפתרון שלנו</p>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 32, fontWeight: 700, color: '#0F172A', marginBottom: 10, letterSpacing: '-.02em' }}>מה נעשה עבורך</h2>
            <div style={{ width: 40, height: 3, background: green, borderRadius: 2, marginBottom: 52 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(265px,1fr))', gap: 20 }}>
              {page.solutions.map((s, i) => (
                <div key={i} className={`sol-card sc${i}`} style={{ background: '#F8FAFC', borderRadius: 16, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${green}16`, cursor: 'default' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: green, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: `0 4px 10px ${green}35` }}>
                    <CheckIcon />
                  </div>
                  <h3 style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 8, letterSpacing: '-.01em', lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.75 }}>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Result promise ───────────────────────────────────────────────── */}
      {page?.result_promise && (
        <section style={{ padding: '52px 0', background: green, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
          <div className="vc" style={{ textAlign: 'center', position: 'relative' }}>
            <p style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.55, maxWidth: 640, margin: '0 auto' }}>
              {page.result_promise}
            </p>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 0', background: '#fff', textAlign: 'center' }}>
        <div className="vc" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${green}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <PawIcon size={24} color={green} />
          </div>
          <h2 style={{ fontFamily: "'Frank Ruhl Libre',serif", fontSize: 36, fontWeight: 900, color: '#0F172A', marginBottom: 14, letterSpacing: '-.02em' }}>
            {contactName ? `${contactName}, בואו נדבר` : 'מוכנים להתחיל?'}
          </h2>
          <p style={{ fontSize: 16, color: '#64748B', marginBottom: 38, lineHeight: 1.75, maxWidth: 400 }}>
            שיחה של 10 דקות — ניתוח כנה של מה שאפשר לשפר. ללא התחייבות.
          </p>
          <a href="https://calendly.com/yoniautomation/30min" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 40px', borderRadius: 14, background: green, color: '#fff', fontWeight: 800, fontSize: 16, boxShadow: `0 6px 28px ${green}45`, cursor: 'pointer' }}>
            קבע שיחה עכשיו <ArrowIcon color="#fff" size={16} />
          </a>
          <p style={{ marginTop: 28, fontSize: 12, color: '#94A3B8' }}>יוני אלוני · aloni.yoni@gmail.com</p>
        </div>
      </section>
    </div>
  )
}
