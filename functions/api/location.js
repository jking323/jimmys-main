// Public — returns the map config for the homepage. Stadia API keys are
// HTTP-Referer-locked at Stadia's end, so it's safe to send to the browser.

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare(
    `SELECT lat, lng, zoom, label, map_style, stadia_api_key
     FROM business_location WHERE id = 1`,
  ).first();

  if (!row) {
    return new Response(JSON.stringify({ location: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      location: {
        lat: row.lat,
        lng: row.lng,
        zoom: row.zoom,
        label: row.label,
        map_style: row.map_style,
        stadia_api_key: row.stadia_api_key || null,
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        // Map config is small + slow-moving.
        'Cache-Control': 'public, max-age=60, s-maxage=600',
      },
    },
  );
}
