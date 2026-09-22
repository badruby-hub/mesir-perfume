// admin/admin.js
//
// All admin state lives in memory here and is loaded fresh from GitHub
// (via /api/admin/data) on login. Every add/edit/delete updates this
// in-memory copy, then immediately posts the WHOLE updated array/object
// back to /api/admin/save — simplest possible model, no partial-patch
// logic to get wrong.

let state = {
  products: [],
  slides: [],
  i18n: { en: {}, ru: {} },
  filters: { brands: [], sizes: [], countries: [] },
};

// =======================================================
// LOGIN / SESSION
// =======================================================
const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const adminApp = document.getElementById('admin-app');
const logoutBtn = document.getElementById('logout-btn');

async function checkSession() {
  try {
    const res = await fetch('/api/admin/session');
    const data = await res.json();
    return !!data.authenticated;
  } catch (err) {
    return false;
  }
}

async function showApp() {
  loginScreen.classList.add('hidden');
  adminApp.classList.remove('hidden');
  await loadAllData();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      loginError.classList.remove('hidden');
      return;
    }
    await showApp();
  } catch (err) {
    loginError.textContent = 'Ошибка соединения. Попробуйте снова.';
    loginError.classList.remove('hidden');
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  location.reload();
});

// =======================================================
// GLOBAL STATUS BANNER
// =======================================================
const globalStatus = document.getElementById('global-status');
let statusTimer = null;

function showStatus(message, type) {
  clearTimeout(statusTimer);
  globalStatus.textContent = message;
  globalStatus.className = `global-status ${type}`;
  globalStatus.classList.remove('hidden');
  if (type !== 'loading') {
    statusTimer = setTimeout(() => globalStatus.classList.add('hidden'), 4000);
  }
}

// =======================================================
// LOAD DATA
// =======================================================
async function loadAllData() {
  showStatus('Загрузка данных из GitHub...', 'loading');
  try {
    const res = await fetch('/api/admin/data');
    if (!res.ok) throw new Error('Failed to load');
    state = await res.json();
    globalStatus.classList.add('hidden');
    renderProducts();
    renderSlides();
    renderTexts();
  } catch (err) {
    showStatus('Не удалось загрузить данные из GitHub. Проверьте настройки GITHUB_TOKEN/GITHUB_REPO.', 'error');
  }
}

// =======================================================
// SAVE HELPER
// =======================================================
async function saveType(type, data, message) {
  showStatus('Сохранение...', 'loading');
  try {
    const res = await fetch('/api/admin/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data, message }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.detail || body.error || 'Save failed');
    showStatus('Сохранено — сайт обновится в течение ~30–60 секунд.', 'success');
    return true;
  } catch (err) {
    showStatus(`Ошибка сохранения: ${err.message}`, 'error');
    return false;
  }
}

// =======================================================
// TABS
// =======================================================
document.querySelectorAll('.admin-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-panel').forEach((p) => p.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
  });
});

// =======================================================
// MODAL HELPERS
// =======================================================
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-backdrop').forEach((bg) => {
  bg.addEventListener('click', () => bg.closest('.modal-overlay').classList.add('hidden'));
});

let confirmCallback = null;
function askConfirm(text, onConfirm) {
  document.getElementById('confirm-text').textContent = text;
  confirmCallback = onConfirm;
  openModal('confirm-modal');
}
document.getElementById('confirm-cancel-btn').addEventListener('click', () => closeModal('confirm-modal'));
document.getElementById('confirm-ok-btn').addEventListener('click', async () => {
  closeModal('confirm-modal');
  if (confirmCallback) await confirmCallback();
});

// =======================================================
// IMAGE UPLOAD (product/slide photos, straight from the admin's computer)
// =======================================================
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is "data:image/jpeg;base64,AAAA..." — strip the prefix.
      const base64 = String(reader.result).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file, statusEl, urlInput) {
  statusEl.textContent = 'Загрузка...';
  statusEl.className = 'upload-status uploading';

  try {
    const contentBase64 = await readFileAsBase64(file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentBase64 }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.detail || body.error || 'Upload failed');

    urlInput.value = body.path;
    statusEl.textContent = `Загружено: ${body.path}`;
    statusEl.className = 'upload-status success';
  } catch (err) {
    statusEl.textContent = `Ошибка загрузки: ${err.message}`;
    statusEl.className = 'upload-status error';
  }
}

document.getElementById('pf-image-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadImage(file, document.getElementById('pf-upload-status'), document.getElementById('pf-image'));
});

document.getElementById('sf-image-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadImage(file, document.getElementById('sf-upload-status'), document.getElementById('sf-image'));
});

// =======================================================
// PRODUCTS
// =======================================================
function nextProductId() {
  return state.products.length ? Math.max(...state.products.map((p) => p.id)) + 1 : 1;
}

function renderProducts() {
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = '';
  document.getElementById('products-count').textContent = `(${state.products.length})`;

  state.products.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img class="table-thumb" src="${p.image}" alt=""></td>
      <td>
        <div class="table-product-brand">${p.brand}</div>
        <div class="table-product-name">${p.name}</div>
      </td>
      <td>$${p.price}</td>
      <td>${p.size}</td>
      <td>${p.country}</td>
      <td><span class="status-pill ${p.availability}">${p.availability === 'in-stock' ? 'In Stock' : 'Made to Order'}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-action-btn" data-edit="${p.id}">Изменить</button>
          <button class="icon-action-btn danger" data-delete="${p.id}">Удалить</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openProductForm(+btn.dataset.edit));
  });
  tbody.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = state.products.find((p) => p.id === +btn.dataset.delete);
      askConfirm(`Удалить «${product.brand} ${product.name}»? Это действие необратимо.`, async () => {
        state.products = state.products.filter((p) => p.id !== product.id);
        const ok = await saveType('products', state.products, `Remove product: ${product.brand} ${product.name}`);
        if (ok) renderProducts(); else await loadAllData();
      });
    });
  });
}

function openProductForm(id) {
  const form = document.getElementById('product-form');
  form.reset();
  document.getElementById('pf-upload-status').textContent = '';
  document.getElementById('pf-upload-status').className = 'upload-status';
  const product = id ? state.products.find((p) => p.id === id) : null;

  document.getElementById('product-modal-title').textContent = product ? 'Изменить товар' : 'Добавить товар';
  document.getElementById('pf-id').value = product ? product.id : '';
  document.getElementById('pf-brand').value = product ? product.brand : '';
  document.getElementById('pf-name').value = product ? product.name : '';
  document.getElementById('pf-price').value = product ? product.price : '';
  document.getElementById('pf-size').value = product ? product.size : '';
  document.getElementById('pf-country').value = product ? product.country : '';
  document.getElementById('pf-availability').value = product ? product.availability : 'in-stock';
  document.getElementById('pf-image').value = product ? product.image : '';
  document.getElementById('pf-desc-en').value = product ? product.description.en : '';
  document.getElementById('pf-desc-ru').value = product ? product.description.ru : '';
  document.getElementById('pf-notes-en').value = product ? product.notes.en : '';
  document.getElementById('pf-notes-ru').value = product ? product.notes.ru : '';

  openModal('product-modal');
}

document.getElementById('add-product-btn').addEventListener('click', () => openProductForm(null));

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const idVal = document.getElementById('pf-id').value;
  const isEdit = !!idVal;

  const product = {
    id: isEdit ? +idVal : nextProductId(),
    brand: document.getElementById('pf-brand').value.trim(),
    name: document.getElementById('pf-name').value.trim(),
    price: +document.getElementById('pf-price').value,
    size: document.getElementById('pf-size').value.trim(),
    country: document.getElementById('pf-country').value.trim(),
    availability: document.getElementById('pf-availability').value,
    image: document.getElementById('pf-image').value.trim(),
    description: {
      en: document.getElementById('pf-desc-en').value.trim(),
      ru: document.getElementById('pf-desc-ru').value.trim(),
    },
    notes: {
      en: document.getElementById('pf-notes-en').value.trim(),
      ru: document.getElementById('pf-notes-ru').value.trim(),
    },
  };

  if (isEdit) {
    state.products = state.products.map((p) => (p.id === product.id ? product : p));
  } else {
    state.products = [...state.products, product];
  }

  const ok = await saveType(
    'products',
    state.products,
    isEdit ? `Edit product: ${product.brand} ${product.name}` : `Add product: ${product.brand} ${product.name}`
  );
  if (ok) {
    closeModal('product-modal');
    renderProducts();
  } else {
    await loadAllData();
  }
});

// =======================================================
// HERO SLIDES
// =======================================================
function nextSlideId() {
  return state.slides.length ? Math.max(...state.slides.map((s) => s.id)) + 1 : 1;
}

function renderSlides() {
  const list = document.getElementById('slides-list');
  list.innerHTML = '';
  document.getElementById('slides-count').textContent = `(${state.slides.length})`;

  state.slides.forEach((s) => {
    const row = document.createElement('div');
    row.className = 'slide-row';
    row.innerHTML = `
      <img src="${s.image}" alt="">
      <div class="slide-row-info">
        <div class="slide-row-name">${s.name} · ${s.price}</div>
        <div class="slide-row-tagline">${s.tagline.en}</div>
      </div>
      <div class="row-actions">
        <button class="icon-action-btn" data-edit="${s.id}">Изменить</button>
        <button class="icon-action-btn danger" data-delete="${s.id}">Удалить</button>
      </div>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openSlideForm(+btn.dataset.edit));
  });
  list.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slide = state.slides.find((s) => s.id === +btn.dataset.delete);
      askConfirm(`Удалить слайд «${slide.name}»?`, async () => {
        state.slides = state.slides.filter((s) => s.id !== slide.id);
        const ok = await saveType('slides', state.slides, `Remove slide: ${slide.name}`);
        if (ok) renderSlides(); else await loadAllData();
      });
    });
  });
}

function openSlideForm(id) {
  const form = document.getElementById('slide-form');
  form.reset();
  document.getElementById('sf-upload-status').textContent = '';
  document.getElementById('sf-upload-status').className = 'upload-status';
  const slide = id ? state.slides.find((s) => s.id === id) : null;

  document.getElementById('slide-modal-title').textContent = slide ? 'Изменить слайд' : 'Добавить слайд';
  document.getElementById('sf-id').value = slide ? slide.id : '';
  document.getElementById('sf-name').value = slide ? slide.name : '';
  document.getElementById('sf-price').value = slide ? slide.price : '';
  document.getElementById('sf-image').value = slide ? slide.image : '';
  document.getElementById('sf-tagline-en').value = slide ? slide.tagline.en : '';
  document.getElementById('sf-tagline-ru').value = slide ? slide.tagline.ru : '';
  document.getElementById('sf-desc-en').value = slide ? slide.description.en : '';
  document.getElementById('sf-desc-ru').value = slide ? slide.description.ru : '';
  document.getElementById('sf-notes-en').value = slide ? slide.notes.en.join('\n') : '';
  document.getElementById('sf-notes-ru').value = slide ? slide.notes.ru.join('\n') : '';

  openModal('slide-modal');
}

document.getElementById('add-slide-btn').addEventListener('click', () => openSlideForm(null));

document.getElementById('slide-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const idVal = document.getElementById('sf-id').value;
  const isEdit = !!idVal;
  const existing = isEdit ? state.slides.find((s) => s.id === +idVal) : null;

  const slide = {
    id: isEdit ? +idVal : nextSlideId(),
    name: document.getElementById('sf-name').value.trim(),
    brand: existing ? existing.brand : 'MESIR',
    price: document.getElementById('sf-price').value.trim(),
    image: document.getElementById('sf-image').value.trim(),
    accent: existing ? existing.accent : '#c9901a',
    tagline: {
      en: document.getElementById('sf-tagline-en').value.trim(),
      ru: document.getElementById('sf-tagline-ru').value.trim(),
    },
    description: {
      en: document.getElementById('sf-desc-en').value.trim(),
      ru: document.getElementById('sf-desc-ru').value.trim(),
    },
    notes: {
      en: document.getElementById('sf-notes-en').value.split('\n').map((s) => s.trim()).filter(Boolean),
      ru: document.getElementById('sf-notes-ru').value.split('\n').map((s) => s.trim()).filter(Boolean),
    },
  };

  if (isEdit) {
    state.slides = state.slides.map((s) => (s.id === slide.id ? slide : s));
  } else {
    state.slides = [...state.slides, slide];
  }

  const ok = await saveType('slides', state.slides, isEdit ? `Edit slide: ${slide.name}` : `Add slide: ${slide.name}`);
  if (ok) {
    closeModal('slide-modal');
    renderSlides();
  } else {
    await loadAllData();
  }
});

// =======================================================
// SITE TEXTS
// =======================================================
function renderTexts() {
  const list = document.getElementById('texts-list');
  list.innerHTML = '';

  const keys = Object.keys(state.i18n.en || {});
  keys.forEach((key) => {
    const row = document.createElement('div');
    row.className = 'text-row';
    row.innerHTML = `
      <div class="text-row-key">${key}</div>
      <input type="text" data-lang="en" data-key="${key}" value="${escapeAttr(state.i18n.en[key] || '')}">
      <input type="text" data-lang="ru" data-key="${key}" value="${escapeAttr(state.i18n.ru[key] || '')}">
    `;
    list.appendChild(row);
  });
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

document.getElementById('save-texts-btn').addEventListener('click', async () => {
  document.querySelectorAll('#texts-list input[data-lang="en"]').forEach((input) => {
    state.i18n.en[input.dataset.key] = input.value;
  });
  document.querySelectorAll('#texts-list input[data-lang="ru"]').forEach((input) => {
    state.i18n.ru[input.dataset.key] = input.value;
  });

  await saveType('i18n', state.i18n, 'Update site texts via admin panel');
});

// =======================================================
// INIT
// =======================================================
(async () => {
  const authed = await checkSession();
  if (authed) {
    await showApp();
  }
})();
