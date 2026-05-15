const BASE = '/api';

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (isJson && data && data.error) || res.statusText || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};

// Convenience wrappers
export const publicApi = {
  events: () => api.get('/events'),
  event: (id) => api.get(`/events/${id}`),
  rsvp: (id, data) => api.post(`/events/${id}/rsvp`, data),
  cotmCurrent: () => api.get('/cotm/current'),
  humidor: () => api.get('/humidor'),
  newsletterSubscribe: (email) => api.post('/newsletter/subscribe', { email }),
};

export const adminApi = {
  me: () => api.get('/auth/me'),
  setupStatus: () => api.get('/auth/setup'),
  setup: (data) => api.post('/auth/setup', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),

  events: () => api.get('/admin/events'),
  event: (id) => api.get(`/admin/events/${id}`),
  createEvent: (data) => api.post('/admin/events', data),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => api.del(`/admin/events/${id}`),
  rsvps: (id) => api.get(`/admin/events/${id}/rsvps`),

  cotmList: () => api.get('/admin/cotm'),
  cotmCurrent: () => api.get('/admin/cotm/current'),
  upsertCotm: (data) => api.post('/admin/cotm', data),
  setCurrentCotm: (id) => api.post(`/admin/cotm/${id}/set-current`),
  deleteCotm: (id) => api.del(`/admin/cotm/${id}`),

  subscribers: () => api.get('/admin/newsletter/subscribers'),
  removeSubscriber: (id) => api.del(`/admin/newsletter/subscribers/${id}`),
  exportSubscribers: () => api.get('/admin/newsletter/subscribers?format=csv'),

  cigars: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/cigars${qs ? '?' + qs : ''}`);
  },
  cigar: (id) => api.get(`/admin/cigars/${id}`),
  updateCigar: (id, data) => api.put(`/admin/cigars/${id}`, data),
  imports: () => api.get('/admin/inventory/imports'),
};
