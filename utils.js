// utils.js - shared helpers

export function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

export function formatDateISO(d) {
  // d: Date -> YYYY-MM-DD
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function normalizeText(s) {
  return String(s ?? '').trim();
}

export function confirmAction(message) {
  return window.confirm(message);
}

export function showToast(message, type = 'success') {
  // Simple toast implementation injected into DOM
  const existing = document.getElementById('hrmToast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'hrmToast';
  el.setAttribute('role', 'status');
  el.style.position = 'fixed';
  el.style.right = '16px';
  el.style.bottom = '16px';
  el.style.zIndex = '2000';
  el.style.padding = '12px 14px';
  el.style.borderRadius = '12px';
  el.style.border = '1px solid #dee1e6';
  el.style.background = '#ffffff';
  el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
  el.style.color = type === 'error' ? '#cf202f' : '#0a0b0d';
  el.style.fontWeight = '600';
  el.style.maxWidth = '360px';
  el.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  el.textContent = message;
  document.body.appendChild(el);

  setTimeout(() => {
    el.style.transition = 'opacity 150ms ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  }, 2400);
}

