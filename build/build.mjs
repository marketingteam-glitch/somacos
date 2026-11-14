// Générateur statique du site SOMACOS — aucune dépendance (Node.js 18+).
// Usage : node build/build.mjs   →   génère les pages HTML dans le dossier site/ (prêt à être mis en ligne).
// Les fichiers statiques (assets/, api/, .htaccess) sont édités directement dans site/ ; les pages HTML,
// le sitemap et assets/js/catalogue-data.js sont régénérés à chaque build — ne pas les modifier à la main.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { displayName } from './format.mjs';
import {
  SITE, HOME_INTRO, HOME_PARTNER, ABOUT, VALUES, SERVICES, PROCESS, PARTNERS,
  CATEGORIES, FAMILIES, PHOTO_CREDITS, FEATURED,
} from './site.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'site');
const GENERATED = ['index.html', '404.html', 'sitemap.xml', 'robots.txt', 'assets/js/catalogue-data.js',
  'a-propos', 'services', 'contact', 'devis', 'catalogue', 'categories', 'produits'];
const PER_PAGE = 24;

// ---------------------------------------------------------------- données
const raw = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'products.json'), 'utf8'));
const famOf = {};
FAMILIES.forEach((f) => f.cats.forEach((c) => { famOf[c] = f; }));

const products = raw.map((p) => {
  const rows = p.tables.flatMap((t) => t.rows);
  const head = p.tables[0]?.head?.length ? p.tables[0].head : ['CODE', 'ARTICLES'];
  return {
    ...p,
    display: displayName(p.name),
    family: famOf[p.cat],
    catInfo: CATEGORIES[p.cat],
    rows,
    head,
    refCount: rows.length,
  };
});
const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
const catCount = (c) => products.filter((p) => p.cat === c).length;
const famCount = (f) => products.filter((p) => p.family.id === f.id).length;
const TOTAL_REFS = products.reduce((n, p) => n + p.refCount, 0);
const TOTAL_CATS = Object.keys(CATEGORIES).filter((c) => c !== 'uncategorized').length;

// ---------------------------------------------------------------- utilitaires
const e = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
const famImage = (f) => {
  if (f.image && bySlug[f.image]) return bySlug[f.image].img;
  // Image représentative : premier produit de la famille ayant le plus de références.
  const list = products.filter((p) => p.family.id === f.id).sort((a, b) => b.refCount - a.refCount);
  return list[0].img;
};
const catImage = (c) => products.filter((p) => p.cat === c).sort((a, b) => b.refCount - a.refCount)[0].img;
const shortDesc = (p) => {
  if (p.desc.length && typeof p.desc[0] === 'string') return p.desc[0];
  if (!p.refCount) return 'Références et dimensions sur demande.';
  const first = p.rows[0][0];
  return `${plural(p.refCount, 'référence disponible', 'références disponibles')} · réf. ${first}${p.refCount > 1 ? '…' : ''}`;
};

function write(rel, html) {
  const out = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

// ---------------------------------------------------------------- icônes (SVG inline)
const I = {
  arrow: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  arrowUpRight: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  chevron: '<svg class="i i-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  search: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  plus: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
  close: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  phone: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  mail: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>',
  pin: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  list: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  filter: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  zoom: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>',
};

const LOGO = `<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4c7 9.2 11 15.4 11 21a11 11 0 0 1-22 0C9 19.4 13 13.2 20 4z" fill="currentColor"/><path d="M14.5 26.5c1.6 3 5.4 4.3 8.6 2.8" fill="none" stroke="var(--logo-cut)" stroke-width="2.2" stroke-linecap="round"/></svg>`;

// ---------------------------------------------------------------- gabarit commun
function header(rel, active, mode) {
  const nav = [
    ['', 'Accueil', 'home'],
    ['a-propos/', 'À propos', 'about'],
  ];
  const mega = FAMILIES.map((f) => `
        <div class="mega-col">
          <a class="mega-fam" href="${rel}catalogue/?famille=${f.id}">${e(f.name)} <span>${famCount(f)}</span></a>
          <ul>${f.cats.map((c) => `<li><a href="${rel}categories/${c}/">${e(CATEGORIES[c].short)}</a></li>`).join('')}</ul>
        </div>`).join('');
  const link = ([href, label, key]) => `<li><a class="nav-link${active === key ? ' is-active' : ''}" href="${rel}${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a></li>`;
  return `
<a class="skip" href="#main">Aller au contenu</a>
<header class="site-header${mode === 'overlay' ? ' is-overlay' : ''}" data-header>
  <div class="wrap header-row">
    <a class="logo" href="${rel}" aria-label="${e(SITE.legalName)}">${LOGO}<span class="logo-type"><b>${e(SITE.legalName)}</b></span></a>
    <nav class="main-nav" id="main-nav" aria-label="Navigation principale" data-nav>
      <ul class="nav-list">
        ${nav.map(link).join('')}
        <li class="has-mega" data-mega>
          <button class="nav-link mega-trigger${active === 'catalogue' ? ' is-active' : ''}" type="button" aria-expanded="false" aria-controls="mega-catalogue" data-mega-trigger>Catalogue ${I.chevron}</button>
          <div class="mega" id="mega-catalogue" data-mega-panel>
            <div class="wrap mega-inner">
              <div class="mega-intro">
                <p class="eyebrow">Catalogue</p>
                <p class="mega-title">${products.length} produits, ${TOTAL_CATS} catégories.</p>
                <a class="btn btn-primary btn-sm" href="${rel}catalogue/">Tout le catalogue ${I.arrow}</a>
                <a class="link-arrow" href="${rel}categories/">Toutes les catégories ${I.arrow}</a>
              </div>
              <div class="mega-grid">${mega}</div>
            </div>
          </div>
        </li>
        ${link(['services/', 'Services', 'services'])}
        ${link(['contact/', 'Contact', 'contact'])}
      </ul>
      <div class="nav-mobile-extra">
        <a class="btn btn-primary" href="${rel}devis/">Demande de devis</a>
        <p>${SITE.phones.map((p) => `<a href="${p.href}">${p.label}</a>`).join('<br>')}</p>
      </div>
    </nav>
    <div class="header-actions">
      <button class="icon-btn" type="button" aria-label="Rechercher un produit" data-search-open>${I.search}</button>
      <a class="btn btn-primary btn-sm header-cta" href="${rel}devis/">Devis <span class="quote-badge" data-quote-count hidden>0</span></a>
      <button class="icon-btn menu-btn" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="main-nav" data-menu-btn><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="search-overlay" data-search-overlay hidden>
  <form class="wrap search-form" action="${rel}catalogue/" method="get" role="search">
    <label class="sr-only" for="global-search">Rechercher dans le catalogue</label>
    ${I.search}
    <input id="global-search" name="q" type="search" placeholder="Rechercher un produit, une référence (ex. TE9000020)…" autocomplete="off">
    <button class="btn btn-primary" type="submit">Rechercher</button>
    <button class="icon-btn" type="button" aria-label="Fermer la recherche" data-search-close>${I.close}</button>
  </form>
</div>`;
}

function footer(rel) {
  const cols = FAMILIES.slice(0, 8).map((f) => `<li><a href="${rel}catalogue/?famille=${f.id}">${e(f.name)}</a></li>`).join('');
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="logo logo-light" href="${rel}">${LOGO}<span class="logo-type"><b>${e(SITE.legalName)}</b></span></a>
        <p>Distribution de matériel agricole et d’irrigation, revêtement de bassins, étude et réalisation de projets d’irrigation.</p>
        <a class="btn btn-lime btn-sm" href="${rel}devis/">Demander un devis ${I.arrow}</a>
      </div>
      <nav class="footer-col" aria-label="Pages"><h2>Pages</h2><ul>
        <li><a href="${rel}">Accueil</a></li><li><a href="${rel}a-propos/">À propos</a></li><li><a href="${rel}catalogue/">Catalogue</a></li>
        <li><a href="${rel}categories/">Catégories</a></li><li><a href="${rel}services/">Services</a></li><li><a href="${rel}contact/">Contact</a></li><li><a href="${rel}devis/">Demande de devis</a></li></ul></nav>
      <nav class="footer-col" aria-label="Familles de produits"><h2>Produits</h2><ul>${cols}</ul></nav>
      <div class="footer-col"><h2>Contact</h2>
        <address>${SITE.address.map(e).join('<br>')}</address>
        <ul class="footer-contact">
          ${SITE.phones.map((p) => `<li><a href="${p.href}">${p.label}</a></li>`).join('')}
          ${SITE.emails.map((m) => `<li><a href="mailto:${m}">${m}</a></li>`).join('')}
        </ul>
        <p class="footer-hours">${SITE.hours.map(([d, h]) => `${d} · ${h}`).join('<br>')}</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <span data-year>2026</span> ${e(SITE.legalName)}</p>
      <details class="credits"><summary>Crédits photos</summary>
        <p>Photographies produits : SOMACOS. Photographies d’ambiance via Wikimedia Commons : ${PHOTO_CREDITS.map((c) => `<a href="${c.url}" rel="noopener" target="_blank">${e(c.title)}</a> — ${e(c.author)} (${c.license})`).join(' · ')}.</p>
      </details>
    </div>
  </div>
</footer>`;
}

function page({ rel, file, title, description, active, headerMode = 'solid', body, jsonld = [], scripts = [], bodyClass = '', image }) {
  const canonical = SITE.url + '/' + file.replace(/index\.html$/, '');
  const fullTitle = title ? `${title} — ${SITE.legalName}` : `${SITE.legalName} — Matériel d’irrigation agricole à Meknès`;
  const og = image ? `${SITE.url}/${image}` : `${SITE.url}/assets/img/photos/hero-drip-1100.webp`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${e(fullTitle)}</title>
<meta name="description" content="${e(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_MA">
<meta property="og:site_name" content="${e(SITE.legalName)}">
<meta property="og:title" content="${e(fullTitle)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta name="theme-color" content="#0d3a2c">
<link rel="icon" href="${rel}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${rel}assets/fonts/schibsted-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel}assets/css/styles.css">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body class="${bodyClass}" data-root="${rel}">
${header(rel, active, headerMode)}
<main id="main">
${body}
</main>
${footer(rel)}
<div class="toast" data-toast role="status" aria-live="polite"></div>
<script src="${rel}assets/js/config.js"></script>
<script src="${rel}assets/js/app.js" defer></script>
${scripts.map((s) => `<script src="${rel}${s}" defer></script>`).join('\n')}
</body>
</html>`;
}

// ---------------------------------------------------------------- composants
const picture = (rel, name, alt, { sizes = '100vw', cls = '', eager = false, widths = [700, 1100, 1920] } = {}) =>
  `<img class="${cls}" src="${rel}assets/img/photos/${name}-1100.webp" srcset="${widths.map((w) => `${rel}assets/img/photos/${name}-${w}.webp ${w}w`).join(', ')}" sizes="${sizes}" alt="${e(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

function productCard(rel, p, { lazy = true } = {}) {
  return `<article class="pcard" data-slug="${p.slug}">
  <a class="pcard-media" href="${rel}produits/${p.slug}/" tabindex="-1" aria-hidden="true"><img src="${rel}assets/img/products/${p.img}-sm.webp" width="560" height="560" alt="" ${lazy ? 'loading="lazy"' : ''} decoding="async"></a>
  <div class="pcard-body">
    <p class="pcard-cat">${e(p.catInfo.short)}</p>
    <h3 class="pcard-title"><a href="${rel}produits/${p.slug}/">${e(p.display)}</a></h3>
    <p class="pcard-desc">${e(shortDesc(p))}</p>
    <div class="pcard-actions">
      <a class="link-arrow" href="${rel}produits/${p.slug}/">Voir le produit ${I.arrow}</a>
      <button class="quote-toggle" type="button" data-quote-add data-id="${p.slug}" data-img="${p.img}" data-name="${e(p.name)}" aria-pressed="false"><span class="q-off">${I.plus} Devis</span><span class="q-on">${I.check} Ajouté</span></button>
    </div>
  </div>
</article>`;
}

const breadcrumb = (rel, items) => `<nav class="breadcrumb" aria-label="Fil d’Ariane"><ol>${items.map(([href, label], i) => i === items.length - 1 ? `<li aria-current="page">${e(label)}</li>` : `<li><a href="${rel}${href}">${e(label)}</a></li>`).join('')}</ol></nav>`;
const breadcrumbLd = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([href, label], i) => ({ '@type': 'ListItem', position: i + 1, name: label, item: `${SITE.url}/${href}` })) });

function pageHero(rel, { eyebrow, title, lead, crumbs, photo, alt, aside = '' }) {
  return `<section class="page-hero${photo ? ' has-photo' : ''}">
  ${photo ? `<div class="page-hero-media">${picture(rel, photo, alt, { eager: true })}</div>` : ''}
  <div class="wrap page-hero-inner">
    ${crumbs ? breadcrumb(rel, crumbs) : ''}
    <p class="eyebrow">${eyebrow}</p>
    <h1 class="page-title">${title}</h1>
    ${lead ? `<p class="page-lead">${lead}</p>` : ''}
    ${aside}
  </div>
</section>`;
}

const ctaBand = (rel) => `<section class="cta-band">
  <div class="cta-band-media">${picture(rel, 'field-sprinklers', 'Champ irrigué par aspersion', { sizes: '100vw' })}</div>
  <div class="wrap cta-band-inner reveal">
    <p class="eyebrow eyebrow-light">Votre projet</p>
    <h2 class="display-2">Parlons de votre installation d’irrigation.</h2>
    <p>${e(HOME_PARTNER)}</p>
    <div class="btn-row">
      <a class="btn btn-lime" href="${rel}devis/">Demander un devis ${I.arrow}</a>
      <a class="btn btn-ghost-light" href="${rel}contact/">Nous contacter</a>
    </div>
  </div>
</section>`;

const partnerStrip = (rel) => `<section class="partners" aria-labelledby="partners-title">
  <div class="wrap">
    <div class="partners-head reveal"><p class="eyebrow" id="partners-title">Nos marques</p><p>Le matériel des meilleurs fabricants mondiaux.</p></div>
    <ul class="partners-list reveal">${PARTNERS.map((pt) => `<li><img src="${rel}assets/img/partners/${pt.file}.webp" alt="${e(pt.name)}" loading="lazy" decoding="async"></li>`).join('')}</ul>
  </div>
</section>`;

// ---------------------------------------------------------------- pages
const ORG_LD = {
  '@context': 'https://schema.org', '@type': 'Organization', name: SITE.name, legalName: SITE.legalName, url: SITE.url,
  email: SITE.emails[0], telephone: SITE.phones.map((p) => p.href.replace('tel:', '')),
  address: { '@type': 'PostalAddress', streetAddress: `${SITE.address[0]}, ${SITE.address[1]}`, addressLocality: 'Meknès', addressCountry: 'MA' },
};

function home() {
  const rel = '';
  const featured = FEATURED.map((s) => bySlug[s]).filter(Boolean);
  const body = `
<section class="hero">
  <div class="hero-media">${picture(rel, 'hero-drip', 'Lignes de goutte-à-goutte dans une culture maraîchère', { eager: true })}</div>
  <div class="wrap hero-inner">
    <p class="eyebrow eyebrow-light hero-eyebrow">${e(SITE.legalName)} · Meknès</p>
    <h1 class="hero-title"><span class="line">L’irrigation agricole,</span> <span class="line">de l’étude</span> <span class="line"><em>à la parcelle.</em></span></h1>
    <p class="hero-lead">${e(HOME_INTRO)}</p>
    <div class="btn-row hero-actions">
      <a class="btn btn-lime btn-lg" href="${rel}catalogue/">Découvrir nos produits ${I.arrow}</a>
      <a class="btn btn-ghost-light btn-lg" href="${rel}contact/">Nous contacter</a>
    </div>
  </div>
  <div class="hero-facts">
    <div class="wrap hero-facts-row">
      <div><b>12 ans</b><span>d’expérience dans l’irrigation agricole</span></div>
      <div><b>${products.length}</b><span>produits au catalogue</span></div>
      <div><b>${TOTAL_REFS}</b><span>références et dimensions</span></div>
      <div><b>${PARTNERS.length}</b><span>marques de fabricants</span></div>
    </div>
  </div>
</section>

<section class="section intro">
  <div class="wrap intro-grid">
    <div class="reveal">
      <p class="eyebrow">La société</p>
      <h2 class="display-2">Commerce et service, sous un même toit.</h2>
    </div>
    <div class="intro-text reveal">
      <p class="lead">${e(ABOUT[0])}</p>
      <p>${e(ABOUT[1])}</p>
      <a class="link-arrow" href="${rel}a-propos/">Découvrir la société ${I.arrow}</a>
    </div>
  </div>
</section>

<section class="section section-paper" aria-labelledby="cat-title">
  <div class="wrap">
    <div class="section-head reveal">
      <div><p class="eyebrow">Catégories</p><h2 class="display-2" id="cat-title">De la vanne au goutteur.</h2></div>
      <p>Les ${TOTAL_CATS} catégories du catalogue SOMACOS, regroupées en ${FAMILIES.length} familles.</p>
    </div>
    <div class="fam-grid">
      ${FAMILIES.map((f, i) => `<a class="fam-tile reveal" href="${rel}catalogue/?famille=${f.id}" style="--d:${(i % 4) * 60}ms">
        <span class="fam-index">${String(i + 1).padStart(2, '0')}</span>
        <span class="fam-media"><img src="${rel}assets/img/products/${famImage(f)}-sm.webp" width="560" height="560" alt="" loading="lazy" decoding="async"></span>
        <span class="fam-body"><span class="fam-name">${e(f.name)}</span><span class="fam-count">${plural(famCount(f), 'produit', 'produits')}</span>
        <span class="fam-subs">${f.cats.map((c) => e(CATEGORIES[c].short)).join(' · ')}</span></span>
        <span class="fam-go">${I.arrowUpRight}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="feat-title">
  <div class="wrap">
    <div class="section-head reveal">
      <div><p class="eyebrow">Sélection</p><h2 class="display-2" id="feat-title">Produits à la une.</h2></div>
      <a class="btn btn-outline" href="${rel}catalogue/">Voir les ${products.length} produits ${I.arrow}</a>
    </div>
    <div class="pgrid pgrid-4 reveal">${featured.map((p) => productCard(rel, p)).join('')}</div>
  </div>
</section>

<section class="section section-forest services-home" aria-labelledby="srv-title">
  <div class="wrap services-home-grid">
    <div class="services-home-media reveal">${picture(rel, 'pivot', 'Rampe d’irrigation pivot dans un champ', { sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
    <div>
      <div class="reveal"><p class="eyebrow eyebrow-light">Services</p><h2 class="display-2" id="srv-title">Votre partenaire, de l’étude au suivi.</h2></div>
      <ol class="srv-list">
        ${SERVICES.map((s, i) => `<li class="reveal"><span class="srv-n">${String(i + 1).padStart(2, '0')}</span><div><h3>${e(s.title)}</h3><p>${e(s.text)}</p></div></li>`).join('')}
      </ol>
      <a class="btn btn-lime reveal" href="${rel}services/">Nos services ${I.arrow}</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="why-title">
  <div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">Pourquoi SOMACOS</p><h2 class="display-2" id="why-title">Une expertise reconnue dans tout le Maroc.</h2></div></div>
    <div class="why-grid">
      <div class="why reveal"><b class="why-k">12 ans</b><h3>D’expérience</h3><p>Une expérience de 12 ans dans l’irrigation agricole.</p></div>
      <div class="why reveal"><b class="why-k">${PARTNERS.length}</b><h3>Marques de fabricants</h3><p>Des systèmes d’irrigation qui proviennent des meilleurs fabricants mondiaux.</p></div>
      <div class="why reveal"><b class="why-k">Ingénieurs</b><h3>À vos côtés</h3><p>Expertise, solutions techniques adaptées, mise en œuvre et suivi de vos installations.</p></div>
      <div class="why reveal"><b class="why-k">Équipe</b><h3>Technico-commerciale</h3><p>Des vendeurs et technico-commerciaux confirmés, informés des nouveaux produits et services.</p></div>
      <div class="why reveal"><b class="why-k">Maroc</b><h3>Une qualité reconnue</h3><p>Des produits et services reconnus dans tout le Maroc pour leur qualité et leur expertise.</p></div>
      <div class="why reveal"><b class="why-k">${TOTAL_REFS}</b><h3>Références</h3><p>${products.length} produits et ${TOTAL_REFS} références, de la micro-irrigation au revêtement de bassins.</p></div>
    </div>
  </div>
</section>

${partnerStrip(rel)}
${ctaBand(rel)}`;
  write('index.html', page({ rel, file: 'index.html', title: '', active: 'home', headerMode: 'overlay', bodyClass: 'page-home',
    description: 'SOCIETE MAROCAINE DE COMMERCE ET SERVICE SARL.AU (SOMACOS SARL.AU) à Meknès : distribution de matériel agricole et d’irrigation, revêtement de bassins, étude et réalisation de projets d’irrigation.',
    body, jsonld: [ORG_LD] }));
}

function about() {
  const rel = '../';
  const body = `
${pageHero(rel, { eyebrow: 'À propos', title: 'SOCIETE MAROCAINE DE COMMERCE ET SERVICE SARL.AU', crumbs: [['', 'Accueil'], ['a-propos/', 'À propos']], photo: 'olive-grove', alt: 'Oliveraie et canal d’irrigation au Maroc' })}
<section class="section">
  <div class="wrap about-grid">
    <div class="reveal"><p class="eyebrow">Notre histoire</p><h2 class="display-2">${e(SITE.legalName)}</h2></div>
    <div class="about-text reveal">
      <p class="lead">${e(ABOUT[0])}</p>
      <p>${e(ABOUT[1])}</p>
      <p>${e(HOME_INTRO)}</p>
    </div>
  </div>
</section>
<section class="section section-paper" aria-labelledby="values-title">
  <div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">Nos valeurs</p><h2 class="display-2" id="values-title">Ambition, fierté, innovation.</h2></div></div>
    <div class="values">${VALUES.map((v, i) => `<article class="value reveal"><span class="value-n">${String(i + 1).padStart(2, '0')}</span><h3>${e(v.title)}</h3><p>${e(v.text)}</p></article>`).join('')}</div>
  </div>
</section>
<section class="section" aria-labelledby="team-title">
  <div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">Direction</p><h2 class="display-2" id="team-title">Vos interlocuteurs.</h2></div><p>Joignables directement par téléphone ou par e-mail.</p></div>
    <div class="team">${SITE.team.map((t) => `<article class="person reveal">
      <div class="person-mono" aria-hidden="true">${t.name.split(' ').map((w) => w[0]).join('')}</div>
      <div><h3>${e(t.name)}</h3><p class="person-role">${e(t.role)}</p>
      <p class="person-ct"><a href="${t.telHref}">${I.phone}${t.tel}</a><a href="mailto:${t.email}">${I.mail}${t.email}</a></p></div>
    </article>`).join('')}</div>
  </div>
</section>
${partnerStrip(rel)}
${ctaBand(rel)}`;
  write('a-propos/index.html', page({ rel, file: 'a-propos/index.html', title: 'À propos', active: 'about', headerMode: 'overlay',
    description: 'SOCIETE MAROCAINE DE COMMERCE ET SERVICE SARL.AU s’est spécialisée depuis 2014 dans la distribution de matériels agricoles, d’irrigation, de revêtement de bassins et dans l’étude et la réalisation de projets d’irrigation.',
    body, jsonld: [ORG_LD, breadcrumbLd([['', 'Accueil'], ['a-propos/', 'À propos']])] }));
}

function services() {
  const rel = '../';
  const body = `
${pageHero(rel, { eyebrow: 'Services', title: 'De l’étude de votre projet au suivi de vos installations.', lead: e(HOME_PARTNER), crumbs: [['', 'Accueil'], ['services/', 'Services']], photo: 'pivot', alt: 'Rampe d’irrigation pivot' })}
<section class="section">
  <div class="wrap">
    <div class="srv-cards">
      ${SERVICES.map((s, i) => `<article class="srv-card reveal" id="${s.id}">
        <span class="srv-n">${String(i + 1).padStart(2, '0')}</span>
        <h2>${e(s.title)}</h2><p>${e(s.text)}</p>
        ${s.link ? `<a class="link-arrow" href="${rel}${s.link}">Voir les produits ${I.arrow}</a>` : `<a class="link-arrow" href="${rel}contact/">Parler à un ingénieur ${I.arrow}</a>`}
      </article>`).join('')}
      <a class="srv-card srv-card-cta reveal" href="${rel}devis/"><span class="srv-n">→</span><h2>Un projet d’irrigation ?</h2><p>Décrivez-nous votre besoin : nos équipes vous répondent avec une solution adaptée.</p><span class="link-arrow">Demander un devis ${I.arrow}</span></a>
    </div>
  </div>
</section>
<section class="section section-forest" aria-labelledby="process-title">
  <div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow eyebrow-light">Démarche</p><h2 class="display-2" id="process-title">Un projet d’irrigation, étape par étape.</h2></div></div>
    <ol class="process">${PROCESS.map((s, i) => `<li class="reveal" style="--d:${i * 80}ms"><span class="process-n">${String(i + 1).padStart(2, '0')}</span><h3>${e(s.title)}</h3><p>${e(s.text)}</p></li>`).join('')}</ol>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <div class="reveal"><p class="eyebrow">Pour qui</p><h2 class="display-2">Professionnels et particuliers.</h2></div>
    <div class="reveal"><p class="lead">Nous accompagnons les professionnels du domaine ainsi que les particuliers à la recherche de conseils techniques.</p>
    <div class="btn-row"><a class="btn btn-primary" href="${rel}devis/">Demander un devis ${I.arrow}</a><a class="btn btn-outline" href="${rel}contact/">Nous contacter</a></div></div>
  </div>
</section>
${partnerStrip(rel)}`;
  write('services/index.html', page({ rel, file: 'services/index.html', title: 'Services', active: 'services', headerMode: 'overlay',
    description: 'Distribution de matériel agricole et d’irrigation, revêtement de bassins, étude et réalisation de projets d’irrigation, mise en œuvre, suivi et conseil technique.',
    body, jsonld: [breadcrumbLd([['', 'Accueil'], ['services/', 'Services']])] }));
}

function contact() {
  const rel = '../';
  const body = `
${pageHero(rel, { eyebrow: 'Contact', title: 'Contactez-nous.', lead: 'Notre priorité est de vous apporter une réponse rapide et de qualité au moment où vous en avez besoin.', crumbs: [['', 'Accueil'], ['contact/', 'Contact']] })}
<section class="section section-tight">
  <div class="wrap contact-grid">
    <aside class="contact-info reveal">
      <div class="ci"><span class="ci-k">${I.pin} Adresse</span><address>${SITE.address.map(e).join('<br>')}</address><a class="link-arrow" href="${SITE.mapsUrl}" target="_blank" rel="noopener">Ouvrir dans Google Maps ${I.arrowUpRight}</a></div>
      <div class="ci"><span class="ci-k">${I.phone} Téléphone</span>${SITE.phones.map((p) => `<a href="${p.href}">${p.label}</a>`).join('')}</div>
      <div class="ci"><span class="ci-k">${I.mail} E-mail</span>${SITE.emails.map((m) => `<a href="mailto:${m}">${m}</a>`).join('')}</div>
      <div class="ci"><span class="ci-k">${I.clock} Horaires</span>${SITE.hours.map(([d, h]) => `<span>${d} <b>${h}</b></span>`).join('')}</div>
      <div class="ci ci-team">${SITE.team.map((t) => `<p><b>${e(t.name)}</b> · ${e(t.role)}<br><a href="${t.telHref}">${t.tel}</a> · <a href="mailto:${t.email}">${t.email}</a></p>`).join('')}</div>
    </aside>
    <div class="form-card reveal">
      <h2 class="h3">Écrivez-nous</h2>
      <p class="form-intro">Les champs marqués d’un astérisque sont obligatoires.</p>
      <form class="form" data-form="contact" novalidate>
        <div class="field"><label for="c-name">Nom *</label><input id="c-name" name="nom" autocomplete="name" required><p class="field-error" id="c-name-err"></p></div>
        <div class="field"><label for="c-email">E-mail *</label><input id="c-email" name="email" type="email" autocomplete="email" required><p class="field-error" id="c-email-err"></p></div>
        <div class="field"><label for="c-tel">Téléphone</label><input id="c-tel" name="telephone" type="tel" autocomplete="tel" data-validate="phone"><p class="field-error" id="c-tel-err"></p></div>
        <div class="field"><label for="c-subject">Sujet</label><input id="c-subject" name="sujet"></div>
        <div class="field field-full"><label for="c-msg">Votre message *</label><textarea id="c-msg" name="message" rows="6" required minlength="10"></textarea><p class="field-error" id="c-msg-err"></p></div>
        <div class="hp" aria-hidden="true"><label>Ne pas remplir<input name="site_web" tabindex="-1" autocomplete="off"></label></div>
        <div class="field-full form-actions"><button class="btn btn-primary" type="submit">Envoyer le message ${I.arrow}</button></div>
        <div class="form-status field-full" data-form-status role="status" aria-live="polite"></div>
      </form>
    </div>
  </div>
</section>`;
  write('contact/index.html', page({ rel, file: 'contact/index.html', title: 'Contact', active: 'contact',
    description: 'Contactez SOCIETE MAROCAINE DE COMMERCE ET SERVICE SARL.AU à Meknès : +212 535 466 455, info@somacos.ma. Du lundi au vendredi de 8h30 à 17h30, samedi de 8h30 à 13h30.',
    body, jsonld: [ORG_LD, breadcrumbLd([['', 'Accueil'], ['contact/', 'Contact']])], scripts: ['assets/js/forms.js'] }));
}

function devis() {
  const rel = '../';
  const body = `
${pageHero(rel, { eyebrow: 'Demande de devis', title: 'Votre demande de devis.', lead: 'Ajoutez des produits depuis le catalogue, précisez les quantités et décrivez votre projet. Nous revenons vers vous rapidement.', crumbs: [['', 'Accueil'], ['devis/', 'Demande de devis']] })}
<section class="section section-tight">
  <div class="wrap devis-grid">
    <div class="quote-panel reveal">
      <div class="quote-head"><h2 class="h3">Produits sélectionnés</h2><span class="quote-total" data-quote-total>0 article</span></div>
      <ul class="quote-list" data-quote-list></ul>
      <div class="quote-empty" data-quote-empty>
        <p>Votre sélection est vide.</p>
        <a class="btn btn-outline btn-sm" href="${rel}catalogue/">Parcourir le catalogue ${I.arrow}</a>
      </div>
    </div>
    <div class="form-card reveal">
      <form class="form" data-form="devis" novalidate>
        <div class="field"><label for="d-name">Nom complet *</label><input id="d-name" name="nom" autocomplete="name" required><p class="field-error" id="d-name-err"></p></div>
        <div class="field"><label for="d-company">Société</label><input id="d-company" name="societe" autocomplete="organization"></div>
        <div class="field"><label for="d-tel">Téléphone *</label><input id="d-tel" name="telephone" type="tel" autocomplete="tel" required data-validate="phone"><p class="field-error" id="d-tel-err"></p></div>
        <div class="field"><label for="d-email">E-mail *</label><input id="d-email" name="email" type="email" autocomplete="email" required><p class="field-error" id="d-email-err"></p></div>
        <div class="field"><label for="d-city">Ville</label><input id="d-city" name="ville" autocomplete="address-level2"></div>
        <div class="field"><label for="d-type">Vous êtes</label><select id="d-type" name="profil"><option>Agriculteur / exploitant</option><option>Installateur / revendeur</option><option>Bureau d’études</option><option>Particulier</option><option>Autre</option></select></div>
        <div class="field field-full"><label for="d-msg">Votre projet</label><textarea id="d-msg" name="message" rows="5" placeholder="Culture, superficie, source d’eau, produits recherchés…"></textarea><p class="field-error" id="d-msg-err"></p></div>
        <input type="hidden" name="produits" data-quote-field>
        <div class="hp" aria-hidden="true"><label>Ne pas remplir<input name="site_web" tabindex="-1" autocomplete="off"></label></div>
        <div class="field-full form-actions"><button class="btn btn-primary" type="submit">Envoyer la demande ${I.arrow}</button></div>
        <div class="form-status field-full" data-form-status role="status" aria-live="polite"></div>
      </form>
    </div>
  </div>
</section>`;
  write('devis/index.html', page({ rel, file: 'devis/index.html', title: 'Demande de devis', active: '',
    description: 'Demandez un devis à SOCIETE MAROCAINE DE COMMERCE ET SERVICE SARL.AU pour votre matériel d’irrigation : goutte-à-goutte, aspersion, filtration, vannes, raccords PP et PVC, revêtement de bassins.',
    body, scripts: ['assets/js/forms.js'] }));
}

function catalogue() {
  const rel = '../';
  const famFilters = FAMILIES.map((f) => `<li class="ff" data-fam-group="${f.id}">
      <button class="ff-fam" type="button" data-fam="${f.id}" aria-pressed="false"><span>${e(f.name)}</span><span class="n">${famCount(f)}</span></button>
      <ul class="ff-cats">${f.cats.map((c) => `<li><label class="ff-cat"><input type="checkbox" value="${c}" data-cat> <span>${e(CATEGORIES[c].short)}</span><span class="n">${catCount(c)}</span></label></li>`).join('')}</ul>
    </li>`).join('');
  const body = `
<section class="page-hero page-hero-compact">
  <div class="wrap page-hero-inner">
    ${breadcrumb(rel, [['', 'Accueil'], ['catalogue/', 'Catalogue']])}
    <p class="eyebrow">Catalogue</p>
    <h1 class="page-title">Le catalogue</h1>
    <p class="page-lead">${products.length} produits et ${TOTAL_REFS} références : micro-irrigation, raccords PP et PVC, filtration, vannes, aspersion, revêtement de bassins.</p>
  </div>
</section>
<section class="section section-tight catalogue" data-catalogue data-per-page="${PER_PAGE}">
  <div class="wrap cat-layout">
    <aside class="filters" id="filters" data-filters aria-label="Filtres">
      <div class="filters-head"><h2 class="h4">Filtrer</h2><button class="icon-btn filters-close" type="button" aria-label="Fermer les filtres" data-filters-close>${I.close}</button></div>
      <button class="ff-all" type="button" data-fam="" aria-pressed="true"><span>Tous les produits</span><span class="n">${products.length}</span></button>
      <ul class="ff-list">${famFilters}</ul>
      <div class="filters-foot"><button class="btn btn-outline btn-sm" type="button" data-reset>Réinitialiser</button><button class="btn btn-primary btn-sm" type="button" data-filters-close>Voir les résultats</button></div>
    </aside>
    <div class="results">
      <div class="toolbar">
        <div class="search-field">${I.search}<label class="sr-only" for="cat-q">Rechercher</label><input id="cat-q" type="search" placeholder="Nom, référence, dimension…" data-q autocomplete="off"></div>
        <button class="btn btn-outline btn-sm filters-open" type="button" data-filters-open aria-controls="filters">${I.filter} Filtres <span class="filters-n" data-filters-n hidden></span></button>
        <label class="sort"><span class="sr-only">Trier</span><select data-sort>
          <option value="default">Tri : catégorie</option><option value="az">Nom A → Z</option><option value="za">Nom Z → A</option><option value="refs">Plus de références</option></select></label>
      </div>
      <div class="results-meta"><p data-count aria-live="polite">${products.length} produits</p><div class="active-chips" data-chips></div></div>
      <div class="pgrid pgrid-3" data-grid>${products.map((p) => productCard(rel, p)).join('')}</div>
      <div class="empty" data-empty hidden><h2 class="h3">Aucun produit ne correspond.</h2><p>Essayez un autre mot-clé ou une autre catégorie — ou décrivez-nous votre besoin.</p><div class="btn-row"><button class="btn btn-outline btn-sm" type="button" data-reset>Réinitialiser les filtres</button><a class="btn btn-primary btn-sm" href="${rel}contact/">Nous contacter</a></div></div>
      <nav class="pager" data-pager aria-label="Pagination"></nav>
    </div>
  </div>
</section>`;
  write('catalogue/index.html', page({ rel, file: 'catalogue/index.html', title: 'Catalogue', active: 'catalogue',
    description: `Catalogue SOCIETE MAROCAINE DE COMMERCE ET SERVICE SARL.AU : ${products.length} produits d’irrigation — goutteurs, gaine goutte-à-goutte, raccords PP et PVC, filtres, vannes, aspersion, géomembrane.`,
    body, jsonld: [breadcrumbLd([['', 'Accueil'], ['catalogue/', 'Catalogue']])], scripts: ['assets/js/catalogue-data.js', 'assets/js/catalogue.js'] }));
}

function categoriesIndex() {
  const rel = '../';
  const body = `
${pageHero(rel, { eyebrow: 'Catégories', title: `${TOTAL_CATS} catégories, ${FAMILIES.length} familles.`, lead: 'Tout le matériel entre la pompe et la plante, classé comme dans le catalogue SOMACOS.', crumbs: [['', 'Accueil'], ['categories/', 'Catégories']] })}
<section class="section section-tight">
  <div class="wrap">
    ${FAMILIES.map((f, i) => `<div class="cat-family reveal">
      <div class="cat-family-head"><span class="fam-index">${String(i + 1).padStart(2, '0')}</span><h2 class="h3">${e(f.name)}</h2><a class="link-arrow" href="${rel}catalogue/?famille=${f.id}">${plural(famCount(f), 'produit', 'produits')} ${I.arrow}</a></div>
      <div class="cat-tiles">${f.cats.map((c) => `<a class="cat-tile" href="${rel}categories/${c}/"><span class="cat-tile-media"><img src="${rel}assets/img/products/${catImage(c)}-sm.webp" width="560" height="560" alt="" loading="lazy" decoding="async"></span><span class="cat-tile-name">${e(CATEGORIES[c].name)}</span><span class="cat-tile-n">${plural(catCount(c), 'produit', 'produits')}</span></a>`).join('')}</div>
    </div>`).join('')}
  </div>
</section>`;
  write('categories/index.html', page({ rel, file: 'categories/index.html', title: 'Catégories', active: 'catalogue',
    description: 'Toutes les catégories de produits de la société : micro-irrigation, accessoires PP et PVC, filtration et fertilisation, vannes et clapets, aspersion, revêtement de bassins.',
    body, jsonld: [breadcrumbLd([['', 'Accueil'], ['categories/', 'Catégories']])] }));
}

function categoryPage(c) {
  const rel = '../../';
  const f = famOf[c];
  const list = products.filter((p) => p.cat === c);
  const crumbs = [['', 'Accueil'], ['categories/', 'Catégories'], [`categories/${c}/`, CATEGORIES[c].name]];
  const siblings = f.cats.filter((x) => x !== c);
  const body = `
<section class="page-hero page-hero-compact">
  <div class="wrap page-hero-inner">
    ${breadcrumb(rel, crumbs)}
    <p class="eyebrow">${e(f.name)}</p>
    <h1 class="page-title">${e(CATEGORIES[c].name)}</h1>
    <p class="page-lead">${plural(list.length, 'produit', 'produits')} · ${plural(list.reduce((n, p) => n + p.refCount, 0), 'référence', 'références')}</p>
    ${siblings.length ? `<div class="chip-row">${siblings.map((s) => `<a class="chip" href="${rel}categories/${s}/">${e(CATEGORIES[s].short)}</a>`).join('')}</div>` : ''}
  </div>
</section>
<section class="section section-tight">
  <div class="wrap">
    <div class="pgrid pgrid-4">${list.map((p) => productCard(rel, p)).join('')}</div>
    <div class="cat-foot"><a class="btn btn-outline" href="${rel}catalogue/?categorie=${c}">Filtrer dans le catalogue ${I.arrow}</a></div>
  </div>
</section>
${ctaBand(rel)}`;
  write(`categories/${c}/index.html`, page({ rel, file: `categories/${c}/index.html`, title: CATEGORIES[c].name, active: 'catalogue',
    description: `${CATEGORIES[c].name} : ${list.length} produits — ${list.slice(0, 4).map((p) => p.display).join(', ')}…`,
    body, jsonld: [breadcrumbLd(crumbs)] }));
}

function productPage(p) {
  const rel = '../../';
  const crumbs = [['', 'Accueil'], ['catalogue/', 'Catalogue'], [`categories/${p.cat}/`, p.catInfo.name], [`produits/${p.slug}/`, p.display]];
  const related = products.filter((x) => x.cat === p.cat && x.slug !== p.slug).slice(0, 4);
  const relFill = related.length < 4 ? products.filter((x) => x.family.id === p.family.id && x.cat !== p.cat).slice(0, 4 - related.length) : [];
  const desc = p.desc.map((b) => typeof b === 'string' ? `<p>${e(b)}</p>` : `<p class="desc-list-title">${e(b.title)}</p><ul class="desc-list">${b.items.map((it) => `<li>${e(it)}</li>`).join('')}</ul>`).join('');
  const table = p.refCount ? `
  <section class="section section-tight refs" aria-labelledby="refs-title">
    <div class="wrap">
      <div class="refs-head"><div><p class="eyebrow">Références</p><h2 class="h3" id="refs-title">Références et dimensions disponibles</h2></div><p>${plural(p.refCount, 'référence', 'références')} · Ajoutez une référence précise à votre demande de devis.</p></div>
      <div class="table-wrap"><table class="ref-table">
        <thead><tr><th scope="col">${e(p.head[0] === 'CODE' ? 'Code' : p.head[0])}</th><th scope="col">${e(p.head[1] === 'ARTICLES' ? 'Article' : p.head[1] === 'DIAM' ? 'Diamètre' : p.head[1] === 'QTÉ' ? 'Quantité' : p.head[1] === 'MATIÈRE' ? 'Matière' : p.head[1])}</th><th scope="col"><span class="sr-only">Devis</span></th></tr></thead>
        <tbody>${p.rows.map((r) => `<tr><td class="code">${e(r[0])}</td><td>${e(r[1] || '')}</td><td class="act"><button class="quote-toggle quote-toggle-sm" type="button" data-quote-add data-id="${p.slug}" data-img="${p.img}" data-ref="${e(r[0])}" data-name="${e(r[1] && r[1].length > 6 ? r[1] : `${p.name} ${r[1] || ''}`.trim())}" aria-pressed="false" aria-label="Ajouter la référence ${e(r[0])} au devis"><span class="q-off">${I.plus}</span><span class="q-on">${I.check}</span></button></td></tr>`).join('')}</tbody>
      </table></div>
    </div>
  </section>` : '';
  const body = `
<section class="product">
  <div class="wrap">
    ${breadcrumb(rel, crumbs)}
    <div class="product-grid">
      <div class="product-media">
        <button class="product-zoom" type="button" data-lightbox="${rel}assets/img/products/${p.img}-lg.webp" aria-label="Agrandir l’image : ${e(p.display)}">
          <img src="${rel}assets/img/products/${p.img}-lg.webp" width="1100" height="1100" alt="${e(p.display)}" fetchpriority="high" decoding="async">
          <span class="zoom-hint">${I.zoom} Agrandir</span>
        </button>
      </div>
      <div class="product-info">
        <p class="eyebrow"><a href="${rel}categories/${p.cat}/">${e(p.catInfo.name)}</a></p>
        <h1 class="product-title">${e(p.display)}</h1>
        <dl class="product-facts">
          <div><dt>Famille</dt><dd><a href="${rel}catalogue/?famille=${p.family.id}">${e(p.family.name)}</a></dd></div>
          <div><dt>Références</dt><dd>${p.refCount ? `${p.refCount} <a href="#refs-title">voir le tableau</a>` : 'Sur demande'}</dd></div>
          <div><dt>Désignation</dt><dd class="mono">${e(p.name)}</dd></div>
        </dl>
        ${desc ? `<div class="product-desc">${desc}</div>` : ''}
        <div class="product-cta">
          <button class="btn btn-primary btn-lg quote-toggle-big" type="button" data-quote-add data-id="${p.slug}" data-img="${p.img}" data-name="${e(p.name)}" aria-pressed="false"><span class="q-off">${I.plus} Ajouter au devis</span><span class="q-on">${I.check} Ajouté au devis</span></button>
          <a class="btn btn-outline btn-lg" href="${rel}devis/">Demander un devis ${I.arrow}</a>
        </div>
        <p class="product-help">Une question technique ? Appelez le <a href="${SITE.phones[0].href}">${SITE.phones[0].label}</a> ou écrivez à <a href="mailto:${SITE.emails[0]}">${SITE.emails[0]}</a>.</p>
      </div>
    </div>
  </div>
</section>
${table}
<section class="section section-paper" aria-labelledby="rel-title">
  <div class="wrap">
    <div class="section-head"><div><p class="eyebrow">${e(p.catInfo.short)}</p><h2 class="h2" id="rel-title">Produits associés</h2></div><a class="link-arrow" href="${rel}categories/${p.cat}/">Toute la catégorie ${I.arrow}</a></div>
    <div class="pgrid pgrid-4">${[...related, ...relFill].map((x) => productCard(rel, x)).join('')}</div>
  </div>
</section>
<div class="lightbox" data-lightbox-panel hidden role="dialog" aria-modal="true" aria-label="Image agrandie"><button class="icon-btn lightbox-close" type="button" aria-label="Fermer" data-lightbox-close>${I.close}</button><img alt="${e(p.display)}"></div>`;
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: p.display, image: `${SITE.url}/assets/img/products/${p.img}-lg.webp`, category: p.catInfo.name, brand: { '@type': 'Brand', name: /GREENPLAINS/.test(p.name) ? 'GreenPlains' : /SUNSTREAM/.test(p.name) ? 'Sunstream' : /SERTSAN/.test(p.name) ? 'Sertsan' : SITE.legalName } };
  if (p.rows[0]) ld.sku = p.rows[0][0];
  if (typeof p.desc[0] === 'string') ld.description = p.desc[0];
  write(`produits/${p.slug}/index.html`, page({ rel, file: `produits/${p.slug}/index.html`, title: p.display, active: 'catalogue',
    description: `${p.display} — ${p.catInfo.name}. ${p.refCount ? `${p.refCount} référence(s) : ${p.rows.slice(0, 3).map((r) => r[1] || r[0]).join(', ')}.` : ''} Demandez un devis à ${SITE.legalName}, Meknès.`.slice(0, 300),
    body, image: `assets/img/products/${p.img}-lg.webp`, jsonld: [ld, breadcrumbLd(crumbs)] }));
}

function notFound() {
  const rel = '/';
  const body = `<section class="page-hero"><div class="wrap page-hero-inner"><p class="eyebrow">Erreur 404</p><h1 class="page-title">Cette page n’existe pas.</h1><p class="page-lead">Le lien est peut-être ancien. Retrouvez nos produits dans le catalogue.</p><div class="btn-row"><a class="btn btn-primary" href="/catalogue/">Voir le catalogue ${I.arrow}</a><a class="btn btn-outline" href="/">Accueil</a></div></div></section>`;
  write('404.html', page({ rel, file: '404.html', title: 'Page introuvable', description: 'Page introuvable.', body }));
}

// ---------------------------------------------------------------- données client + SEO
function clientData() {
  const data = {
    families: FAMILIES.map((f) => ({ id: f.id, name: f.name, cats: f.cats })),
    cats: Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.short])),
    // index de recherche : slug, catégorie, nb références, texte (désignation + codes + articles)
    items: products.map((p, i) => [p.slug, p.cat, p.refCount, i, `${p.name} ${p.display} ${p.rows.map((r) => r.join(' ')).join(' ')}`]),
  };
  fs.mkdirSync(path.join(DIST, 'assets/js'), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'assets/js/catalogue-data.js'), `window.SOMACOS_CATALOGUE=${JSON.stringify(data)};\n`);
}

function seo() {
  const urls = ['', 'a-propos/', 'services/', 'contact/', 'devis/', 'catalogue/', 'categories/',
    ...Object.keys(CATEGORIES).map((c) => `categories/${c}/`), ...products.map((p) => `produits/${p.slug}/`)];
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE.url}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
}

// ---------------------------------------------------------------- exécution
GENERATED.forEach((g) => fs.rmSync(path.join(DIST, g), { recursive: true, force: true }));
home(); about(); services(); contact(); devis(); catalogue(); categoriesIndex();
Object.keys(CATEGORIES).forEach(categoryPage);
products.forEach(productPage);
notFound(); clientData(); seo();
const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, f) => n + (f.isDirectory() ? count(path.join(dir, f.name)) : f.name.endsWith('.html') ? 1 : 0), 0);
console.log(`✓ ${count(DIST)} pages HTML générées dans site/ (${products.length} produits, ${TOTAL_REFS} références).`);
