// Live launch schedule for the Space Coast.
//
// Pulls upcoming launches from The Space Devs' Launch Library 2 (free,
// no key, ~15 req/hour rate limit). The outbound call is cached at
// Cloudflare's edge for 30 min via the `cf` fetch options, so we stay
// well under quota even under traffic spikes.
//
// Filtered to Cape Canaveral SFS (location 12) + Kennedy Space Center
// (location 27) — everything visible from the lounge patio.

// pad__location__ids filters to Cape Canaveral SFS (12) + Kennedy Space
// Center (27). We also do a defensive client-side filter below in case
// the upstream filter behavior changes.
const LL2_URL =
  'https://ll.thespacedevs.com/2.2.0/launch/upcoming/' +
  '?pad__location__ids=12,27&limit=12&mode=normal';

const VISIBLE_LOCATION_RE = /Cape Canaveral|Kennedy Space Center|Florida/i;

const OUTBOUND_CACHE_SECONDS = 1800; // 30 min — keeps us at ~2 req/hour
const RESPONSE_CACHE_SECONDS = 300;  // 5 min — browsers/edge can revalidate

export async function onRequestGet() {
  let upstream;
  try {
    upstream = await fetch(LL2_URL, {
      headers: { Accept: 'application/json', 'User-Agent': 'jimmys-cigar-lounge/1.0' },
      cf: { cacheTtl: OUTBOUND_CACHE_SECONDS, cacheEverything: true },
    });
  } catch {
    return emptyResponse('upstream_unreachable');
  }
  if (!upstream.ok) return emptyResponse(`upstream_${upstream.status}`);

  let payload;
  try { payload = await upstream.json(); } catch { return emptyResponse('upstream_parse_error'); }

  const launches = (payload.results || [])
    .filter((l) => l && l.net && VISIBLE_LOCATION_RE.test(l.pad?.location?.name || ''))
    .slice(0, 4)
    .map(normalizeLaunch);

  return new Response(JSON.stringify({ launches }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${RESPONSE_CACHE_SECONDS}, s-maxage=${RESPONSE_CACHE_SECONDS}`,
    },
  });
}

function emptyResponse(reason) {
  return new Response(JSON.stringify({ launches: [], error: reason }), {
    headers: {
      'Content-Type': 'application/json',
      // Short cache on errors so we recover quickly when LL2 comes back.
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  });
}

function normalizeLaunch(l) {
  const iso = l.net;
  const rocketName = l.rocket?.configuration?.name || 'Rocket';
  const missionName = l.mission?.name || stripVehiclePrefix(l.name, rocketName);
  const padName = l.pad?.name || '';
  const statusAbbrev = l.status?.abbrev || '';
  return {
    id: l.id,
    net: iso,
    date: formatDate(iso),
    time: formatTime(iso),
    vehicle: shortVehicleName(rocketName),
    mission: missionName,
    pad: abbreviatePad(padName),
    visible: visibleNarrative(iso),
    status: statusAbbrev === 'Go' ? 'go' : 'tentative',
  };
}

// "Falcon 9 Block 5 | Starlink Group 8-12" → "Starlink Group 8-12"
function stripVehiclePrefix(name, vehicle) {
  if (!name) return '';
  const idx = name.indexOf('|');
  if (idx >= 0) return name.slice(idx + 1).trim();
  return name.replace(new RegExp(`^${escapeRe(vehicle)}\\s*-?\\s*`, 'i'), '').trim() || name;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function shortVehicleName(name) {
  if (/Falcon Heavy/i.test(name)) return 'Falcon Heavy';
  if (/Falcon 9/i.test(name)) return 'Falcon 9';
  if (/Vulcan/i.test(name)) return 'Vulcan Centaur';
  if (/Atlas V/i.test(name)) return 'Atlas V';
  if (/Delta IV Heavy/i.test(name)) return 'Delta IV Heavy';
  if (/Delta IV/i.test(name)) return 'Delta IV';
  if (/New Glenn/i.test(name)) return 'New Glenn';
  if (/New Shepard/i.test(name)) return 'New Shepard';
  if (/Starship/i.test(name)) return 'Starship';
  if (/Electron/i.test(name)) return 'Electron';
  if (/Antares/i.test(name)) return 'Antares';
  if (/Neutron/i.test(name)) return 'Neutron';
  return name.replace(/\s+Block\s+\d+/i, '').trim();
}

function abbreviatePad(name) {
  if (!name) return '';
  let m = name.match(/Space Launch Complex\s+(\d+[A-Z]?)/i);
  if (m) return `SLC-${m[1]}`;
  m = name.match(/Launch Complex\s+(\d+[A-Z]?)/i);
  if (m) return `LC-${m[1]}`;
  m = name.match(/Launch Pad\s+(\d+[A-Z]?)/i);
  if (m) return `LC-${m[1]}`;
  return name;
}

// Narrative about how the launch will look from the patio, based on
// local Eastern time. Intl handles EST↔EDT automatically.
function visibleNarrative(iso) {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false,
    }).format(new Date(iso)),
  );
  if (hour >= 0 && hour < 4) return 'Spectacular against the dark';
  if (hour >= 4 && hour < 6) return 'Pre-dawn streak in the east';
  if (hour >= 6 && hour < 8) return 'Sunrise launch — gorgeous';
  if (hour >= 8 && hour < 17) return 'Daytime — contrails only';
  if (hour >= 17 && hour < 20) return 'Sunset launch — gorgeous';
  if (hour >= 20 && hour < 22) return 'Bright in the eastern sky';
  return 'Brilliant against the night';
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: '2-digit',
  }).format(new Date(iso)).toUpperCase();
}

function formatTime(iso) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}
