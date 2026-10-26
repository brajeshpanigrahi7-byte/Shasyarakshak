import React, { useEffect, useRef, useState } from 'react';
import './landing.css';

const APP_URL = '/app';

const TOOLS = [
  {
    id: 'diagnose',
    size: 'wide',
    title: 'Crop diagnosis from a photo',
    body: 'Photograph a paddy, millet or vegetable leaf. Get the disease or pest, how severe it is, and organic and chemical remedies.',
  },
  {
    id: 'voice',
    size: 'tall',
    title: 'Ask out loud',
    body: 'Speak your farming question in Odia or English. The answer comes back as text and as speech.',
  },
  {
    id: 'doctor',
    size: 'base',
    title: 'Farm Doctor',
    body: 'Save your district, crop, sowing date and soil. Get a weekly risk advisory that uses your crop stage and local weather.',
  },
  {
    id: 'calendar',
    size: 'base',
    title: 'Crop calendar',
    body: 'Enter a crop and sowing date. Get a timeline for fertilizer, irrigation, pest watch and harvest.',
  },
  {
    id: 'mandi',
    size: 'wide',
    title: 'Live mandi prices',
    body: 'Daily commodity prices by market, pulled from the government AGMARKNET dataset on data.gov.in.',
  },
  {
    id: 'community',
    size: 'base',
    title: 'District community',
    body: 'Ask your district. KVK officers answer with a verified badge.',
  },
  {
    id: 'profit',
    size: 'base',
    title: 'Profit calculator',
    body: 'Land, yield, price and costs in. Profit and break-even out.',
  },
];

const STEPS = [
  {
    title: 'Take a photo of the leaf',
    body: 'Open the app and use the camera or pick a photo. Get close to the spots and keep the leaf in daylight.',
  },
  {
    title: 'Read the diagnosis',
    body: 'The app names the disease or pest, rates how serious it is, and explains it in plain Odia or English.',
  },
  {
    title: 'Treat it, then track it',
    body: 'Follow the remedy that suits your budget. Every scan is saved on your phone so you can compare next week.',
  },
];

const FACTS = [
  { big: 'Odia + English', small: 'every screen and every answer' },
  { big: 'Paddy, millets, vegetables', small: 'crops covered today' },
  { big: 'Installs like an app', small: 'works from the home screen, app shell loads offline' },
  { big: 'Your KVK, listed', small: 'find the Krishi Vigyan Kendra for your district' },
];

const MARQUEE = [
  'Paddy',
  'Ragi',
  'Brinjal',
  'Tomato',
  'Blast',
  'Brown spot',
  'Leaf folder',
  'Stem borer',
  'Odia',
  'Kharif',
  'Rabi',
  'KVK',
];

const Landing: React.FC = () => {
  const sceneRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Drive the pinned leaf scene: write scroll progress (0..1) into a CSS variable.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sceneRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        el.style.setProperty('--p', p.toFixed(4));
      }
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="sr">
      <header className={`sr-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <a href="#top" className="sr-brand" aria-label="Shasyarakshak home">
          <img src="/icons/icon-192.svg" alt="" width={28} height={28} />
          <span>shasyarakshak</span>
        </a>
        <nav className={`sr-links ${menuOpen ? 'is-open' : ''}`} aria-label="Primary">
          <a href="#scan" onClick={closeMenu}>How it sees</a>
          <a href="#tools" onClick={closeMenu}>Tools</a>
          <a href="#steps" onClick={closeMenu}>Steps</a>
          <a href="#language" onClick={closeMenu}>Odia</a>
          <a className="sr-btn sr-btn--small" href={APP_URL}>Open the app</a>
        </nav>
        <button
          className="sr-burger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>

      <main id="top">
        {/* ---------- Hero ---------- */}
        <section className="sr-hero">
          <h1 className="sr-h1">
            Catch crop disease
            <br />
            while it is still
            <br />
            one leaf.
          </h1>
          <div className="sr-hero-side">
            <p className="sr-lead">
              Shasyarakshak reads a photo of your paddy, millet or vegetable leaf and tells you what is wrong and what to
              spray, in Odia or English.
            </p>
            <div className="sr-cta-row">
              <a className="sr-btn" href={APP_URL}>Diagnose a leaf</a>
              <a className="sr-btn sr-btn--ghost" href="#scan">See how it reads</a>
            </div>
          </div>
        </section>

        {/* ---------- Pinned, scroll-driven leaf scan ---------- */}
        <section className="sr-scene" id="scan" ref={sceneRef} style={{ ['--p' as string]: 0 }}>
          <div className="sr-stage">
            <div className="sr-captions">
              <p className="sr-cap sr-cap--1">
                Point the camera
                <br />
                at one leaf.
              </p>
              <p className="sr-cap sr-cap--2">
                It reads every
                <br />
                spot on it.
              </p>
              <p className="sr-cap sr-cap--3">
                You get the
                <br />
                treatment.
              </p>
            </div>

            <div className="sr-leaf-wrap" aria-hidden="true">
              <svg className="sr-leaf" viewBox="0 0 520 760" role="img">
                <defs>
                  <linearGradient id="leafFill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#6FAF3A" />
                    <stop offset="1" stopColor="#2F7A2B" />
                  </linearGradient>
                  <clipPath id="leafClip">
                    <path d="M260 20 C 470 160, 500 470, 270 740 C 40 480, 40 170, 260 20 Z" />
                  </clipPath>
                </defs>

                <path d="M260 20 C 470 160, 500 470, 270 740 C 40 480, 40 170, 260 20 Z" fill="url(#leafFill)" />

                <g clipPath="url(#leafClip)" className="sr-veins">
                  <path d="M262 30 C 262 250, 266 500, 270 740" />
                  {[110, 190, 270, 350, 430, 510].map((y, i) => (
                    <g key={y}>
                      <path d={`M${263 + i * 0.6} ${y} C ${330} ${y - 30}, ${400} ${y - 30}, ${470} ${y - 70}`} />
                      <path d={`M${263 + i * 0.6} ${y} C ${200} ${y - 30}, ${130} ${y - 30}, ${60} ${y - 70}`} />
                    </g>
                  ))}
                </g>

                <g clipPath="url(#leafClip)">
                  {/* Blast lesions: spindle shaped, grey centre, rust margin */}
                  <g className="sr-lesion sr-lesion--a" transform="rotate(-28 340 250)">
                    <ellipse cx="340" cy="250" rx="46" ry="15" fill="#B8501E" />
                    <ellipse cx="340" cy="250" rx="34" ry="8" fill="#D8D4C2" />
                  </g>
                  <g className="sr-lesion sr-lesion--b" transform="rotate(24 190 380)">
                    <ellipse cx="190" cy="380" rx="40" ry="13" fill="#B8501E" />
                    <ellipse cx="190" cy="380" rx="29" ry="7" fill="#D8D4C2" />
                  </g>
                  <g className="sr-lesion sr-lesion--c" transform="rotate(-18 330 500)">
                    <ellipse cx="330" cy="500" rx="34" ry="11" fill="#B8501E" />
                    <ellipse cx="330" cy="500" rx="24" ry="6" fill="#D8D4C2" />
                  </g>
                </g>

                {/* Circles drawn around each lesion once found */}
                <circle className="sr-ring sr-ring--a" cx="340" cy="250" r="52" />
                <circle className="sr-ring sr-ring--b" cx="190" cy="380" r="48" />
                <circle className="sr-ring sr-ring--c" cx="330" cy="500" r="42" />
              </svg>

              <div className="sr-scanline" />

              <div className="sr-callout">
                <strong>Leaf blast</strong>
                <span>3 lesions · severity moderate</span>
              </div>
            </div>

            <div className="sr-remedy">
              <p className="sr-remedy-title">What to do this week</p>
              <ul>
                <li>
                  <b>Organic</b> Spray neem-based solution in the evening.
                </li>
                <li>
                  <b>Chemical</b> If it spreads, use the fungicide the app names for your stage.
                </li>
                <li className="sr-odia">
                  <b>ଓଡ଼ିଆ</b> ଔଷଧ ସିଞ୍ଚନ ପୂର୍ବରୁ ପାଣି ଅଧିକ ଜମିବାକୁ ଦିଅନି ନାହିଁ।
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Marquee ---------- */}
        <div className="sr-marquee" aria-hidden="true">
          <div className="sr-marquee-track">
            {[...MARQUEE, ...MARQUEE].map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
        </div>

        {/* ---------- Tools ---------- */}
        <section className="sr-section" id="tools">
          <div className="sr-section-head">
            <h2 className="sr-h2">Everything a farm needs, in one app.</h2>
            <p className="sr-sub">
              Diagnosis is the start. The same app helps you plan the season, check prices and ask the people who know
              your district.
            </p>
          </div>

          <div className="sr-bento">
            {TOOLS.map((t) => (
              <article key={t.id} className={`sr-tile sr-tile--${t.size} sr-tile--${t.id}`}>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Steps ---------- */}
        <section className="sr-section sr-steps" id="steps">
          <div className="sr-section-head">
            <h2 className="sr-h2">From leaf to treatment in three steps.</h2>
          </div>
          <ol className="sr-step-list">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="sr-step-n">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Language ---------- */}
        <section className="sr-lang" id="language">
          <p className="sr-lang-big sr-odia" lang="or">
            ଆପଣଙ୍କ ଭାଷାରେ, ଆପଣଙ୍କ ଖେତ ପାଇଁ।
          </p>
          <p className="sr-lang-small">
            Your language, for your field. Every diagnosis, remedy and voice answer is available in Odia and English,
            and you can switch at any time.
          </p>
        </section>

        {/* ---------- Facts ---------- */}
        <section className="sr-facts">
          {FACTS.map((f) => (
            <div key={f.big} className="sr-fact">
              <strong>{f.big}</strong>
              <span>{f.small}</span>
            </div>
          ))}
        </section>

        {/* ---------- CTA ---------- */}
        <section className="sr-final">
          <h2 className="sr-h2 sr-h2--xl">Check your next leaf today.</h2>
          <a className="sr-btn sr-btn--large" href={APP_URL}>Open Shasyarakshak</a>
        </section>
      </main>

      <footer className="sr-footer">
        <div className="sr-footer-row">
          <p>AI advice is a guide. For a serious outbreak, talk to your local KVK or agriculture officer.</p>
          <nav aria-label="Footer">
            <a href={APP_URL}>Open the app</a>
            <a href="#tools">Tools</a>
            <a href="#steps">Steps</a>
          </nav>
        </div>
        <div className="sr-wordmark" aria-hidden="true">
          shasyarakshak
        </div>
      </footer>
    </div>
  );
};

export default Landing;
