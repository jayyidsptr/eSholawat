/* e-Sholawat — vanilla SPA, same localStorage schema as old React build */
const APP_VER = 3;

// Cloudinary — isi cloudName + uploadPreset sendiri. Copy dari Cloudinary Dashboard > Upload Presets
// Kalo kosong, fallback ke base64 lokal (kompres jalan terus)
const CLOUDINARY = { cloudName: 'qjsgfqau', uploadPreset: 'sholawat' };

const KEYS = { sholawats: 'sholawats', user: 'user' };

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const icons = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  heartFill: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  crescent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
};

function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// skip seed — empty state + CTA. Existing users keep old localStorage.

const store = {
  list() {
    try { return JSON.parse(localStorage.getItem(KEYS.sholawats) || '[]'); }
    catch { return []; }
  },
  save(list) { localStorage.setItem(KEYS.sholawats, JSON.stringify(list)); },
  get(id) { return this.list().find((x) => x.id === id) || null; },
  add(item) {
    const list = this.list();
    const row = { ...item, id: uid(), uploadedAt: new Date().toISOString() };
    list.unshift(row);
    this.save(list);
    return row;
  },
  remove(id) {
    const next = this.list().filter((x) => x.id !== id);
    this.save(next);
    const u = this.user();
    u.bookmarks = (u.bookmarks || []).filter((b) => b !== id);
    this.saveUser(u);
  },
  user() {
    try { return JSON.parse(localStorage.getItem(KEYS.user) || '{}'); }
    catch { return { id: 'user1', name: 'Tamu', bookmarks: [] }; }
  },
  saveUser(u) { localStorage.setItem(KEYS.user, JSON.stringify(u)); },
  isBookmarked(id) { return (this.user().bookmarks || []).includes(id); },
  toggleBookmark(id) {
    const u = this.user();
    u.bookmarks = u.bookmarks || [];
    const i = u.bookmarks.indexOf(id);
    if (i >= 0) u.bookmarks.splice(i, 1);
    else u.bookmarks.push(id);
    this.saveUser(u);
    return u.bookmarks.includes(id);
  },
};

const state = {
  route: 'home',
  detailId: null,
  query: '',
  tag: 'semua',
  uploadPreview: null,
  uploadTags: [],
};

function toast(msg, type = 'ok') {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

function allTags(list) {
  const set = new Set();
  list.forEach((s) => (s.tags || []).forEach((t) => set.add(t)));
  return [...set].sort();
}

function filtered() {
  let list = store.list();
  if (state.tag !== 'semua') list = list.filter((s) => (s.tags || []).includes(state.tag));
  return list;
}

function searchResults() {
  const q = state.query.trim().toLowerCase();
  if (!q) return store.list();
  return store.list().filter((s) => {
    const hay = [s.title, s.description, s.uploadedBy, ...(s.tags || [])].join(' ').toLowerCase();
    return hay.includes(q);
  });
}

function favorites() {
  const ids = new Set(store.user().bookmarks || []);
  return store.list().filter((s) => ids.has(s.id));
}

/* routing: #/  #/search  #/bookmarks  #/upload  #/sholawat/:id */
function parseHash() {
  const raw = (location.hash || '#/').replace(/^#/, '') || '/';
  const parts = raw.split('/').filter(Boolean);
  if (!parts.length) return { route: 'home' };
  if (parts[0] === 'search') return { route: 'search' };
  if (parts[0] === 'bookmarks') return { route: 'bookmarks' };
  if (parts[0] === 'upload') return { route: 'upload' };
  if (parts[0] === 'sholawat' && parts[1]) return { route: 'detail', id: parts[1] };
  return { route: 'home' };
}

function go(path) {
  location.hash = path.startsWith('/') ? path : '/' + path;
}

function setNav(route) {
  $$('.nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.route === route);
  });
  const showNav = route !== 'detail';
  $('#bottom-nav').classList.toggle('hidden', !showNav);
  $('#app-header').classList.toggle('hidden', route === 'detail');
}

function cardHTML(s) {
  const bm = store.isBookmarked(s.id);
  const img = s.imageUrl
    ? `<img src="${escapeAttr(s.imageUrl)}" alt="${escapeAttr(s.title)}" loading="lazy" onerror="this.outerHTML='<div class=\\'placeholder\\'>${escapeAttr(s.title.slice(0, 1))}<\\/div>'">`
    : `<div class="placeholder">${escapeHtml(s.title.slice(0, 1))}</div>`;
  return `
    <article class="card-wrap">
      <a class="card" href="#/sholawat/${encodeURIComponent(s.id)}" aria-label="${escapeAttr(s.title)}">
        <div class="card-img">${img}
          <button type="button" class="card-bookmark ${bm ? 'active' : ''}" data-bm="${escapeAttr(s.id)}" aria-label="${bm ? 'Hapus dari favorit' : 'Tambah ke favorit'}">${bm ? icons.heartFill : icons.heart}</button>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(s.title)}</h3>
          <div class="card-meta">
            <span>${escapeHtml(s.uploadedBy || 'Anonim')}</span>
            ${(s.tags || []).slice(0, 1).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
      </a>
    </article>`;
}

function listHTML(s) {
  const img = s.imageUrl
    ? `<img src="${escapeAttr(s.imageUrl)}" alt="" loading="lazy">`
    : `<div class="placeholder" style="width:100%;height:100%;display:grid;place-items:center;background:var(--primary-soft);color:var(--primary);font-family:var(--display)">${escapeHtml(s.title.slice(0, 1))}</div>`;
  return `
    <a class="list-card" href="#/sholawat/${encodeURIComponent(s.id)}">
      <div class="list-thumb">${img}</div>
      <div class="list-body">
        <h3 class="list-title">${escapeHtml(s.title)}</h3>
        <div class="list-sub">${escapeHtml(s.uploadedBy || 'Anonim')} · ${formatDate(s.uploadedAt)}</div>
        <div class="list-tags">${(s.tags || []).slice(0, 3).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      </div>
      ${icons.search.replace('viewBox', 'width="18" height="18" style="color:var(--muted)" viewBox')}
    </a>`;
}

function emptyHTML(title, desc, cta) {
  return `
    <div class="state-box">
      <div class="state-icon">${icons.book}</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(desc)}</p>
      ${cta || ''}
    </div>`;
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(s = '') { return escapeHtml(s); }

function renderHome() {
  const list = filtered();
  const tags = allTags(store.list());
  const chips = ['semua', ...tags].map((t) =>
    `<button type="button" class="chip ${state.tag === t ? 'active' : ''}" data-tag="${escapeAttr(t)}">${t === 'semua' ? 'Semua' : escapeHtml(t)}</button>`
  ).join('');

  $('#page-home').innerHTML = `
    <section class="hero-strip" aria-label="Ringkasan">
      <div class="hero-kicker">Koleksi Lirik</div>
      <h1 class="hero-title">e-Sholawat</h1>
      <div class="hero-meta">
        <span>${store.list().length} sholawat</span>
        <span>${(store.user().bookmarks || []).length} favorit</span>
      </div>
    </section>
    <div class="chips" role="tablist" aria-label="Filter tag">${chips}</div>
    <div class="section-head">
      <h2 class="section-title">Sholawat Terbaru</h2>
    </div>
    ${list.length
      ? `<div class="grid">${list.map(cardHTML).join('')}</div>`
      : emptyHTML('Belum ada sholawat', 'Mulai dengan mengunggah sholawat pertama Anda.', `<a class="btn btn-primary" href="#/upload">${icons.plus} Upload</a>`)
    }`;
}

function renderSearch() {
  const list = searchResults();
  $('#page-search').innerHTML = `
    <div class="search-sticky">
      <div class="search-field">
        ${icons.search}
        <input id="q" type="search" placeholder="Cari judul, tag, atau pengunggah..." value="${escapeAttr(state.query)}" autocomplete="off" enterkeyhint="search">
        <button type="button" class="search-clear" id="q-clear" ${state.query ? '' : 'hidden'} aria-label="Hapus pencarian">${icons.x}</button>
      </div>
    </div>
    <div class="section-head">
      <h2 class="section-title">${state.query ? 'Hasil' : 'Semua Sholawat'}</h2>
      <span class="section-link">${list.length} item</span>
    </div>
    ${list.length
      ? `<div class="list">${list.map(listHTML).join('')}</div>`
      : emptyHTML('Tidak ditemukan', 'Coba kata kunci lain atau unggah sholawat baru.', '')
    }`;

  const input = $('#q');
  input?.focus({ preventScroll: true });
  input?.addEventListener('input', (e) => {
    state.query = e.target.value;
    const clear = $('#q-clear');
    if (clear) clear.hidden = !state.query;
    // re-render results only
    const box = $('#page-search .list') || $('#page-search .state-box')?.parentElement;
    const head = $('#page-search .section-head .section-link');
    const results = searchResults();
    if (head) head.textContent = results.length + ' item';
    const title = $('#page-search .section-title');
    if (title) title.textContent = state.query ? 'Hasil' : 'Semua Sholawat';
    const mount = $('#page-search');
    const oldList = mount.querySelector('.list, .state-box');
    const html = results.length
      ? `<div class="list">${results.map(listHTML).join('')}</div>`
      : emptyHTML('Tidak ditemukan', 'Coba kata kunci lain atau unggah sholawat baru.', '');
    if (oldList) oldList.outerHTML = html;
    else mount.insertAdjacentHTML('beforeend', html);
  });
  $('#q-clear')?.addEventListener('click', () => {
    state.query = '';
    renderSearch();
  });
}

function renderBookmarks() {
  const list = favorites();
  $('#page-bookmarks').innerHTML = `
    <div class="section-head">
      <h2 class="section-title">Sholawat Favorit</h2>
      <span class="section-link">${list.length}</span>
    </div>
    ${list.length
      ? `<div class="grid">${list.map(cardHTML).join('')}</div>`
      : emptyHTML('Belum ada favorit', 'Tekan ikon hati pada sholawat untuk menambahkannya.', `<a class="btn btn-secondary" href="#/">Jelajahi</a>`)
    }`;
}

function renderUpload() {
  const tags = state.uploadTags.map((t) =>
    `<span class="tag-pill">${escapeHtml(t)} <button type="button" data-rm-tag="${escapeAttr(t)}" aria-label="Hapus tag">${icons.x}</button></span>`
  ).join('');

  $('#page-upload').innerHTML = `
    <div class="section-head"><h2 class="section-title">Upload Sholawat</h2></div>
    <form class="form" id="upload-form" novalidate>
      <div class="field">
        <label>Foto Lirik Sholawat <span class="req">*</span></label>
        <div class="drop" id="drop">
          <input type="file" id="file" accept="image/*" aria-label="Pilih foto">
          <div class="drop-inner" id="drop-inner">
            ${state.uploadPreview
              ? `<img class="drop-preview" src="${escapeAttr(state.uploadPreview)}" alt="Preview">`
              : `${icons.image}<strong>Klik untuk memilih foto</strong><span>JPG, PNG, atau GIF</span>`
            }
          </div>
        </div>
      </div>
      <div class="field">
        <label for="title">Judul Sholawat <span class="req">*</span></label>
        <input type="text" id="title" placeholder="Contoh: Ya Habibal Qolbi" required maxlength="120">
      </div>
      <div class="field">
        <label for="uploader">Nama Pengunggah <span class="req">*</span></label>
        <input type="text" id="uploader" placeholder="Masukkan nama Anda" value="${escapeAttr(store.user().name || '')}" required maxlength="60">
      </div>
      <div class="field">
        <label for="desc">Deskripsi (Opsional)</label>
        <textarea id="desc" placeholder="Deskripsi singkat tentang sholawat ini" maxlength="500"></textarea>
      </div>
      <div class="field">
        <label for="tag-in">Tag (Opsional — maks. 5)</label>
        <input type="text" id="tag-in" placeholder="Ketik tag lalu Enter">
        <div class="tag-input-row" id="tag-row">${tags}</div>
      </div>
      <div class="form-error hidden" id="form-error"></div>
      <button type="submit" class="btn btn-primary btn-block" id="submit-btn">${icons.plus} Simpan Sholawat</button>
    </form>`;

  const drop = $('#drop');
  const file = $('#file');
  file?.addEventListener('change', () => handleFile(file.files?.[0]));
  drop?.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
  drop?.addEventListener('dragleave', () => drop.classList.remove('drag'));
  drop?.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('drag');
    handleFile(e.dataTransfer.files?.[0]);
  });

  $('#tag-in')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const v = e.target.value.trim().toLowerCase().replace(/,/g, '');
      if (v && !state.uploadTags.includes(v) && state.uploadTags.length < 5) {
        state.uploadTags.push(v);
        e.target.value = '';
        renderUpload();
        $('#title').value = $('#title')?.value; // keep? re-render wipes — capture below better
      }
    }
  });

  // preserve fields across tag re-render is painful; use event delegation for remove only without full re-render
  $('#tag-row')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-rm-tag]');
    if (!btn) return;
    state.uploadTags = state.uploadTags.filter((t) => t !== btn.dataset.rmTag);
    btn.parentElement.remove();
  });

  $('#upload-form')?.addEventListener('submit', onUploadSubmit);
}

async function compressImage(dataUrl, maxW = 1200) {
  const img = await new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = j; i.src = dataUrl; });
  let { width: w, height: h } = img;
  if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
  if (h > maxW) { w = Math.round(w * maxW / h); h = maxW; }
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  // WebP; fallback JPEG kalo browser gak support
  const type = c.toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
  return new Promise((r) => c.toBlob(r, type, 0.7));
}

async function uploadToCloudinary(blob) {
  if (!CLOUDINARY.cloudName || !CLOUDINARY.uploadPreset) return null;
  const fd = new FormData();
  fd.append('file', blob, 'image.webp');
  fd.append('upload_preset', CLOUDINARY.uploadPreset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) return null;
  const j = await res.json();
  return j.secure_url || null;
}

function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showFormError('File harus berupa gambar');
    return;
  }
  if (file.size > 4 * 1024 * 1024) {
    showFormError('Gambar besar (>4MB). Pertimbangkan kompres agar penyimpanan tidak penuh.');
  } else {
    hideFormError();
  }
  const reader = new FileReader();
  reader.onload = async () => {
    // kompres
    const blob = await compressImage(reader.result);
    if (blob) {
      // simpan compressed version instead
      const r = new FileReader();
      r.onload = () => {
        state.uploadPreview = r.result;
        const inner = $('#drop-inner');
        if (inner) inner.innerHTML = `<img class="drop-preview" src="${r.result}" alt="Preview">`;
      };
      r.readAsDataURL(blob);
      state._compressedBlob = blob;
    } else {
      state.uploadPreview = reader.result;
      state._compressedBlob = null;
      const inner = $('#drop-inner');
      if (inner) inner.innerHTML = `<img class="drop-preview" src="${reader.result}" alt="Preview">`;
    }
  };
  reader.readAsDataURL(file);
}

function showFormError(msg) {
  const el = $('#form-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}
function hideFormError() {
  $('#form-error')?.classList.add('hidden');
}

async function onUploadSubmit(e) {
  e.preventDefault();
  const title = $('#title')?.value.trim();
  const uploadedBy = $('#uploader')?.value.trim();
  const description = $('#desc')?.value.trim();
  if (!state.uploadPreview || !title || !uploadedBy) {
    showFormError('Harap isi semua bidang yang diperlukan');
    return;
  }
  hideFormError();
  const btn = $('#submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }
  try {
    // coba Cloudinary dulu; offline/gagal → base64 lokal
    let imageUrl = state.uploadPreview;
    if (navigator.onLine && CLOUDINARY.cloudName) {
      if (btn) btn.textContent = 'Upload ke cloud...';
      const blob = state._compressedBlob
        || await compressImage(state.uploadPreview);
      if (blob) {
        const url = await uploadToCloudinary(blob);
        if (url) imageUrl = url;
      }
    }
    const u = store.user();
    u.name = uploadedBy;
    store.saveUser(u);
    const row = store.add({
      title,
      imageUrl,
      description,
      tags: [...state.uploadTags],
      uploadedBy,
    });
    state.uploadPreview = null;
    state._compressedBlob = null;
    state.uploadTags = [];
    toast(imageUrl.startsWith('http') ? 'Disimpan ke cloud' : 'Disimpan lokal');
    go('/sholawat/' + row.id);
  } catch (err) {
    console.error(err);
    showFormError(err?.name === 'QuotaExceededError'
      ? 'Penyimpanan penuh. Hapus beberapa sholawat dulu.'
      : 'Gagal mengunggah sholawat. Silakan coba lagi.');
    if (btn) { btn.disabled = false; btn.innerHTML = `${icons.plus} Simpan Sholawat`; }
  }
}

function openFS(src, alt) {
  if (!src) return;
  const d = document.createElement('div');
  d.className = 'fs-overlay';
  d.innerHTML = `<button type="button" class="fs-close" aria-label="Tutup">${icons.x}</button><img src="${escapeAttr(src)}" alt="${escapeAttr(alt || '')}">`;
  d.addEventListener('click', (e) => { if (e.target === d) d.remove(); });
  d.querySelector('.fs-close')?.addEventListener('click', () => d.remove());
  document.body.appendChild(d);
}

function renderDetail() {
  const s = store.get(state.detailId);
  const page = $('#page-detail');
  if (!s) {
    page.innerHTML = `
      <div class="main" style="padding-top:24px">
        ${emptyHTML('Sholawat tidak ditemukan', 'Item mungkin sudah dihapus.', `<a class="btn btn-primary" href="#/">Kembali ke Beranda</a>`)}
      </div>`;
    return;
  }
  const bm = store.isBookmarked(s.id);
  const img = s.imageUrl
    ? `<img src="${escapeAttr(s.imageUrl)}" alt="${escapeAttr(s.title)}" data-fs="${escapeAttr(s.imageUrl)}" onerror="this.outerHTML='<div class=\\'placeholder\\' style=\\'min-height:280px;display:grid;place-items:center;font-family:var(--display);font-size:3rem;color:var(--primary);background:linear-gradient(160deg,var(--primary-soft),var(--accent-soft))\\'>${escapeAttr(s.title.slice(0, 1))}<\\/div>'">`
    : `<div class="placeholder" style="min-height:280px;display:grid;place-items:center;font-family:var(--display);font-size:3rem;color:var(--primary);background:linear-gradient(160deg,var(--primary-soft),var(--accent-soft))">${escapeHtml(s.title.slice(0, 1))}</div>`;

  page.innerHTML = `
    <div class="detail-hero">
      ${img}
      <div class="detail-hero-actions">
        <button type="button" class="icon-btn" id="btn-back" aria-label="Kembali">${icons.back}</button>
        <div style="display:flex;gap:8px">
          <button type="button" class="icon-btn ${bm ? 'active' : ''}" id="btn-bm" aria-label="${bm ? 'Hapus dari favorit' : 'Tambah ke favorit'}">${bm ? icons.heartFill : icons.heart}</button>
          <button type="button" class="icon-btn" id="btn-share" aria-label="Bagikan">${icons.share}</button>
        </div>
      </div>
    </div>
    <div class="detail-content">
      <h1 class="detail-title">${escapeHtml(s.title)}</h1>
      <div class="detail-tags">${(s.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('') || '<span class="tag">umum</span>'}</div>
      <div class="detail-meta-card">
        <div class="detail-meta-row"><span class="label">Pengunggah</span><span>${escapeHtml(s.uploadedBy || 'Anonim')}</span></div>
        <div class="detail-meta-row"><span class="label">Tanggal</span><span>${formatDate(s.uploadedAt)}</span></div>
      </div>
      ${s.description ? `<p class="detail-desc">${escapeHtml(s.description)}</p>` : ''}
      <div class="detail-actions">
        <button type="button" class="btn btn-secondary" id="btn-bm2">${bm ? icons.heartFill : icons.heart} ${bm ? 'Favorit' : 'Favoritkan'}</button>
        <button type="button" class="btn btn-secondary" id="btn-share2">${icons.share} Bagikan</button>
      </div>
      <button type="button" class="btn btn-ghost btn-block" id="btn-del" style="color:var(--danger)">${icons.trash} Hapus Sholawat</button>
    </div>`;

  $('#btn-back')?.addEventListener('click', () => history.length > 1 ? history.back() : go('/'));
  const toggleBm = () => {
    const on = store.toggleBookmark(s.id);
    toast(on ? 'Ditambah ke favorit' : 'Dihapus dari favorit');
    renderDetail();
  };
  $('#btn-bm')?.addEventListener('click', toggleBm);
  $('#btn-bm2')?.addEventListener('click', toggleBm);
  const share = async () => {
    const data = { title: `Sholawat: ${s.title}`, text: `Lihat lirik sholawat ${s.title} di e-Sholawat`, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        toast('Tautan disalin');
      }
    } catch { /* user cancel */ }
  };
  $('#btn-share')?.addEventListener('click', share);
  $('#btn-share2')?.addEventListener('click', share);
  $('#btn-del')?.addEventListener('click', () => confirmDelete(s));
}

function confirmDelete(s) {
  const backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  backdrop.innerHTML = `
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <h3 id="dlg-title">Hapus Sholawat</h3>
      <p>Apakah Anda yakin ingin menghapus “${escapeHtml(s.title)}”? Tindakan ini tidak dapat dibatalkan.</p>
      <div class="dialog-actions">
        <button type="button" class="btn btn-secondary" id="dlg-cancel">Batal</button>
        <button type="button" class="btn btn-danger" id="dlg-ok">Hapus</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  $('#dlg-cancel', backdrop).onclick = close;
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  $('#dlg-ok', backdrop).onclick = () => {
    store.remove(s.id);
    close();
    toast('Sholawat telah dihapus');
    go('/');
  };
}

function render() {
  const r = parseHash();
  state.route = r.route;
  state.detailId = r.id || null;

  $$('.page').forEach((p) => p.classList.remove('active'));
  const map = { home: 'page-home', search: 'page-search', bookmarks: 'page-bookmarks', upload: 'page-upload', detail: 'page-detail' };
  const id = map[r.route] || 'page-home';
  $(`#${id}`)?.classList.add('active');
  setNav(r.route === 'detail' ? '' : r.route);

  if (r.route === 'home') renderHome();
  else if (r.route === 'search') renderSearch();
  else if (r.route === 'bookmarks') renderBookmarks();
  else if (r.route === 'upload') {
    // reset form draft only when entering fresh? keep preview if same session
    renderUpload();
  } else if (r.route === 'detail') renderDetail();
  else renderHome();

  window.scrollTo(0, 0);
}

function bindGlobal() {
  $('#bottom-nav')?.addEventListener('click', (e) => {
    const item = e.target.closest('.nav-item');
    if (!item) return;
    const routes = { home: '/', search: '/search', bookmarks: '/bookmarks', upload: '/upload' };
    go(routes[item.dataset.route] || '/');
  });

  document.addEventListener('click', (e) => {
    const bm = e.target.closest('[data-bm]');
    if (bm) {
      e.preventDefault();
      e.stopPropagation();
      const on = store.toggleBookmark(bm.dataset.bm);
      toast(on ? 'Ditambah ke favorit' : 'Dihapus dari favorit');
      // refresh current view
      render();
      return;
    }
    const tag = e.target.closest('[data-tag]');
    if (tag) {
      state.tag = tag.dataset.tag;
      renderHome();
    }
    // click image → fullscreen preview
    const imgTarget = e.target.closest('.card-img img, .list-thumb img, [data-fs]');
    if (imgTarget && !e.target.closest('[data-bm]')) {
      e.preventDefault();
      openFS(imgTarget.src || imgTarget.dataset.fs, imgTarget.alt);
    }
  });

  window.addEventListener('hashchange', render);
  window.addEventListener('scroll', () => {
    $('#app-header')?.classList.toggle('scrolled', scrollY > 8);
  }, { passive: true });
}

function boot() {
  // version change → nuke old caches
  if (localStorage.getItem('app-ver') !== String(APP_VER)) {
    if ('caches' in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
    if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    localStorage.setItem('app-ver', String(APP_VER));
  }
  // ensure user obj exists
  if (!localStorage.getItem(KEYS.user))
    localStorage.setItem(KEYS.user, JSON.stringify({ id: 'user1', name: 'Tamu', bookmarks: [] }));
  bindGlobal();
  // brand mark
  $('.brand-mark').innerHTML = icons.crescent;
  render();
  // reload float
  const rl = $('#btn-reload');
  if (rl) rl.addEventListener('click', () => {
    // hard refresh — nuke SW + caches
    const promises = [];
    if ('serviceWorker' in navigator) promises.push(navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())));
    if ('caches' in window) promises.push(caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))));
    Promise.all(promises).finally(() => location.reload());
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
}

boot();
