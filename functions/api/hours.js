import { evaluateHours } from '../_shared/hours.js';
import { json } from '../_shared/response.js';

export async function onRequestGet({ env }) {
  const hours = await env.DB.prepare(
    `SELECT day_of_week, open_at, close_at, closed FROM business_hours ORDER BY day_of_week`,
  ).all();

  // Only forward-looking overrides matter for the public site.
  const overrides = await env.DB.prepare(
    `SELECT date, open_at, close_at, closed, note FROM hours_overrides
      WHERE date >= date('now', '-1 day')
      ORDER BY date ASC LIMIT 30`,
  ).all();

  const status = evaluateHours(hours.results || [], overrides.results || []);
  return json({
    hours: hours.results || [],
    overrides: overrides.results || [],
    status,
  });
}
