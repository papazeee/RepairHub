/* ═══════════════════════════════════════════════════════
   RepairHub — Shared Utilities
   api.js: API calls, auth helpers, toast system
═══════════════════════════════════════════════════════ */

const API_BASE = 'http://127.0.0.1:8000/api';

// ── Token helpers ──────────────────────────────────────
export function getToken()  { return localStorage.getItem('rh_token'); }
export function setToken(t) { localStorage.setItem('rh_token', t); }
export function clearToken(){ localStorage.removeItem('rh_token'); localStorage.removeItem('rh_user'); }

export function getUser()   {
  try { return JSON.parse(localStorage.getItem('rh_user')); } catch { return null; }
}
export function setUser(u)  { localStorage.setItem('rh_user', JSON.stringify(u)); }

// ── API fetch wrapper ──────────────────────────────────
export async function api(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

// ── Toast ──────────────────────────────────────────────
function ensureContainer() {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

export function toast(message, type = 'info', duration = 4000) {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const container = ensureContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, duration);
}

export const toastSuccess = m => toast(m, 'success');
export const toastError   = m => toast(m, 'error');
export const toastInfo    = m => toast(m, 'info');

// ── Auth guard ─────────────────────────────────────────
export function requireAuth(redirectTo = 'index.html') {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) {
    window.location.href = redirectTo;
    return false;
  }
  return user;
}

export function requireAdmin(redirectTo = 'index.html') {
  const user = requireAuth(redirectTo);
  if (!user) return false;
  if (!user.is_admin) {
    window.location.href = redirectTo;
    return false;
  }
  return user;
}

// ── Format helpers ─────────────────────────────────────
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function badgeHTML(status) {
  return `<span class="badge badge-${status}">${status.replace('_', ' ')}</span>`;
}

export function deviceIcon(type) {
  const map = { phone: '📱', laptop: '💻', tablet: '📟', desktop: '🖥️', other: '🔧' };
  return map[type] || '🔧';
}
