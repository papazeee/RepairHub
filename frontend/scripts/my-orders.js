import { api, requireAuth, clearToken, formatDate, badgeHTML, deviceIcon } from './api.js';

const user = requireAuth('login.html');
if (!user) throw new Error();

document.getElementById('user-avatar').textContent = user.name[0].toUpperCase();
document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  window.location.href = 'login.html';
});

let allOrders = [];
let currentFilter = 'all';

async function loadOrders() {
  try {
    allOrders = await api('/repair-requests/my');
    renderOrders();
  } catch (err) {
    document.getElementById('orders-container').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to load orders</h3>
        <p>${err.message}</p>
        <button class="btn btn-primary mt-2" onclick="location.reload()">Retry</button>
      </div>`;
  }
}

function renderOrders() {
  const filtered = currentFilter === 'all'
    ? allOrders
    : allOrders.filter((o) => o.status === currentFilter);

  const container = document.getElementById('orders-container');

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No orders here</h3>
        <p>${currentFilter === 'all' ? "You haven't submitted any repair requests yet." : `No ${currentFilter.replace('_', ' ')} orders.`}</p>
        ${currentFilter === 'all' ? '<a href="dashboard.html" class="btn btn-primary mt-2">Submit First Request</a>' : ''}
      </div>`;
    return;
  }

  container.innerHTML = `<div class="orders-list">${filtered.map((order) => `
    <div class="order-card">
      <div class="order-icon">${deviceIcon(order.device_type)}</div>
      <div class="order-info">
        <div class="order-device">${order.brand} ${order.model}</div>
        <div class="order-meta">${order.problem_description.length > 90 ? order.problem_description.slice(0, 90) + '…' : order.problem_description}</div>
        <div class="order-date">Submitted ${formatDate(order.created_at)}</div>
        ${order.admin_notes ? `<div style="font-size:13px;margin-top:4px;color:var(--info)">📌 Admin note: ${order.admin_notes}</div>` : ''}
      </div>
      <div class="order-right">
        ${badgeHTML(order.status)}
        <span style="font-size:12px;color:var(--text-light)">#${order.id}</span>
      </div>
    </div>`).join('')}</div>`;
}

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.status;
    document.querySelectorAll('.filter-btn').forEach((b) => {
      b.classList.toggle('btn-primary', b === btn);
      b.classList.toggle('btn-ghost', b !== btn);
      b.classList.toggle('active', b === btn);
    });
    renderOrders();
  });
});

loadOrders();
