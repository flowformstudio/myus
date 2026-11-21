/* ──────────────────────────────────────────────────────────────────────
   data-render.js — hydrates the dashboard / all-locations table from
   data/countries.json (250 countries, real flags, plausible addresses).
   - Favorites are mutable: clicking the star in any row toggles whether
     the country shows up as a quick-access tile at the top. State is
     persisted to localStorage so it survives reloads.
   ────────────────────────────────────────────────────────────────────── */
(function () {
  const isSubpage = /\/pages\//.test(location.pathname);
  const root = isSubpage ? '../' : '';
  const STORAGE_KEY = 'myus.favorites.v1';
  const MAX_FAVS = 6;

  let ALL = [];
  let FAVS = new Set();
  let limitToastTimer;

  // Deterministic per-country status counts. Seeded by country code.
  function statusFor(code) {
    let h = 0;
    for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const r = (n) => { h = (h * 1103515245 + 12345) >>> 0; return h % n; };
    return { ready: r(5), review: r(5), action: r(8) };
  }

  function pillsHTML(s, allowEmpty = false) {
    const parts = [];
    if (s.ready)  parts.push(`<span class="status-pill ready"><span class="count">${s.ready}</span><span class="label">Ready to send</span></span>`);
    if (s.review) parts.push(`<span class="status-pill review"><span class="count">${s.review}</span><span class="label">In Review</span></span>`);
    if (s.action) parts.push(`<span class="status-pill action"><span class="count">${s.action}</span><span class="label">Action Required</span></span>`);
    if (!parts.length && allowEmpty) return '';
    return parts.join('');
  }

  function cardHTML(c) {
    const s = statusFor(c.code);
    const empty = !s.ready && !s.review && !s.action;
    const pills = empty
      ? `<div class="loc-card-empty">You have no packages at this location</div>`
      : `<div class="loc-card-status">${pillsHTML(s)}</div>`;
    return `
      <div class="loc-card">
        <div class="loc-card-head">
          <span class="loc-card-flag" style="background-image:url('${c.flag}')"></span>
          <span class="loc-card-name">${c.name}</span>
          <button class="loc-card-fav" data-fav-toggle="${c.code}" aria-label="Remove from favorites" title="Remove from favorites">★</button>
        </div>
        ${pills}
        <div class="loc-card-actions">
          <button class="btn btn-outline" data-see-address
            data-name="${c.name}"
            data-flag="${c.flag}"
            data-counts="${s.ready},${s.review},${s.action}"
            data-a1="${c.a1}"
            data-a2="${c.a2}"
            data-city="${c.city}"
            data-state="${c.state || '—'}"
            data-zip="${c.zip}"
            data-tel="${c.tel}">See Address</button>
          <button class="btn btn-primary">Manage Location</button>
        </div>
      </div>`;
  }

  function rowHTML(c, isFav) {
    const s = statusFor(c.code);
    const starClass = isFav ? 'fav-icon star' : 'fav-icon empty';
    const starGlyph = isFav ? '★' : '☆';
    const star = `<button class="${starClass}" data-fav-toggle="${c.code}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">${starGlyph}</button>`;
    const addr = `${c.a1}, ${c.a2}, ${c.city} ${c.zip}, ${c.tel}`;
    const status = pillsHTML(s, true);
    const href = `${root}pages/location.html?code=${c.code}`;
    return `
      <tr class="loc-row-link" data-loc-href="${href}">
        <td><span class="country-cell">${star}<span class="country-flag" style="background-image:url('${c.flag}')"></span><a class="country-link" href="${href}">${c.name}</a></span></td>
        <td><a class="address-link" href="${href}">${addr}</a></td>
        <td>${status ? `<div class="status-cell">${status}</div>` : ''}</td>
      </tr>`;
  }

  // Stable favorites order: persisted order from localStorage, then any
  // additions from the JSON defaults that aren't in storage yet.
  function loadFavs(defaults) {
    let stored;
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { stored = null; }
    const codes = Array.isArray(stored) ? stored : defaults;
    FAVS = new Set(codes);
    FAVS.order = codes.slice();
  }
  function saveFavs() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(FAVS.order)); } catch (e) {}
  }
  function favList() {
    return FAVS.order.map(code => ALL.find(c => c.code === code)).filter(Boolean);
  }

  function render() {
    const favs = favList();
    const others = ALL.filter(c => !FAVS.has(c.code));

    const cardSlot = document.querySelector('[data-loc-cards]');
    if (cardSlot) cardSlot.innerHTML = favs.map(cardHTML).join('') || `<div class="loc-empty-hint">Click a ☆ in the table below to pin a location here.</div>`;

    const embedded = document.querySelector('[data-loc-table-embed] tbody');
    if (embedded) {
      const slice = others.slice(0, Math.max(0, 25 - favs.length));
      embedded.innerHTML = [...favs.map(c => rowHTML(c, true)), ...slice.map(c => rowHTML(c, false))].join('');
    }

    const fullTable = document.querySelector('[data-loc-table-full] tbody');
    if (fullTable) {
      fullTable.innerHTML = [...favs.map(c => rowHTML(c, true)), ...others.map(c => rowHTML(c, false))].join('');
    }

    const counter = document.querySelector('[data-loc-count]');
    if (counter) counter.textContent = `${ALL.length} Locations`;
    const pageCounter = document.querySelector('[data-page-counter]');
    if (pageCounter) pageCounter.textContent = `${ALL.length} locations`;

    document.dispatchEvent(new CustomEvent('locations:rendered'));
  }

  function showLimitToast() {
    let el = document.getElementById('favLimitToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'favLimitToast';
      el.className = 'fav-limit-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.innerHTML = `
        <img class="fav-limit-icon" src="${root}assets/icons/warning-square.svg" alt="" />
        <div class="fav-limit-text">
          <div class="fav-limit-title">Favorites limit reached (${MAX_FAVS}/${MAX_FAVS})</div>
          <div class="fav-limit-sub">Unfavorite one to add another</div>
        </div>`;
      document.body.appendChild(el);
    }
    el.classList.add('show');
    clearTimeout(limitToastTimer);
    limitToastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function toggleFav(code) {
    if (FAVS.has(code)) {
      FAVS.delete(code);
      FAVS.order = FAVS.order.filter(c => c !== code);
    } else {
      if (FAVS.size >= MAX_FAVS) {
        showLimitToast();
        return;
      }
      FAVS.add(code);
      FAVS.order.push(code);
    }
    saveFavs();
    render();
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-fav-toggle]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    toggleFav(btn.getAttribute('data-fav-toggle'));
  });

  // Whole-row click → open the location. Real anchors (country / address
  // links) navigate on their own; the star button stops propagation above.
  document.addEventListener('click', e => {
    if (e.target.closest('a') || e.target.closest('[data-fav-toggle]')) return;
    const row = e.target.closest('tr[data-loc-href]');
    if (!row) return;
    window.location.href = row.getAttribute('data-loc-href');
  });

  async function main() {
    let data;
    try {
      const r = await fetch(root + 'data/countries.json');
      data = await r.json();
    } catch (e) {
      console.error('data-render: failed to load countries.json', e);
      return;
    }
    ALL = data.countries;
    loadFavs(data.favorites || []);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
