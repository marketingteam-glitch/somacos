/* SOMACOS — formulaires de contact et de demande de devis : validation et envoi. */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const CFG = window.SOMACOS_CONFIG || {};
  const root = document.body.dataset.root || '';
  const Quote = window.SomacosQuote;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------ liste du devis */
  const list = $('[data-quote-list]');
  function renderQuote() {
    if (!list || !Quote) return;
    const items = Quote.all();
    $('[data-quote-empty]').hidden = items.length > 0;
    $('[data-quote-total]').textContent = `${items.length} article${items.length > 1 ? 's' : ''}`;
    list.innerHTML = items.map((it) => `
      <li>
        ${it.img ? `<img src="${root}assets/img/products/${esc(it.img)}-sm.webp" alt="" width="56" height="56" loading="lazy">` : '<span></span>'}
        <span class="qn"><a href="${root}produits/${esc(it.id)}/">${esc(it.name)}</a>${it.ref ? `<span class="qr">Réf. ${esc(it.ref)}</span>` : ''}</span>
        <label class="sr-only" for="qty-${esc(it.key)}">Quantité</label>
        <input id="qty-${esc(it.key)}" type="number" min="1" max="99999" inputmode="numeric" value="${it.qty}" data-qty="${esc(it.key)}">
        <button class="icon-btn" type="button" data-remove="${esc(it.key)}" aria-label="Retirer ${esc(it.name)}"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      </li>`).join('');
  }
  if (list && Quote) {
    list.addEventListener('change', (e) => { const k = e.target.dataset.qty; if (k) Quote.setQty(k, parseInt(e.target.value, 10)); });
    list.addEventListener('click', (e) => { const b = e.target.closest('[data-remove]'); if (b) Quote.remove(b.dataset.remove); });
    Quote.onChange(renderQuote);
    renderQuote();
  }
  const quoteLines = () => (Quote ? Quote.all().map((i) => `- ${i.name}${i.ref ? ` (réf. ${i.ref})` : ''} × ${i.qty}`).join('\n') : '');

  /* ------------------------------------------------ validation */
  const RULES = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Saisissez une adresse e-mail valide.',
    phone: (v) => /^[+()\d\s.\-]{8,20}$/.test(v) || 'Saisissez un numéro de téléphone valide.',
  };
  function check(field) {
    const v = field.value.trim();
    let msg = '';
    if (field.required && !v) msg = 'Ce champ est obligatoire.';
    else if (v && field.type === 'email') msg = RULES.email(v) === true ? '' : RULES.email(v);
    else if (v && field.dataset.validate === 'phone') msg = RULES.phone(v) === true ? '' : RULES.phone(v);
    else if (v && field.minLength > 0 && v.length < field.minLength) msg = `Au moins ${field.minLength} caractères.`;
    setError(field, msg);
    return !msg;
  }
  function setError(field, msg) {
    const err = document.getElementById(`${field.id}-err`);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) { err.textContent = msg; field.setAttribute('aria-describedby', err.id); }
  }

  /* ------------------------------------------------ envoi */
  function summary(form, kind) {
    const fd = new FormData(form);
    const lines = [kind === 'devis' ? 'Bonjour SOMACOS, je souhaite recevoir un devis.' : 'Bonjour SOMACOS,', ''];
    const label = { nom: 'Nom', societe: 'Société', email: 'E-mail', telephone: 'Téléphone', ville: 'Ville', profil: 'Profil', sujet: 'Sujet' };
    Object.keys(label).forEach((k) => { const v = (fd.get(k) || '').toString().trim(); if (v) lines.push(`${label[k]} : ${v}`); });
    const prods = (fd.get('produits') || '').toString().trim();
    if (prods) lines.push('', 'Produits :', prods);
    const msg = (fd.get('message') || '').toString().trim();
    if (msg) lines.push('', kind === 'devis' ? 'Projet :' : 'Message :', msg);
    return lines.join('\n');
  }

  function fallback(form, kind, status, reason) {
    const text = summary(form, kind);
    const subject = kind === 'devis' ? 'Demande de devis — site web' : ((new FormData(form).get('sujet') || 'Message — site web').toString());
    const mail = `mailto:${CFG.email || 'info@somacos.ma'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    status.className = 'form-status field-full';
    status.innerHTML = `<p>${reason}</p><div class="btn-row">
      <a class="btn btn-primary btn-sm" href="${mail}">Envoyer par e-mail</a>
      ${CFG.whatsapp ? `<a class="btn btn-outline btn-sm" href="https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">Envoyer sur WhatsApp</a>` : ''}
    </div>`;
  }

  $$('form[data-form]').forEach((form) => {
    const kind = form.dataset.form;
    const status = $('[data-form-status]', form);
    const submit = $('button[type="submit"]', form);
    const fields = $$('input:not([type="hidden"]):not([name="site_web"]), textarea, select', form);
    fields.forEach((f) => f.addEventListener('blur', () => { if (f.value || f.getAttribute('aria-invalid') === 'true') check(f); }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = ''; status.className = 'form-status field-full';
      const hidden = $('[data-quote-field]', form);
      if (hidden) hidden.value = quoteLines();

      let ok = fields.map(check).every(Boolean);
      if (kind === 'devis' && !hidden.value && !$('#d-msg').value.trim()) {
        setError($('#d-msg'), 'Ajoutez des produits à votre sélection ou décrivez votre projet.');
        ok = false;
      }
      if (!ok) { const bad = $('[aria-invalid="true"]', form); if (bad) bad.focus(); return; }
      if ($('[name="site_web"]', form).value) return; // robot

      if (!CFG.formEndpoint) { fallback(form, kind, status, 'Votre demande est prête. Envoyez-la depuis votre messagerie :'); return; }

      submit.disabled = true;
      const label = submit.innerHTML; submit.textContent = 'Envoi en cours…';
      try {
        const fd = new FormData(form); fd.append('type', kind); fd.append('page', location.href);
        const res = await fetch(root + CFG.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data || !data.ok) throw new Error((data && data.error) || `HTTP ${res.status}`);
        status.className = 'form-status field-full is-ok';
        status.innerHTML = kind === 'devis'
          ? '<p><b>Merci, votre demande de devis a bien été envoyée.</b> Notre équipe vous recontacte rapidement.</p>'
          : '<p><b>Merci, votre message a bien été envoyé.</b> Nous vous répondons rapidement.</p>';
        form.reset();
        if (kind === 'devis' && Quote) Quote.clear();
      } catch (err) {
        fallback(form, kind, status, 'L’envoi automatique n’a pas abouti. Vous pouvez envoyer la même demande depuis votre messagerie :');
      } finally {
        submit.disabled = false; submit.innerHTML = label;
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
})();
