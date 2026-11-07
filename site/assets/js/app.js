/* SOMACOS — comportements communs à toutes les pages. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.body.dataset.root || '';
  const desktop = () => window.matchMedia('(min-width: 1024px)').matches;

  /* ------------------------------------------------ en-tête */
  const header = $('[data-header]');
  if (header && header.classList.contains('is-overlay')) document.body.classList.add('has-overlay-header');
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 12);
    const open = header.classList.contains('is-open') || $('.has-mega.is-open');
    header.classList.toggle('is-hidden', !open && y > 480 && y > lastY + 4);
    if (y < lastY - 4 || y < 480) header.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu mobile */
  const menuBtn = $('[data-menu-btn]');
  function setMenu(open) {
    header.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  window.addEventListener('resize', () => { if (desktop() && header.classList.contains('is-open')) setMenu(false); });

  /* méga-menu catalogue */
  const mega = $('[data-mega]');
  const trigger = $('[data-mega-trigger]');
  let hoverTimer;
  function setMega(open) {
    mega.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  }
  trigger.addEventListener('click', () => setMega(!mega.classList.contains('is-open')));
  mega.addEventListener('mouseenter', () => { if (!desktop()) return; clearTimeout(hoverTimer); hoverTimer = setTimeout(() => setMega(true), 80); });
  mega.addEventListener('mouseleave', () => { if (!desktop()) return; clearTimeout(hoverTimer); hoverTimer = setTimeout(() => setMega(false), 160); });
  document.addEventListener('click', (e) => { if (desktop() && !mega.contains(e.target)) setMega(false); });
  mega.addEventListener('focusout', (e) => { if (desktop() && !mega.contains(e.relatedTarget)) setMega(false); });

  /* recherche globale */
  const overlay = $('[data-search-overlay]');
  function setSearch(open) {
    overlay.hidden = !open;
    if (open) { setMega(false); setTimeout(() => $('input', overlay).focus(), 30); }
  }
  $('[data-search-open]').addEventListener('click', () => {
    const local = $('[data-q]');
    if (local) { local.focus(); local.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    setSearch(true);
  });
  $('[data-search-close]').addEventListener('click', () => setSearch(false));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!overlay.hidden) setSearch(false);
    if (mega.classList.contains('is-open')) { setMega(false); trigger.focus(); }
    if (header.classList.contains('is-open')) setMenu(false);
    closeLightbox();
  });

  /* ------------------------------------------------ demande de devis (stockée localement) */
  const KEY = 'somacos-devis-v2';
  const listeners = [];
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(items)) items = []; } catch (_) { items = []; }
  const keyOf = (id, ref) => `${id}|${ref || ''}`;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (_) { /* stockage indisponible : la liste reste en mémoire */ }
    listeners.forEach((fn) => fn(items));
    syncButtons(); syncBadge();
  }
  const Quote = {
    all: () => items.slice(),
    has: (id, ref) => items.some((i) => i.key === keyOf(id, ref)),
    add(it) { if (!Quote.has(it.id, it.ref)) { items.push({ key: keyOf(it.id, it.ref), qty: 1, ...it }); save(); } },
    remove(key) { items = items.filter((i) => i.key !== key); save(); },
    setQty(key, qty) { const it = items.find((i) => i.key === key); if (it) { it.qty = Math.max(1, Math.min(99999, qty | 0 || 1)); save(); } },
    clear() { items = []; save(); },
    onChange(fn) { listeners.push(fn); },
    count: () => items.length,
  };
  window.SomacosQuote = Quote;

  function syncButtons() {
    $$('[data-quote-add]').forEach((b) => b.setAttribute('aria-pressed', String(Quote.has(b.dataset.id, b.dataset.ref))));
  }
  function syncBadge() {
    $$('[data-quote-count]').forEach((b) => { b.textContent = items.length; b.hidden = items.length === 0; });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-quote-add]');
    if (!b) return;
    const { id, ref, name, img } = b.dataset;
    if (Quote.has(id, ref)) { Quote.remove(keyOf(id, ref)); toast('Retiré de votre demande de devis.'); }
    else { Quote.add({ id, ref: ref || '', name, img: img || '' }); toast(`Ajouté à votre demande de devis (${items.length}).`, true); }
  });
  syncButtons(); syncBadge();
  window.addEventListener('storage', (e) => { if (e.key === KEY) { try { items = JSON.parse(e.newValue || '[]'); } catch (_) { items = []; } listeners.forEach((fn) => fn(items)); syncButtons(); syncBadge(); } });

  /* ------------------------------------------------ toast */
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg, withLink) {
    toastEl.innerHTML = '';
    toastEl.append(document.createTextNode(msg));
    if (withLink && !location.pathname.includes('/devis')) {
      const a = document.createElement('a'); a.href = `${root}devis/`; a.textContent = 'Voir la demande'; toastEl.append(a);
    }
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  }
  window.SomacosToast = toast;

  /* ------------------------------------------------ apparition au défilement */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('is-in'));

  /* ------------------------------------------------ visionneuse d'image */
  const lb = $('[data-lightbox-panel]');
  let lbReturn;
  function closeLightbox() { if (lb && !lb.hidden) { lb.hidden = true; document.documentElement.style.overflow = ''; if (lbReturn) lbReturn.focus(); } }
  if (lb) {
    $$('[data-lightbox]').forEach((btn) => btn.addEventListener('click', () => {
      lbReturn = btn; $('img', lb).src = btn.dataset.lightbox; lb.hidden = false; document.documentElement.style.overflow = 'hidden'; $('[data-lightbox-close]', lb).focus();
    }));
    lb.addEventListener('click', closeLightbox);
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
