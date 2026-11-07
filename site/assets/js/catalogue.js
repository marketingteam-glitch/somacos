/* SOMACOS — catalogue : recherche, familles, catégories, tri et pagination. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const app = $('[data-catalogue]');
  const DATA = window.SOMACOS_CATALOGUE;
  if (!app || !DATA) return;

  const PER = Number(app.dataset.perPage) || 24;
  const grid = $('[data-grid]', app);
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[μµ]/g, 'u');
  const famById = Object.fromEntries(DATA.families.map((f) => [f.id, f]));

  // Index : carte DOM + données de recherche.
  const items = DATA.items.map(([slug, cat, refs, order, text]) => {
    const el = grid.querySelector(`[data-slug="${slug}"]`);
    const name = el ? el.querySelector('.pcard-title').textContent.trim() : slug;
    return { slug, cat, refs, order, el, name, text: norm(text), compact: norm(text).replace(/[\s\-./]/g, '') };
  }).filter((i) => i.el);

  const state = { q: '', fam: '', cats: new Set(), sort: 'default', page: 1 };

  /* --------------------------------------- lecture / écriture de l'URL */
  function readURL() {
    const p = new URLSearchParams(location.search);
    state.q = p.get('q') || '';
    state.fam = famById[p.get('famille')] ? p.get('famille') : '';
    state.cats = new Set((p.get('categorie') || '').split(',').filter((c) => DATA.cats[c]));
    state.sort = ['az', 'za', 'refs'].includes(p.get('tri')) ? p.get('tri') : 'default';
    state.page = Math.max(1, parseInt(p.get('page'), 10) || 1);
    if (state.cats.size && !state.fam) {
      const f = DATA.families.find((x) => x.cats.includes([...state.cats][0]));
      if (f) state.fam = f.id;
    }
  }
  function writeURL() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.fam) p.set('famille', state.fam);
    if (state.cats.size) p.set('categorie', [...state.cats].join(','));
    if (state.sort !== 'default') p.set('tri', state.sort);
    if (state.page > 1) p.set('page', state.page);
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : ''));
  }

  /* --------------------------------------- filtrage */
  function matches(it) {
    if (state.cats.size) { if (!state.cats.has(it.cat)) return false; }
    else if (state.fam && !famById[state.fam].cats.includes(it.cat)) return false;
    if (state.q) {
      const tokens = norm(state.q).split(/\s+/).filter(Boolean);
      return tokens.every((t) => it.text.includes(t) || it.compact.includes(t.replace(/[\-./]/g, '')));
    }
    return true;
  }
  const sorters = {
    default: (a, b) => a.order - b.order,
    az: (a, b) => a.name.localeCompare(b.name, 'fr'),
    za: (a, b) => b.name.localeCompare(a.name, 'fr'),
    refs: (a, b) => b.refs - a.refs || a.order - b.order,
  };

  /* --------------------------------------- rendu */
  const countEl = $('[data-count]', app);
  const emptyEl = $('[data-empty]', app);
  const pager = $('[data-pager]', app);
  const chips = $('[data-chips]', app);
  const q = $('[data-q]', app);
  const sortSel = $('[data-sort]', app);

  function render({ scroll = false } = {}) {
    const list = items.filter(matches).sort(sorters[state.sort]);
    const pages = Math.max(1, Math.ceil(list.length / PER));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * PER;
    const visible = new Set(list.slice(start, start + PER));

    const frag = document.createDocumentFragment();
    list.forEach((it) => frag.appendChild(it.el));
    items.forEach((it) => { if (!list.includes(it)) frag.appendChild(it.el); it.el.hidden = !visible.has(it); });
    grid.appendChild(frag);

    countEl.textContent = list.length === items.length && !state.q
      ? `${list.length} produits`
      : `${list.length} produit${list.length > 1 ? 's' : ''} sur ${items.length}`;
    emptyEl.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    renderPager(pages);
    renderFilters();
    writeURL();
    if (scroll) app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPager(pages) {
    pager.innerHTML = '';
    if (pages <= 1) return;
    const btn = (label, page, opts = {}) => {
      const b = document.createElement('button');
      b.type = 'button'; b.innerHTML = label; b.disabled = !!opts.disabled;
      if (opts.current) b.setAttribute('aria-current', 'page');
      if (opts.aria) b.setAttribute('aria-label', opts.aria);
      b.addEventListener('click', () => { state.page = page; render({ scroll: true }); });
      return b;
    };
    pager.append(btn('←', state.page - 1, { disabled: state.page === 1, aria: 'Page précédente' }));
    const nums = new Set([1, pages, state.page, state.page - 1, state.page + 1]);
    let prev = 0;
    [...nums].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b).forEach((n) => {
      if (n - prev > 1) { const s = document.createElement('span'); s.className = 'gap'; s.textContent = '…'; pager.append(s); }
      pager.append(btn(String(n), n, { current: n === state.page, aria: `Page ${n}` }));
      prev = n;
    });
    pager.append(btn('→', state.page + 1, { disabled: state.page === pages, aria: 'Page suivante' }));
  }

  function renderFilters() {
    $('.ff-all', app).setAttribute('aria-pressed', String(!state.fam && !state.cats.size));
    $$('.ff', app).forEach((li) => {
      const id = li.dataset.famGroup;
      const on = state.fam === id;
      li.classList.toggle('is-open', on);
      $('.ff-fam', li).setAttribute('aria-pressed', String(on));
      $$('[data-cat]', li).forEach((cb) => { cb.checked = state.cats.has(cb.value); });
    });
    if (document.activeElement !== q) q.value = state.q;
    sortSel.value = state.sort;
    // pastilles des filtres actifs
    chips.innerHTML = '';
    const chip = (label, onRemove) => {
      const b = document.createElement('button'); b.type = 'button';
      b.innerHTML = `${label} <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
      b.setAttribute('aria-label', `Retirer le filtre ${label}`);
      b.addEventListener('click', () => { onRemove(); state.page = 1; render(); });
      chips.append(b);
    };
    if (state.q) chip(`« ${state.q.replace(/[<>&]/g, '')} »`, () => { state.q = ''; });
    if (state.cats.size) state.cats.forEach((c) => chip(DATA.cats[c], () => state.cats.delete(c)));
    else if (state.fam) chip(famById[state.fam].name, () => { state.fam = ''; });
    const n = (state.fam || state.cats.size ? 1 : 0) + state.cats.size;
    const badge = $('[data-filters-n]', app);
    badge.textContent = state.cats.size || (state.fam ? 1 : 0);
    badge.hidden = n === 0;
  }

  /* --------------------------------------- événements */
  let t;
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { state.q = q.value.trim(); state.page = 1; render(); }, 140); });
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); q.blur(); } });
  sortSel.addEventListener('change', () => { state.sort = sortSel.value; state.page = 1; render(); });
  $('.ff-all', app).addEventListener('click', () => { state.fam = ''; state.cats.clear(); state.page = 1; render(); });
  $$('.ff-fam', app).forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.fam;
    state.cats.clear();
    state.fam = state.fam === id ? '' : id;
    state.page = 1; render();
  }));
  $$('[data-cat]', app).forEach((cb) => cb.addEventListener('change', () => {
    const fam = cb.closest('.ff').dataset.famGroup;
    if (state.fam !== fam) state.cats.clear();
    state.fam = fam;
    if (cb.checked) state.cats.add(cb.value); else state.cats.delete(cb.value);
    state.page = 1; render();
  }));
  $$('[data-reset]', app).forEach((b) => b.addEventListener('click', () => { state.q = ''; state.fam = ''; state.cats.clear(); state.sort = 'default'; state.page = 1; render(); }));

  // tiroir de filtres (mobile)
  const filters = $('[data-filters]', app);
  const openBtn = $('[data-filters-open]', app);
  function setFilters(open) {
    filters.classList.toggle('is-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) $('.ff-all', filters).focus(); else openBtn.focus();
  }
  openBtn.addEventListener('click', () => setFilters(true));
  $$('[data-filters-close]', app).forEach((b) => b.addEventListener('click', () => setFilters(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && filters.classList.contains('is-open')) setFilters(false); });

  readURL();
  render();
})();
