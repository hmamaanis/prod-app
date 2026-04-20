// Client-side helpers that call our Next.js API routes

const base = '/api';

async function req(path, opts = {}) {
  const res = await fetch(base + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Projects ──────────────────────────────────────────────
export const getProjects    = ()       => req('/projects');
export const getProject     = (id)     => req(`/projects/${id}`);
export const createProject  = (data)   => req('/projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject  = (id, data) => req(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteProject  = (id)     => req(`/projects/${id}`, { method: 'DELETE' });

// ── Cast ─────────────────────────────────────────────────
export const getCast        = (pid)    => req(`/projects/${pid}/cast`);
export const createCast     = (pid, d) => req(`/projects/${pid}/cast`, { method: 'POST', body: JSON.stringify(d) });
export const updateCast     = (pid, id, d) => req(`/projects/${pid}/cast/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteCast     = (pid, id) => req(`/projects/${pid}/cast/${id}`, { method: 'DELETE' });

// ── Crew ─────────────────────────────────────────────────
export const getCrew        = (pid)    => req(`/projects/${pid}/crew`);
export const createCrew     = (pid, d) => req(`/projects/${pid}/crew`, { method: 'POST', body: JSON.stringify(d) });
export const updateCrew     = (pid, id, d) => req(`/projects/${pid}/crew/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteCrew     = (pid, id) => req(`/projects/${pid}/crew/${id}`, { method: 'DELETE' });

// ── Shots ────────────────────────────────────────────────
export const getShots       = (pid)    => req(`/projects/${pid}/shots`);
export const createShot     = (pid, d) => req(`/projects/${pid}/shots`, { method: 'POST', body: JSON.stringify(d) });
export const updateShot     = (pid, id, d) => req(`/projects/${pid}/shots/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteShot     = (pid, id) => req(`/projects/${pid}/shots/${id}`, { method: 'DELETE' });

// ── Lighting ─────────────────────────────────────────────
export const getLighting    = (pid)    => req(`/projects/${pid}/lighting`);
export const createLighting = (pid, d) => req(`/projects/${pid}/lighting`, { method: 'POST', body: JSON.stringify(d) });
export const updateLighting = (pid, id, d) => req(`/projects/${pid}/lighting/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteLighting = (pid, id) => req(`/projects/${pid}/lighting/${id}`, { method: 'DELETE' });

// ── Activity ─────────────────────────────────────────────
export const getActivity    = (pid)    => req(`/projects/${pid}/activity`);
export const logActivity    = (pid, d) => req(`/projects/${pid}/activity`, { method: 'POST', body: JSON.stringify(d) });

// ── AI Insights ───────────────────────────────────────────
export const getInsights    = (pid)    => req(`/projects/${pid}/insights`);
export const dismissInsight = (pid, id) => req(`/projects/${pid}/insights/${id}`, { method: 'PATCH', body: JSON.stringify({ dismissed: true }) });
export const createInsight  = (pid, d) => req(`/projects/${pid}/insights`, { method: 'POST', body: JSON.stringify(d) });

// ── Scenes ────────────────────────────────────────────────
export const getScenes      = (pid)        => req(`/projects/${pid}/scenes`);
export const createScene    = (pid, d)     => req(`/projects/${pid}/scenes`, { method: 'POST', body: JSON.stringify(d) });
export const updateScene    = (pid, id, d) => req(`/projects/${pid}/scenes/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteScene    = (pid, id)    => req(`/projects/${pid}/scenes/${id}`, { method: 'DELETE' });

// ── Schedule ─────────────────────────────────────────────
export const getSchedule    = (pid)        => req(`/projects/${pid}/schedule`);
export const createDay      = (pid, d)     => req(`/projects/${pid}/schedule`, { method: 'POST', body: JSON.stringify(d) });
export const updateDay      = (pid, id, d) => req(`/projects/${pid}/schedule/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteDay      = (pid, id)    => req(`/projects/${pid}/schedule/${id}`, { method: 'DELETE' });

// ── Crew tokens ───────────────────────────────────────────
export const getTokens      = (pid)        => req(`/projects/${pid}/tokens`);
export const createToken    = (pid, d)     => req(`/projects/${pid}/tokens`, { method: 'POST', body: JSON.stringify(d) });
export const updateToken    = (pid, id, d) => req(`/projects/${pid}/tokens/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteToken    = (pid, id)    => req(`/projects/${pid}/tokens/${id}`, { method: 'DELETE' });
export const getCrewView    = (token)      => req(`/crew/${token}`);
