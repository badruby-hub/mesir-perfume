// admin/admin.js
//
// All admin state lives in memory here and is loaded fresh from Supabase
// (via /api/admin/data) on login. Add/edit/delete across Products, Slides
// and Texts only update this in-memory copy and mark that section
// "dirty" — nothing is saved to Supabase until the admin explicitly
// clicks "Опубликовать" in the header, which then saves every dirty
// section in one go.

// Any <img> that fails to load gets swapped to a transparent 1x1 pixel
// instead of showing the browser's native "broken image" icon — the CSS
// gray pulse background on the <img> itself (see admin.css) then just
// stays visible on its own. 'error' doesn't bubble, hence capture phase.
document.addEventListener('error', (e) => {
  const el = e.target;
  if (el && el.tagName === 'IMG' && !el.dataset.fallbackApplied) {
    el.dataset.fallbackApplied = 'true';
    el.src = 'data:image/gif;base64,R0lGODlhAQABAIEAAAAAAAAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAgEAAEEBAA7';
  }
}, true);

let state = {
  products: [],
  slides: [],
  i18n: { en: {}, ru: {} },
  filters: { brands: [], sizes: [], countries: [] },
};

// Tracks which top-level sections have unpublished changes.
const dirty = { products: false, slides: false, i18n: false };

function markDirty(type) {
  dirty[type] = true;
  updateDirtyIndicator();
}

function updateDirtyIndicator() {
  const anyDirty = dirty.products || dirty.slides || dirty.i18n;
  document.getElementById('dirty-indicator').classList.toggle('hidden', !anyDirty);
}

// Warn before leaving the page (closing tab, navigating away) if there
// are unpublished changes, so an admin doesn't lose work by accident.
window.addEventListener('beforeunload', (e) => {
  if (dirty.products || dirty.slides || dirty.i18n) {
    e.preventDefault();
    e.returnValue = '';
  }
});

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
  if (dirty.products || dirty.slides || dirty.i18n) {
    if (!confirm('Есть неопубликованные изменения — они будут потеряны. Выйти всё равно?')) return;
  }
  await fetch('/api/admin/logout', { method: 'POST' });
  location.href = '/';
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
    dirty.products = false;
    dirty.slides = false;
    dirty.i18n = false;
    updateDirtyIndicator();
    globalStatus.classList.add('hidden');
    renderProducts();
    renderSlides();
    renderTexts();
  } catch (err) {
    showStatus('Не удалось загрузить данные из GitHub. Проверьте настройки GITHUB_TOKEN/GITHUB_REPO.', 'error');
  }
}

// =======================================================
// PUBLISH — the only place that actually commits to GitHub
// =======================================================
async function saveType(type, data, message) {
  const res = await fetch('/api/admin/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data, message }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.detail || body.error || 'Save failed');
}

document.getElementById('publish-btn').addEventListener('click', async () => {
  const toPublish = [];
  if (dirty.products) toPublish.push('products');
  if (dirty.slides) toPublish.push('slides');
  if (dirty.i18n) toPublish.push('i18n');

  if (toPublish.length === 0) {
    showStatus('Нет несохранённых изменений.', 'success');
    return;
  }

  showStatus(`Публикация (${toPublish.length})...`, 'loading');
  try {
    for (const type of toPublish) {
      await saveType(type, state[type], `Update ${type} via admin panel`);
      dirty[type] = false;
    }
    updateDirtyIndicator();
    showStatus('Опубликовано — сайт обновится в течение ~30–60 секунд.', 'success');
  } catch (err) {
    updateDirtyIndicator();
    showStatus(`Ошибка публикации: ${err.message}. Уже сохранённые разделы отмечены, остальное можно опубликовать повторно.`, 'error');
  }
});

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
document.getElementById('confirm-ok-btn').addEventListener('click', () => {
  closeModal('confirm-modal');
  if (confirmCallback) confirmCallback();
});

// =======================================================
// IMAGE UPLOAD (product/slide photos, straight from the admin's computer)
// =======================================================
// Note: uploads are the one exception to "nothing happens until Publish"
// — the file itself is committed immediately so the preview/thumbnail
// works right away. It's an inert, orphaned file until a product or
// slide actually references its path AND that change gets published, so
// this doesn't defeat the staging model in practice.
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
      <td>${p.category || '—'}</td>
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
      askConfirm(`Удалить «${product.brand} ${product.name}»? (Удаление применится после публикации.)`, () => {
        state.products = state.products.filter((p) => p.id !== product.id);
        markDirty('products');
        renderProducts();
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

  // Populate the category datalist from whatever categories are already
  // in use across products, so the admin sees existing options while
  // typing rather than accidentally creating near-duplicates.
  const categoryList = document.getElementById('pf-category-list');
  const categoriesInUse = [...new Set(state.products.map((p) => p.category).filter(Boolean))].sort();
  categoryList.innerHTML = categoriesInUse.map((c) => `<option value="${escapeAttr(c)}"></option>`).join('');

  document.getElementById('product-modal-title').textContent = product ? 'Изменить товар' : 'Добавить товар';
  document.getElementById('pf-id').value = product ? product.id : '';
  document.getElementById('pf-brand').value = product ? product.brand : '';
  document.getElementById('pf-name').value = product ? product.name : '';
  document.getElementById('pf-price').value = product ? product.price : '';
  document.getElementById('pf-size').value = product ? product.size : '';
  document.getElementById('pf-country').value = product ? product.country : '';
  document.getElementById('pf-availability').value = product ? product.availability : 'in-stock';
  document.getElementById('pf-category').value = product && product.category ? product.category : '';
  document.getElementById('pf-image').value = product ? product.image : '';
  document.getElementById('pf-desc-en').value = product ? product.description.en : '';
  document.getElementById('pf-desc-ru').value = product ? product.description.ru : '';
  document.getElementById('pf-desc-hy').value = product && product.description.hy ? product.description.hy : '';
  document.getElementById('pf-notes-en').value = product ? product.notes.en : '';
  document.getElementById('pf-notes-ru').value = product ? product.notes.ru : '';
  document.getElementById('pf-notes-hy').value = product && product.notes.hy ? product.notes.hy : '';

  openModal('product-modal');
}

document.getElementById('add-product-btn').addEventListener('click', () => openProductForm(null));

document.getElementById('product-form').addEventListener('submit', (e) => {
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
    category: document.getElementById('pf-category').value.trim(),
    image: document.getElementById('pf-image').value.trim(),
    description: {
      en: document.getElementById('pf-desc-en').value.trim(),
      ru: document.getElementById('pf-desc-ru').value.trim(),
      hy: document.getElementById('pf-desc-hy').value.trim(),
    },
    notes: {
      en: document.getElementById('pf-notes-en').value.trim(),
      ru: document.getElementById('pf-notes-ru').value.trim(),
      hy: document.getElementById('pf-notes-hy').value.trim(),
    },
  };

  if (isEdit) {
    state.products = state.products.map((p) => (p.id === product.id ? product : p));
  } else {
    state.products = [...state.products, product];
  }

  markDirty('products');
  closeModal('product-modal');
  renderProducts();
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
      askConfirm(`Удалить слайд «${slide.name}»? (Удаление применится после публикации.)`, () => {
        state.slides = state.slides.filter((s) => s.id !== slide.id);
        markDirty('slides');
        renderSlides();
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
  document.getElementById('sf-tagline-hy').value = slide && slide.tagline.hy ? slide.tagline.hy : '';
  document.getElementById('sf-desc-en').value = slide ? slide.description.en : '';
  document.getElementById('sf-desc-ru').value = slide ? slide.description.ru : '';
  document.getElementById('sf-desc-hy').value = slide && slide.description.hy ? slide.description.hy : '';
  document.getElementById('sf-notes-en').value = slide ? slide.notes.en.join('\n') : '';
  document.getElementById('sf-notes-ru').value = slide ? slide.notes.ru.join('\n') : '';
  document.getElementById('sf-notes-hy').value = slide && slide.notes.hy ? slide.notes.hy.join('\n') : '';

  openModal('slide-modal');
}

document.getElementById('add-slide-btn').addEventListener('click', () => openSlideForm(null));

document.getElementById('slide-form').addEventListener('submit', (e) => {
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
      hy: document.getElementById('sf-tagline-hy').value.trim(),
    },
    description: {
      en: document.getElementById('sf-desc-en').value.trim(),
      ru: document.getElementById('sf-desc-ru').value.trim(),
      hy: document.getElementById('sf-desc-hy').value.trim(),
    },
    notes: {
      en: document.getElementById('sf-notes-en').value.split('\n').map((s) => s.trim()).filter(Boolean),
      ru: document.getElementById('sf-notes-ru').value.split('\n').map((s) => s.trim()).filter(Boolean),
      hy: document.getElementById('sf-notes-hy').value.split('\n').map((s) => s.trim()).filter(Boolean),
    },
  };

  if (isEdit) {
    state.slides = state.slides.map((s) => (s.id === slide.id ? slide : s));
  } else {
    state.slides = [...state.slides, slide];
  }

  markDirty('slides');
  closeModal('slide-modal');
  renderSlides();
});

// =======================================================
// SITE TEXTS
// =======================================================
function renderTexts() {
  const list = document.getElementById('texts-list');
  list.innerHTML = '';

  // Defensive: older data (before Armenian was added) may not have an
  // `hy` object at all yet — treat it as empty rather than crashing.
  state.i18n.hy = state.i18n.hy || {};

  const keys = Object.keys(state.i18n.en || {});
  keys.forEach((key) => {
    const row = document.createElement('div');
    row.className = 'text-row';
    row.innerHTML = `
      <div class="text-row-key">${key}</div>
      <input type="text" data-lang="en" data-key="${key}" placeholder="EN" value="${escapeAttr(state.i18n.en[key] || '')}">
      <input type="text" data-lang="ru" data-key="${key}" placeholder="RU" value="${escapeAttr(state.i18n.ru[key] || '')}">
      <input type="text" data-lang="hy" data-key="${key}" placeholder="HY (пока пусто — покажет EN)" value="${escapeAttr(state.i18n.hy[key] || '')}">
    `;
    list.appendChild(row);
  });

  // Every keystroke updates state in-memory and marks the section dirty —
  // there's no separate "apply" step for texts, since there's nothing to
  // commit until the global Publish button is used anyway.
  list.querySelectorAll('input[data-lang]').forEach((input) => {
    input.addEventListener('input', () => {
      state.i18n[input.dataset.lang][input.dataset.key] = input.value;
      markDirty('i18n');
    });
  });
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// =======================================================
// INIT
// =======================================================
(async () => {
  const authed = await checkSession();
  if (authed) {
    await showApp();
  }
})();
