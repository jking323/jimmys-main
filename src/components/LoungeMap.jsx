import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Stadia hosts both their own styles and the open-source Stamen styles.
// Returns the tile URL template + attribution for a given style id.
function tileSourceFor(style, apiKey) {
  const isStamen = style.startsWith('stamen_');
  const ext = style === 'stamen_watercolor' ? 'jpg' : 'png';
  const base = `https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}{r}.${ext}`;
  const url = apiKey ? `${base}?api_key=${apiKey}` : base;
  const stamenAttr = isStamen
    ? '&copy; <a href="https://stamen.com">Stamen Design</a> '
    : '';
  return {
    url,
    attribution:
      `&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> ${stamenAttr}` +
      '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
  };
}

function brassMarkerIcon(label) {
  // SVG circle with serif italic "J" — matches the site's Monogram component.
  const html = `
    <div style="position:relative; width:44px; height:54px; pointer-events:auto;">
      <div style="
        width:44px; height:44px;
        border-radius:50%;
        background:#1a1410;
        border:2px solid #c9a661;
        box-shadow: 0 4px 14px rgba(0,0,0,0.45);
        display:flex; align-items:center; justify-content:center;
        font-family:'Cormorant Garamond', Georgia, serif;
        font-style:italic; font-weight:500;
        font-size:24px; line-height:1;
        color:#c9a661;
        padding-bottom:2px;
      ">J</div>
      <div style="
        position:absolute; left:50%; bottom:-2px;
        width:0; height:0;
        margin-left:-6px;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid #c9a661;
      "></div>
      ${label ? `<div style="
        position:absolute; left:50%; top:-26px; transform:translateX(-50%);
        white-space:nowrap;
        font-family:'Caveat', cursive;
        color:#c9a661;
        font-size:20px;
        text-shadow: 0 1px 0 #1a1410;
        rotate:-3deg;
      ">${escapeHtml(label)}</div>` : ''}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'lounge-marker',
    iconSize: [44, 54],
    iconAnchor: [22, 52],
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export default function LoungeMap({ location, height = 480, directionsHref }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !location) return;

    const tiles = tileSourceFor(location.map_style || 'stamen_toner_lite', location.stadia_api_key);

    const map = L.map(containerRef.current, {
      center: [location.lat, location.lng],
      zoom: location.zoom || 16,
      scrollWheelZoom: false, // don't hijack page scroll
      zoomControl: true,
      attributionControl: true,
      // Drag is on by default. Touch-friendly out of the box.
    });
    mapRef.current = map;

    L.tileLayer(tiles.url, {
      attribution: tiles.attribution,
      maxZoom: 20,
      minZoom: 3,
    }).addTo(map);

    const marker = L.marker([location.lat, location.lng], {
      icon: brassMarkerIcon(location.label),
      keyboard: false,
    }).addTo(map);

    if (directionsHref) {
      marker.on('click', () => {
        window.open(directionsHref, '_blank', 'noopener,noreferrer');
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Re-init on any meaningful change.
  }, [location?.lat, location?.lng, location?.zoom, location?.label, location?.map_style, location?.stadia_api_key, directionsHref]);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid var(--line)',
        background: 'var(--bg-elev)',
      }}
    />
  );
}
