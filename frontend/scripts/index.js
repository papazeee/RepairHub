import { api, setToken, setUser, getToken, getUser, toastSuccess, toastError } from './api.js';

const token = getToken();
const user = getUser();
if (token && user) {
  window.location.href = user.is_admin ? 'admin.html' : 'dashboard.html';
}

const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');

document.getElementById('go-register').addEventListener('click', (e) => {
  e.preventDefault();
  loginCard.classList.add('hidden');
  registerCard.classList.remove('hidden');
});

document.getElementById('go-login').addEventListener('click', (e) => {
  e.preventDefault();
  registerCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const spinner = document.getElementById('login-spinner');
  btn.disabled = true;
  spinner.classList.remove('hidden');

  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      }),
    });
    setToken(data.access_token);
    setUser(data.user);
    toastSuccess('Welcome back, ' + data.user.name + '!');
    setTimeout(() => {
      window.location.href = data.user.is_admin ? 'admin.html' : 'dashboard.html';
    }, 600);
  } catch (err) {
    toastError(err.message);
    btn.disabled = false;
    spinner.classList.add('hidden');
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('register-btn');
  const spinner = document.getElementById('register-spinner');
  btn.disabled = true;
  spinner.classList.remove('hidden');

  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('reg-name').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        phone: document.getElementById('reg-phone').value.trim(),
        address: document.getElementById('reg-address').value.trim(),
        password: document.getElementById('reg-password').value,
      }),
    });
    setToken(data.access_token);
    setUser(data.user);
    toastSuccess('Account created! Welcome, ' + data.user.name);
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 600);
  } catch (err) {
    toastError(err.message);
    btn.disabled = false;
    spinner.classList.add('hidden');
  }
});
