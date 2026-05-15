import { useEffect, useState } from 'react';
import { Monogram } from './primitives.jsx';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      padding: scrolled ? '14px 0' : '22px 0',
      transition: 'padding 0.25s ease, background-color 0.25s ease, border-color 0.25s ease',
      background: scrolled ? 'color-mix(in oklab, var(--bg) 88%, transparent)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px) saturate(120%)' : 'none',
      borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
    }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'var(--ink)' }}>
          <Monogram size={38} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span className="serif" style={{ fontSize: 24, letterSpacing: '-0.01em' }}>Jimmy's</span>
            <span className="eyebrow" style={{ fontSize: 9.5, marginTop: 3 }}>Cigar Lounge · est 2014</span>
          </div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }} className="nav-links">
          {[
            ['Humidor', '#humidor'],
            ['Events', '#events'],
            ['Find me one', '#pairing'],
            ['Visit', '#visit'],
          ].map(([t, h]) => (
            <a key={h} href={h} style={{ color: 'var(--ink-mute)', textDecoration: 'none', fontSize: 15, fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-mute)')}>{t}</a>
          ))}
        </div>
        <a href="#visit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
          Stop by tonight
          <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
        </a>
      </div>
      <style>{`
        @media (max-width: 880px) {
          .nav-links { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
