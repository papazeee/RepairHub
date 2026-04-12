import { api, requireAuth, setUser, clearToken, toastError, toastSuccess, formatDate } from './api.js';

const user = requireAuth('index.html');
if (!user) throw new Error();

document.getElementById('user-avatar').textContent = user.name[0].toUpperCase();
document.getElementById('profile-name').value = user.name;
document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  window.location.href = 'index.html';
});

function field(label, value) {
  return `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em">${label}</div>
      <div style="margin-top:6px;font-weight:600;color:var(--text)">${value || '—'}</div>
    </div>`;
}

async function loadProfile() {
  try {
    const me = await api('/auth/me');
    setUser(me);

    document.getElementById('profile-fields').innerHTML = [
      field('Name', me.name),
      field('Email', me.email),
      field('Phone', me.phone),
      field('Address', me.address),
      field('Role', me.is_admin ? 'Administrator' : 'Customer'),
      field('Joined', formatDate(me.created_at)),
    ].join('');

    if (me.is_admin) {
      const stats = await api('/admin/stats');
      document.getElementById('profile-summary').innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
          <div class="stat-card"><div class="stat-label">Customers</div><div class="stat-value" style="font-size:24px">${stats.total_users}</div></div>
          <div class="stat-card accent"><div class="stat-label">Orders</div><div class="stat-value" style="font-size:24px">${stats.total_requests}</div></div>
          <div class="stat-card"><div class="stat-label">Pending</div><div class="stat-value" style="font-size:24px">${stats.pending}</div></div>
        </div>
        <div style="margin-top:12px">
          <a href="admin.html" class="btn btn-sm btn-ghost">Open Admin Panel</a>
          <a href="notifications.html" class="btn btn-sm btn-primary">View Notifications</a>
        </div>`;
      return;
    }

    const orders = await api('/repair-requests/my');
    const active = orders.filter((o) => o.status === 'pending' || o.status === 'in_progress').length;
    const completed = orders.filter((o) => o.status === 'completed').length;

    document.getElementById('profile-summary').innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px"><strong>${orders.length}</strong><div class="text-muted" style="font-size:13px">Total requests</div></div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px"><strong>${active}</strong><div class="text-muted" style="font-size:13px">Active requests</div></div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px"><strong>${completed}</strong><div class="text-muted" style="font-size:13px">Completed</div></div>
      </div>
      <div style="margin-top:12px">
        <a href="my-orders.html" class="btn btn-sm btn-primary">View My Orders</a>
      </div>`;
  } catch (err) {
    toastError(err.message || 'Failed to load profile');
    document.getElementById('profile-fields').innerHTML = '';
    document.getElementById('profile-summary').innerHTML = '<span class="text-muted">Could not load profile right now.</span>';
  }
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('profile-save-btn');
  const spinner = document.getElementById('profile-spinner');
  btn.disabled = true;
  spinner.classList.remove('hidden');
  document.querySelector('#profile-save-btn .btn-label').classList.add('hidden');

  const name = document.getElementById('profile-name').value.trim();
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;

  try {
    const payload = { name: name || null };
    if (newPassword) {
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }

    const data = await api('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    setUser(data.user);
    document.getElementById('user-avatar').textContent = data.user.name[0].toUpperCase();
    document.getElementById('profile-name').value = data.user.name;
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('profile-fields').innerHTML = [
      field('Name', data.user.name),
      field('Email', data.user.email),
      field('Phone', data.user.phone),
      field('Address', data.user.address),
      field('Role', data.user.is_admin ? 'Administrator' : 'Customer'),
      field('Joined', formatDate(data.user.created_at)),
    ].join('');
    toastSuccess('Profile updated successfully');
  } catch (err) {
    toastError(err.message || 'Failed to update profile');
  } finally {
    btn.disabled = false;
    spinner.classList.add('hidden');
    document.querySelector('#profile-save-btn .btn-label').classList.remove('hidden');
  }
});

loadProfile();
