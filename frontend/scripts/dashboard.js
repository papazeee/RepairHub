import { api, requireAuth, clearToken, toastSuccess, toastError, formatDate, deviceIcon } from './api.js';

const user = requireAuth('index.html');
if (!user) throw new Error();

document.getElementById('user-name').textContent = user.name;
document.getElementById('user-avatar').textContent = user.name[0].toUpperCase();
document.getElementById('greeting').textContent = `Hello, ${user.name.split(' ')[0]}! What needs fixing today?`;
document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  window.location.href = 'index.html';
});

const state = { device_type: null, brand: null, model: null, problem_description: null };

const BRANDS = {
  phone: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Other'],
  laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Other'],
  tablet: ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Amazon', 'Other'],
  desktop: ['Dell', 'HP', 'Lenovo', 'Asus', 'Custom Build', 'Other'],
  other: ['Other'],
};

const MODELS = {
  phone: {
    Apple: ['iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11'],
    Samsung: ['Galaxy S24 Ultra', 'Galaxy S24', 'Galaxy S23', 'Galaxy S22', 'Galaxy Note 20', 'Galaxy A54'],
    Google: ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 6'],
    OnePlus: ['OnePlus 12', 'OnePlus 11', 'OnePlus 10 Pro'],
    Xiaomi: ['Xiaomi 14', 'Mi 13', 'Redmi Note 13', 'Poco X5'],
    Huawei: ['P60 Pro', 'Mate 50', 'Nova 11'],
  },
  laptop: {
    Apple: ['MacBook Air M3', 'MacBook Air M2', 'MacBook Pro 14" M3', 'MacBook Pro 16" M3'],
    Dell: ['XPS 13', 'XPS 15', 'XPS 17', 'Inspiron 15', 'Latitude 7440'],
    HP: ['Spectre x360', 'Envy 13', 'Pavilion 15', 'EliteBook 840', 'Omen 16'],
    Lenovo: ['ThinkPad X1 Carbon', 'ThinkPad T14', 'IdeaPad 5', 'Legion 5', 'Yoga 9i'],
    Asus: ['ZenBook 14', 'VivoBook 15', 'ROG Strix G15', 'ProArt Studiobook'],
    Acer: ['Swift 5', 'Aspire 5', 'Predator Helios 16', 'Nitro 5'],
    MSI: ['Stealth 16', 'Raider GE78', 'Creator Z17'],
  },
  tablet: {
    Apple: ['iPad Pro 12.9"', 'iPad Pro 11"', 'iPad Air M1', 'iPad 10th Gen', 'iPad Mini 6'],
    Samsung: ['Galaxy Tab S9 Ultra', 'Galaxy Tab S9', 'Galaxy Tab A8'],
    Microsoft: ['Surface Pro 9', 'Surface Pro 8', 'Surface Go 3'],
    Lenovo: ['Tab P12 Pro', 'Tab M10', 'IdeaPad Duet'],
    Amazon: ['Fire HD 10', 'Fire 7', 'Fire HD 8'],
  },
};

function goTo(id) {
  ['step-device', 'step-brand', 'step-model', 'step-problem', 'step-confirm']
    .forEach((s) => document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function updateProgress(step) {
  for (let i = 1; i <= 4; i += 1) {
    const dot = document.getElementById(`dot-${i}`);
    dot.classList.toggle('active', i === step);
    dot.classList.toggle('done', i < step);
  }
  for (let i = 1; i <= 3; i += 1) {
    document.getElementById(`line-${i}`)?.classList.toggle('done', i < step);
  }
}

function pickBrand(brand) {
  state.brand = brand;
  const models = (MODELS[state.device_type] || {})[brand] || [];
  const sel = document.getElementById('model-select');
  sel.innerHTML = '<option value="">Choose your model...</option>'
    + models.map((m) => `<option value="${m}">${m}</option>`).join('');
  document.getElementById('other-model-chk').checked = false;
  document.getElementById('custom-model-group').classList.add('hidden');
  goTo('step-model');
  updateProgress(3);
}

document.querySelectorAll('.device-tile').forEach((tile) => {
  tile.addEventListener('click', () => {
    state.device_type = tile.dataset.type;
    const brands = BRANDS[state.device_type] || ['Other'];
    const grid = document.getElementById('brand-grid');
    grid.innerHTML = brands.map((b) => `<div class="brand-tile" data-brand="${b}">${b}</div>`).join('');
    grid.querySelectorAll('.brand-tile').forEach((bt) => bt.addEventListener('click', () => pickBrand(bt.dataset.brand)));
    goTo('step-brand');
    updateProgress(2);
  });
});

document.getElementById('back-to-device').addEventListener('click', () => {
  goTo('step-device');
  updateProgress(1);
});
document.getElementById('back-to-brand').addEventListener('click', () => {
  goTo('step-brand');
  updateProgress(2);
});
document.getElementById('back-to-model').addEventListener('click', () => {
  goTo('step-model');
  updateProgress(3);
});

document.getElementById('other-model-chk').addEventListener('change', function onOtherModelChange() {
  document.getElementById('custom-model-group').classList.toggle('hidden', !this.checked);
  if (this.checked) document.getElementById('custom-model').focus();
});

document.getElementById('next-to-problem').addEventListener('click', () => {
  const isOther = document.getElementById('other-model-chk').checked;
  const custom = document.getElementById('custom-model').value.trim();
  const sel = document.getElementById('model-select').value;

  if (isOther) {
    if (!custom) {
      toastError('Please enter your model name.');
      return;
    }
    state.model = custom;
  } else {
    if (!sel) {
      toastError('Please select your device model.');
      return;
    }
    state.model = sel;
  }

  document.getElementById('request-summary-bar').textContent = `${deviceIcon(state.device_type)} ${state.brand} ${state.model}`;
  goTo('step-problem');
  updateProgress(4);
});

document.getElementById('submit-btn').addEventListener('click', async () => {
  const notSure = document.getElementById('not-sure-chk').checked;
  const desc = document.getElementById('problem-desc').value.trim();

  if (!notSure && !desc) {
    toastError('Please describe the problem or check "needs diagnosis".');
    return;
  }

  state.problem_description = notSure
    ? 'Customer is unsure — needs full diagnosis'
    : desc;

  const btn = document.getElementById('submit-btn');
  const spinner = document.getElementById('submit-spinner');
  btn.disabled = true;
  spinner.classList.remove('hidden');
  document.querySelector('#submit-btn .btn-label').classList.add('hidden');

  try {
    const data = await api('/repair-requests', {
      method: 'POST',
      body: JSON.stringify(state),
    });
    document.getElementById('confirm-details').innerHTML = `
      <div style="display:grid;gap:8px">
        <div><strong>Request ID:</strong> #${data.id}</div>
        <div><strong>Device:</strong> ${deviceIcon(data.device_type)} ${data.brand} ${data.model}</div>
        <div><strong>Problem:</strong> ${data.problem_description}</div>
        <div><strong>Status:</strong> <span class="badge badge-pending">pending</span></div>
        <div><strong>Submitted:</strong> ${formatDate(data.created_at)}</div>
      </div>`;
    goTo('step-confirm');
    document.getElementById('step-progress').classList.add('hidden');
    toastSuccess('Repair request submitted!');
  } catch (err) {
    toastError('Failed: ' + err.message);
    btn.disabled = false;
    spinner.classList.add('hidden');
    document.querySelector('#submit-btn .btn-label').classList.remove('hidden');
  }
});

document.getElementById('new-request-btn').addEventListener('click', () => {
  Object.assign(state, { device_type: null, brand: null, model: null, problem_description: null });
  document.getElementById('problem-desc').value = '';
  document.getElementById('not-sure-chk').checked = false;
  document.getElementById('step-progress').classList.remove('hidden');
  goTo('step-device');
  updateProgress(1);
});
