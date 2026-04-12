import {
  api,
  setToken,
  setUser,
  getToken,
  getUser,
  clearToken,
  toastSuccess,
  toastError,
  toastInfo,
  formatDate,
  badgeHTML,
  deviceIcon,
} from './api.js';

let adminUser = getUser();
if (adminUser && adminUser.is_admin && getToken()) {
  showPanel(adminUser);
}

document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('admin-login-btn');
  const sp = document.getElementById('admin-spinner');
  btn.disabled = true;
  sp.classList.remove('hidden');
  document.querySelector('#admin-login-btn .btn-label').classList.add('hidden');

  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('a-email').value.trim(),
        password: document.getElementById('a-password').value,
      }),
    });
    if (!data.user.is_admin) throw new Error('This account does not have admin access.');
    setToken(data.access_token);
    setUser(data.user);
    toastSuccess('Welcome, ' + data.user.name);
    showPanel(data.user);
  } catch (err) {
    toastError(err.message);
    btn.disabled = false;
    sp.classList.add('hidden');
    document.querySelector('#admin-login-btn .btn-label').classList.remove('hidden');
  }
});

function showPanel(user) {
  adminUser = user;
  document.getElementById('admin-login-screen').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');
  document.getElementById('admin-name').textContent = user.name;
  document.getElementById('admin-avatar').textContent = user.name[0].toUpperCase();
  document.getElementById('admin-greeting').textContent = `Hello, ${user.name.split(' ')[0]}! Here's today's overview.`;
  loadDashboard();
  pollNotifications();
}

document.getElementById('admin-logout-btn').addEventListener('click', () => {
  clearToken();
  document.getElementById('admin-panel').classList.add('hidden');
  document.getElementById('admin-login-screen').classList.remove('hidden');
  toastInfo('Logged out.');
});

window.showView = function showView(view) {
  ['dashboard', 'orders', 'customers'].forEach((v) => {
    document.getElementById(`view-${v}`).classList.toggle('hidden', v !== view);
    document.getElementById(`nav-${v}`)?.classList.toggle('active', v === view);
  });
  if (view === 'orders') loadOrders();
  if (view === 'customers') loadCustomers();
};

async function loadDashboard() {
  try {
    const [stats, ordersData] = await Promise.all([
      api('/admin/stats'),
      api('/admin/requests'),
    ]);

    document.getElementById('stat-users').textContent = stats.total_users;
    document.getElementById('stat-total').textContent = stats.total_requests;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-inprogress').textContent = stats.in_progress;
    document.getElementById('stat-completed').textContent = stats.completed;

    const recent = (ordersData.requests || []).slice(0, 5);
    document.getElementById('recent-orders-list').innerHTML = recent.length
      ? `<div class="orders-list">${recent.map((o) => `
          <div class="order-card">
            <div class="order-icon">${deviceIcon(o.device_type)}</div>
            <div class="order-info">
              <div class="order-device">${o.brand} ${o.model}</div>
              <div class="order-meta">${o.customer_name || '—'} · ${o.problem_description.slice(0, 60)}…</div>
            </div>
            <div class="order-right">${badgeHTML(o.status)}<span style="font-size:12px;color:var(--text-light)">${formatDate(o.created_at)}</span></div>
          </div>`).join('')}</div>`
      : '<div class="empty-state" style="padding:24px"><p>No orders yet.</p></div>';
  } catch (err) {
    toastError('Failed to load dashboard: ' + err.message);
  }
}

let allOrders = [];
let editingId = null;

async function loadOrders() {
  try {
    const data = await api('/admin/requests');
    allOrders = data.requests || [];
    renderOrdersTable();
  } catch (err) {
    toastError('Failed to load orders: ' + err.message);
  }
}

document.getElementById('status-filter').addEventListener('change', renderOrdersTable);
document.getElementById('refresh-orders-btn').addEventListener('click', loadOrders);

function renderOrdersTable() {
  const filter = document.getElementById('status-filter').value;
  const orders = filter === 'all' ? allOrders : allOrders.filter((o) => o.status === filter);
  const tbody = document.getElementById('orders-tbody');

  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state" style="padding:32px"><div class="empty-icon">📭</div><h3>No orders found</h3></div></td></tr>';
    return;
  }

  tbody.innerHTML = orders.map((o) => `
    <tr>
      <td><strong>#${o.id}</strong></td>
      <td>
        <div style="font-weight:600">${o.customer_name || '—'}</div>
        <div style="font-size:12px;color:var(--text-muted)">${o.customer_email || ''}</div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">${deviceIcon(o.device_type)}
          <div>
            <div style="font-weight:500">${o.brand} ${o.model}</div>
            <div style="font-size:12px;color:var(--text-muted);text-transform:capitalize">${o.device_type}</div>
          </div>
        </div>
      </td>
      <td style="max-width:200px">
        <div style="font-size:13px;color:var(--text-muted)">${o.problem_description.slice(0, 70)}${o.problem_description.length > 70 ? '…' : ''}</div>
        ${o.admin_notes ? `<div style="font-size:12px;color:var(--info);margin-top:3px">📌 ${o.admin_notes}</div>` : ''}
      </td>
      <td>${badgeHTML(o.status)}</td>
      <td style="font-size:13px;color:var(--text-muted)">${formatDate(o.created_at)}</td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="openModal(${o.id}, '${o.status}', \`${(o.admin_notes || '').replace(/`/g, "'")}\`)">
          Edit
        </button>
      </td>
    </tr>`).join('');
}

window.openModal = function openModal(id, status, notes) {
  editingId = id;
  const order = allOrders.find((o) => o.id === id);
  document.getElementById('modal-subtitle').textContent = order
    ? `Order #${id} · ${order.brand} ${order.model}`
    : `Order #${id}`;
  document.getElementById('modal-status').value = status;
  document.getElementById('modal-notes').value = notes || '';
  document.getElementById('modal-overlay').classList.remove('hidden');
};

document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  editingId = null;
}

document.getElementById('modal-save').addEventListener('click', async () => {
  if (!editingId) return;
  const btn = document.getElementById('modal-save');
  const spinner = document.getElementById('modal-spinner');
  btn.disabled = true;
  spinner.classList.remove('hidden');
  document.querySelector('#modal-save .btn-label').classList.add('hidden');

  try {
    await api(`/admin/requests/${editingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: document.getElementById('modal-status').value,
        admin_notes: document.getElementById('modal-notes').value.trim() || null,
      }),
    });
    toastSuccess('Order #' + editingId + ' updated!');
    closeModal();
    await loadOrders();
    await loadDashboard();
  } catch (err) {
    toastError('Update failed: ' + err.message);
  } finally {
    btn.disabled = false;
    spinner.classList.add('hidden');
    document.querySelector('#modal-save .btn-label').classList.remove('hidden');
  }
});

async function loadCustomers() {
  try {
    const data = await api('/admin/users');
    const tbody = document.getElementById('customers-tbody');
    const customers = (data.users || []).filter((u) => !u.is_admin);
    if (!customers.length) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state" style="padding:32px"><p>No customers registered yet.</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = customers.map((u) => `
      <tr>
        <td><strong>#${u.id}</strong></td>
        <td><div style="font-weight:600">${u.name}</div></td>
        <td style="font-size:13px">${u.email}</td>
        <td style="font-size:13px">${u.phone}</td>
        <td style="font-size:13px;color:var(--text-muted)">${u.address}</td>
        <td style="font-size:13px;color:var(--text-muted)">${formatDate(u.created_at)}</td>
      </tr>`).join('');
  } catch (err) {
    toastError('Failed to load customers: ' + err.message);
  }
}

let notifOpen = false;

document.getElementById('notif-btn').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'notifications.html';
});

document.addEventListener('click', () => {
  if (notifOpen) {
    notifOpen = false;
    document.getElementById('notif-dropdown').classList.add('hidden');
  }
});

document.getElementById('notif-dropdown').addEventListener('click', (e) => e.stopPropagation());

document.getElementById('mark-all-read').addEventListener('click', async () => {
  try {
    await api('/admin/notifications/read-all', { method: 'PATCH' });
    document.getElementById('notif-badge').classList.add('hidden');
    await loadNotifications();
  } catch {
    // Ignore transient notification errors.
  }
});

async function loadNotifications() {
  try {
    const data = await api('/admin/notifications');
    const badge = document.getElementById('notif-badge');
    if (data.unread_count > 0) {
      badge.textContent = data.unread_count > 99 ? '99+' : data.unread_count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }

    const list = document.getElementById('notif-list');
    if (!data.notifications.length) {
      list.innerHTML = '<div class="notif-empty">No notifications</div>';
      return;
    }

    list.innerHTML = data.notifications.map((n) => `
      <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
        <div class="notif-title">${n.title}</div>
        <div class="notif-msg">${n.message}</div>
        <div class="notif-time">${formatDate(n.created_at)}</div>
      </div>`).join('');

    list.querySelectorAll('.notif-item').forEach((item) => {
      item.addEventListener('click', async () => {
        const id = item.dataset.id;
        item.classList.remove('unread');
        try {
          await api(`/admin/notifications/${id}/read`, { method: 'PATCH' });
        } catch {
          // Ignore transient notification errors.
        }
        await loadNotifications();
      });
    });
  } catch {
    // Ignore transient notification errors.
  }
}

function pollNotifications() {
  loadNotifications();
  setInterval(loadNotifications, 30000);
}
