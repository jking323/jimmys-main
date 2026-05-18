// Hours math. All wall-clock times are in the lounge's local timezone.
// The DB stores 'HH:MM' strings; if close_at < open_at, the window crosses midnight.

export const LOUNGE_TZ = 'America/New_York';

const DOW_ABBR = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function dayName(dow) { return DOW_NAMES[dow]; }

function timeToMin(hhmm) {
  if (!hhmm) return null;
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
}

function pad2(n) { return String(n).padStart(2, '0'); }

// Format 'HH:MM' (24h) as e.g. '9 PM' or '11:30 AM' for display.
export function formatTime12(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${pad2(m)} ${ampm}` : `${h12} ${ampm}`;
}

// Get the lounge's current local date parts (dow, hour, minute, iso date).
export function loungeNow(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: LOUNGE_TZ,
    weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const hour = parseInt(parts.hour, 10) % 24;
  return {
    dow: DOW_ABBR[parts.weekday] ?? 0,
    hour,
    minute: parseInt(parts.minute, 10),
    iso_date: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

// Given an array of business_hours rows + optional overrides, decide if the
// lounge is open right now and when it next opens/closes.
export function evaluateHours(rows, overrides = [], now = new Date()) {
  const local = loungeNow(now);
  const byDow = new Map();
  for (const r of rows || []) byDow.set(r.day_of_week, r);

  const todayOverride = (overrides || []).find((o) => o.date === local.iso_date);
  const yesterdayDow = (local.dow + 6) % 7;
  const yesterdayDate = isoDateOffset(local.iso_date, -1);
  const yesterdayOverride = (overrides || []).find((o) => o.date === yesterdayDate);

  const todayHours = todayOverride || byDow.get(local.dow) || null;
  const yesterdayHours = yesterdayOverride || byDow.get(yesterdayDow) || null;

  const nowMin = local.hour * 60 + local.minute;

  // Today's window.
  if (todayHours && !todayHours.closed && todayHours.open_at && todayHours.close_at) {
    const o = timeToMin(todayHours.open_at);
    const c = timeToMin(todayHours.close_at);
    if (c > o) {
      if (nowMin >= o && nowMin < c) {
        return { is_open: true, closes_at: todayHours.close_at, closes_tomorrow: false, today_dow: local.dow };
      }
    } else {
      // Wraps midnight — after open this evening, closes tomorrow.
      if (nowMin >= o) {
        return { is_open: true, closes_at: todayHours.close_at, closes_tomorrow: true, today_dow: local.dow };
      }
    }
  }

  // Yesterday's wrap-around (e.g. it's 12:30 AM, the Fri 10 PM – 1 AM window still applies).
  if (yesterdayHours && !yesterdayHours.closed && yesterdayHours.open_at && yesterdayHours.close_at) {
    const o = timeToMin(yesterdayHours.open_at);
    const c = timeToMin(yesterdayHours.close_at);
    if (c < o && nowMin < c) {
      return { is_open: true, closes_at: yesterdayHours.close_at, closes_tomorrow: false, today_dow: local.dow };
    }
  }

  return { is_open: false, closes_at: null, closes_tomorrow: false, today_dow: local.dow };
}

function isoDateOffset(iso, deltaDays) {
  // iso = 'YYYY-MM-DD'; do simple Date math via UTC to avoid TZ skew.
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function validateHHMM(s) {
  if (s == null || s === '') return null;
  if (!/^\d{1,2}:\d{2}$/.test(String(s).trim())) return false;
  const [h, m] = s.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return false;
  return `${pad2(h)}:${pad2(m)}`;
}
