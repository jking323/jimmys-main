export function Photo({ label, sub, aspect = '4/3', height, width, style = {} }) {
  const dim = height
    ? { height, width: width || '100%' }
    : { aspectRatio: aspect, width: width || '100%' };
  return (
    <div className="photo" style={{ ...dim, ...style }}>
      <div className="photo-label">
        {label}
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
}

export function SectionHead({ eyebrow, title, scribble, lead, right }) {
  return (
    <div className="section-head">
      <div className="lead">
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>}
        <h2 className="h1" style={{ display: 'inline' }}>
          {title}
          {scribble && (
            <>
              {' '}
              <span
                className="hand brass"
                style={{ fontSize: '0.6em', display: 'inline-block', transform: 'rotate(-4deg) translateY(-6px)', marginLeft: 8 }}
              >
                {scribble}
              </span>
            </>
          )}
        </h2>
        {lead && <p style={{ marginTop: 18, color: 'var(--ink-mute)', fontSize: 18, maxWidth: 560 }}>{lead}</p>}
      </div>
      {right && <div style={{ flex: '0 0 auto' }}>{right}</div>}
    </div>
  );
}

export function Squiggle({ width = 140 }) {
  return (
    <svg className="squiggle" width={width} height="14" viewBox="0 0 140 14" fill="none">
      <path d="M2,7 Q14,1 26,7 T50,7 T74,7 T98,7 T122,7 T138,7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Stamp({ children, rot = -4, color = 'var(--brass)' }) {
  return (
    <div
      style={{
        display: 'inline-block',
        transform: `rotate(${rot}deg)`,
        border: `2px solid ${color}`,
        color,
        padding: '5px 12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        borderRadius: 4,
      }}
    >
      {children}
    </div>
  );
}

export function HandArrow({ width = 70, color = 'var(--brass)' }) {
  return (
    <svg width={width} height="18" viewBox="0 0 70 18" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M2,9 Q20,3 35,11 T64,9" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M56,3 L64,9 L56,15" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function CigarIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size * 3} height={size} viewBox="0 0 54 18" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <rect x="3" y="5" width="42" height="8" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="45" y="5" width="6" height="8" rx="1" fill={color} />
      <line x1="13" y1="5" x2="13" y2="13" stroke={color} strokeWidth="1" />
      <path d="M51,6 q3,-2 5,0 q-3,2 -5,0 M51,12 q3,-2 5,0 q-3,2 -5,0" stroke={color} strokeWidth="0.8" opacity="0.5" fill="none" />
    </svg>
  );
}

export function SmokeCurl({ width = 140, height = 80, opacity = 0.4, color = 'var(--brass)' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 140 80" fill="none" style={{ pointerEvents: 'none' }}>
      <path d="M20,78 q-6,-14 6,-22 q14,-8 4,-22 q-8,-12 10,-20" stroke={color} strokeWidth="1.2" opacity={opacity} fill="none" />
      <path d="M55,78 q-4,-18 12,-26 q12,-6 0,-22 q-8,-10 8,-20" stroke={color} strokeWidth="1.2" opacity={opacity * 0.8} fill="none" />
      <path d="M95,78 q-12,-12 4,-24 q12,-8 -4,-28" stroke={color} strokeWidth="1.2" opacity={opacity * 0.7} fill="none" />
    </svg>
  );
}

export function Monogram({ size = 44 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1.5px solid var(--brass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: size * 0.55,
        lineHeight: 1,
        color: 'var(--brass)',
        paddingBottom: size * 0.05,
      }}
    >
      J
    </div>
  );
}
