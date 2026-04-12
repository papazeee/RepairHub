import { api, requireAdmin, clearToken, toastSuccess, toastError, formatDate } from './api.js';

const admin = requireAdmin('index.html');
if (!admin) throw new Error();

document.getElementById('admin-avatar').textContent = (admin.name || 'A')[0].toUpperCase();
document.getElementById('admin-name').textContent = admin.name || 'Admin';

document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  window.location.href = 'index.html';
});

function renderItems(items) {
  const container = document.getElementById('notif-container');
  if (!items.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔕</div><h3>No notifications</h3><p>You are all caught up.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="orders-list">
      ${items.map((n) => `
        <div class="order-card" style="border-left:${n.is_read ? '1px solid var(--border)' : '4px solid var(--brand)'}">
          <div class="order-icon">${n.is_read ? '✓' : '•'}</div>
          <div class="order-info">
            <div class="order-device">${n.title}</div>
            <div class="order-meta">${n.message}</div>
            <div class="order-date">${formatDate(n.created_at)}</div>
          </div>
          <div class="order-right">
            ${n.is_read
              ? '<span class="badge" style="background:#f3f4f6;color:var(--text-muted)">read</span>'
              : '<button class="btn btn-sm btn-ghost mark-one-btn" data-id="' + n.id + '">Mark read</button>'}
          </div>
        </div>`).join('')}
    </div>`;

  container.querySelectorAll('.mark-one-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      try {
        await api(`/admin/notifications/${id}/read`, { method: 'PATCH' });
        toastSuccess('Notification marked as read');
        await loadNotifications();
      } catch (err) {
        toastError(err.message || 'Failed to update notification');
      }
    });
  });
}

async function loadNotifications() {
  try {
    const data = await api('/admin/notifications');
    renderItems(data.notifications || []);
  } catch (err) {
    document.getElementById('notif-container').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to load notifications</h3>
        <p>${err.message || 'Please try again.'}</p>
      </div>`;
  }
}

document.getElementById('refresh-btn').addEventListener('click', loadNotifications);
document.getElementById('mark-all-btn').addEventListener('click', async () => {
  try {
    await api('/admin/notifications/read-all', { method: 'PATCH' });
    toastSuccess('All notifications marked as read');
    await loadNotifications();
  } catch (err) {
    toastError(err.message || 'Failed to mark all as read');
  }
});

loadNotifications();
