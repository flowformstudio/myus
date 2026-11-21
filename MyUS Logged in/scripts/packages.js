/* ──────────────────────────────────────────────────────────────────────
   packages.js — "Your Packages" on pages/location.html.
   Four clickable state tabs (Ready to Send · Action Required · In Review ·
   Prepaid Shipping); each shows its own package cards below. Cards expand
   to reveal the customs/details panel. Modeled on the Atlas Figma states.
   ────────────────────────────────────────────────────────────────────── */
(function () {
  /* ─── Inline icons ─────────────────────────────────────────────────── */
  const I = {
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };

  /* ─── Per-state config (alert panel + tab colour) ──────────────────── */
  const STATES = {
    ready: {
      label: 'Ready to Send', color: 'green',
      need: null,
    },
    action: {
      label: 'Action Required', color: 'red',
      strip: ['Provide item values as required by Customs', 'Package has exceeded storage time limit'],
      need: {
        variant: 'red',
        title: 'What we need from you:',
        btn: 'Provide Item Values',
        desc: 'Export paperwork must display the actual price paid for all items in your package.',
      },
    },
    review: {
      label: 'In Review', color: 'orange',
      need: {
        variant: 'amber',
        title: 'Why is this package in review?',
        btn: 'Item requires extra handling',
        desc: 'Package is in review by customer service. We will email you if it will not be ready to send within two business days.',
      },
    },
    prepaid: {
      label: 'Prepaid Shipping', color: 'blue',
      need: {
        variant: 'blue',
        title: 'Prepaid shipping label',
        btn: 'Download Label',
        desc: 'Your prepaid shipping label is ready. This package will ship using your prepaid carrier and bypasses a new ship request.',
      },
    },
  };
  const ORDER = ['ready', 'action', 'review', 'prepaid'];

  /* ─── Demo package data ────────────────────────────────────────────── */
  const items = () => ([
    { name: 'Dietary supplements for pets', sub: 'Schedule B 2309.90.8500: Dietary supplements for pets', qty: 1, itemValue: '6.00 USD', totalValue: '6.00 USD' },
    { name: 'Vitamins', sub: 'Schedule B 2309.90.8500: Dietary supplements for pets', qty: 1, itemValue: '6.00 USD', totalValue: '6.00 USD', warning: true },
  ]);
  const total = () => ({ qty: 2, totalValue: '12.00 USD' });
  const TRACK = '1Z 999 AA1 01 2345 6784';

  const DATA = {
    ready: [
      { from: 'Mitsui Engineering & Shipbuilding Co Ltd', to: 'Wade Warren', packageId: '01-721-3415', received: '02 Oct, 2023', tracking: TRACK, weight: '3.00 lbs', expanded: true, items: items(), total: total() },
      { from: 'Amazon.com', to: 'Wade Warren', packageId: '01-721-2980', received: '28 Sep, 2023', tracking: TRACK, weight: '1.20 lbs', expanded: false, items: items(), total: total() },
    ],
    action: [
      { from: 'The Internationald', to: 'Wade Warren', packageId: '01-721-3415', received: '02 Oct, 2018', receivedAlert: true, tracking: TRACK, weight: '3.00 lbs', expanded: false, items: items(), total: total() },
      { from: 'Mitsui Engineering & Shipbuilding Co Ltd', to: 'Wade Warren', packageId: '01-721-3415', received: '02 Oct, 2023', tracking: TRACK, weight: '3.00 lbs', expanded: true, items: items(), total: total() },
    ],
    review: [
      { from: 'Mitsui Engineering & Shipbuilding Co Ltd', to: 'Wade Warren', packageId: '01-721-3415', received: '02 Oct, 2018', tracking: TRACK, weight: '3.00 lbs', expanded: true, items: items(), total: total() },
      { from: 'Best Buy', to: 'Wade Warren', packageId: '01-721-4471', received: '24 Sep, 2023', tracking: TRACK, weight: '2.40 lbs', expanded: false, items: items(), total: total() },
    ],
    prepaid: [
      { from: 'Newegg', to: 'Wade Warren', packageId: '01-721-5102', received: '20 Sep, 2023', tracking: TRACK, weight: '4.10 lbs', expanded: false, items: items(), total: total() },
      { from: 'Walmart', to: 'Wade Warren', packageId: '01-721-5188', received: '21 Sep, 2023', tracking: TRACK, weight: '0.90 lbs', expanded: false, items: items(), total: total() },
    ],
  };

  /* ─── HTML builders ────────────────────────────────────────────────── */
  function needHTML(n) {
    const btn = n.btn ? `<button type="button" class="pkg-need-btn">${n.btn} ${I.info}</button>` : '';
    return `<div class="pkg-need ${n.variant}">
        <div class="pkg-need-title">${n.title}</div>
        ${btn}
        <p class="pkg-need-desc">${n.desc}</p>
      </div>`;
  }

  function detailsHTML(pkg) {
    const rows = pkg.items.map(it => `
      <div class="pkg-detail-row">
        <div class="pkg-item">
          <div class="pkg-item-name">${it.name}</div>
          <div class="pkg-item-sub">${it.sub}</div>
          ${it.warning ? `<div class="pkg-item-warning">${I.ban} This product contains a lithium battery, additional charges may be required</div>` : ''}
        </div>
        <div class="col-qty">${it.qty}</div>
        <div class="col-iv">${it.itemValue}</div>
        <div class="col-tv">${it.totalValue}</div>
      </div>`).join('');
    return `<div class="pkg-details">
        <div class="pkg-details-head">
          <span>Package Details</span>
          <span class="col-qty">Quantity</span>
          <span class="col-iv">Item Value ${I.info}</span>
          <span class="col-tv">Total Value</span>
        </div>
        ${rows}
        <div class="pkg-total">
          <span>Total Package Value</span>
          <span class="col-qty">${pkg.total.qty}</span>
          <span class="col-iv"></span>
          <span class="col-tv">${pkg.total.totalValue}</span>
        </div>
      </div>`;
  }

  function footerHTML() {
    return `<div class="pkg-footer">
        <button type="button" class="pkg-actions-select">Actions ${I.chev}</button>
        <button type="button" class="pkg-msg">1 New Message ${I.headset}</button>
      </div>`;
  }

  function cardHTML(pkg, stateKey, idx) {
    const st = STATES[stateKey];
    const recv = pkg.receivedAlert
      ? `<span class="pkg-received is-alert">${pkg.received} ${I.info}</span>`
      : `<span class="pkg-received">${pkg.received}</span>`;
    const strip = (st.strip || []).length
      ? `<div class="pkg-alert-strip">${st.strip.map(t => `<span class="pkg-alert-chip">${t} ${I.info}</span>`).join('')}</div>`
      : '';
    return `<article class="pkg-card ${pkg.expanded ? 'is-open' : ''}" data-card data-idx="${idx}">
        <div class="pkg-row">
          <input type="checkbox" class="pkg-check" checked />
          <div class="pkg-from">
            <div class="pkg-from-name">${pkg.from}</div>
            <div class="pkg-to"><span>To</span>${pkg.to}</div>
          </div>
          <div class="pkg-id">${pkg.packageId}</div>
          <div class="pkg-received-cell">${recv}</div>
          <div class="pkg-track">${pkg.tracking}</div>
          <div class="pkg-weight">${pkg.weight}</div>
          <button type="button" class="pkg-chevron" data-toggle aria-label="Toggle details">${I.chev}</button>
        </div>
        ${strip}
        <div class="pkg-body">
          ${st.need ? needHTML(st.need) : ''}
          ${detailsHTML(pkg)}
          ${footerHTML()}
        </div>
      </article>`;
  }

  function shipRequestHTML() {
    return `<div class="ship-card">
        <h3>Ship Request</h3>
        <div class="ship-line"><span class="lbl">Total Value:</span><span class="val">125.00 USD</span></div>
        <div class="ship-line"><span class="lbl">Total Weight:</span><span class="val">17.00 lb</span></div>
        <div class="ship-line"><span class="lbl">Packages:</span><span class="val">2</span></div>
        <hr class="ship-divider" />
        <div class="ship-line"><span class="lbl">Shipping Charges ${I.info}</span><span class="val">1,000.00 USD</span></div>
        <div class="ship-line"><span class="lbl">Package Level Charges ${I.info}</span><span class="val">15.00 USD</span></div>
        <div class="ship-line discount"><span class="lbl">Discounts Applied</span><span class="val">-50.36 USD</span></div>
        <hr class="ship-divider" />
        <div class="ship-total"><span class="lbl">Estimated Total:</span><span class="val">1,104.36 USD</span></div>
        <button type="button" class="ship-btn">Add to Ship Request</button>
        <div class="ship-customs">
          ${I.alert}
          <div>
            <div class="ship-customs-title">Customs Information for France:</div>
            <div class="ship-customs-desc">Items shipped together that have a total value over 150 EUR are subject to a customs duty.</div>
          </div>
        </div>
      </div>`;
  }

  /* ─── Wire up ──────────────────────────────────────────────────────── */
  function main() {
    const tabsEl = document.querySelector('[data-pkg-tabs]');
    const listEl = document.querySelector('[data-pkg-list]');
    const shipEl = document.querySelector('[data-ship-request]');
    const searchEl = document.querySelector('[data-pkg-search]');
    const selectAll = document.querySelector('[data-pkg-selectall]');
    const expandAll = document.querySelector('[data-pkg-expandall]');
    const collapseAll = document.querySelector('[data-pkg-collapseall]');
    if (!tabsEl || !listEl) return;

    let active = 'action'; // the showcase state

    function renderTabs() {
      tabsEl.innerHTML = ORDER.map(key => {
        const s = STATES[key];
        return `<button type="button" class="pkg-tab ${key === active ? 'is-active' : ''}" data-color="${s.color}" data-state="${key}">
            ${s.label}<span class="pkg-tab-count">${DATA[key].length}</span>
          </button>`;
      }).join('');
    }

    function current() { return DATA[active]; }

    function renderList() {
      const pkgs = current();
      listEl.innerHTML = pkgs.length
        ? pkgs.map((p, i) => cardHTML(p, active, i)).join('')
        : '<div class="pkg-empty">No packages in this state.</div>';
      applyFilter();
      if (selectAll) selectAll.checked = true;
    }

    function renderShip() {
      if (!shipEl) return;
      shipEl.innerHTML = active === 'ready' ? shipRequestHTML() : '';
    }

    function applyFilter() {
      const q = (searchEl && searchEl.value || '').toLowerCase().trim();
      const pkgs = current();
      listEl.querySelectorAll('[data-card]').forEach(card => {
        const p = pkgs[+card.dataset.idx];
        const hit = !q || p.from.toLowerCase().includes(q) || p.tracking.toLowerCase().includes(q) || p.packageId.toLowerCase().includes(q);
        card.style.display = hit ? '' : 'none';
      });
    }

    function paintOpen() {
      const pkgs = current();
      listEl.querySelectorAll('[data-card]').forEach(card => {
        card.classList.toggle('is-open', pkgs[+card.dataset.idx].expanded);
      });
    }

    function renderAll() { renderTabs(); renderList(); renderShip(); }

    // Tab switching
    tabsEl.addEventListener('click', e => {
      const btn = e.target.closest('[data-state]');
      if (!btn) return;
      active = btn.dataset.state;
      renderAll();
    });

    // Expand / collapse a card (click the row or chevron, but not the body controls or checkbox)
    listEl.addEventListener('click', e => {
      if (e.target.closest('.pkg-check') || e.target.closest('.pkg-body')) return;
      const card = e.target.closest('[data-card]');
      if (!card) return;
      const pkg = current()[+card.dataset.idx];
      pkg.expanded = !pkg.expanded;
      card.classList.toggle('is-open', pkg.expanded);
    });

    if (expandAll) expandAll.addEventListener('click', () => { current().forEach(p => p.expanded = true); paintOpen(); });
    if (collapseAll) collapseAll.addEventListener('click', () => { current().forEach(p => p.expanded = false); paintOpen(); });
    if (searchEl) searchEl.addEventListener('input', applyFilter);
    if (selectAll) selectAll.addEventListener('change', () => {
      listEl.querySelectorAll('.pkg-check').forEach(cb => { cb.checked = selectAll.checked; });
    });

    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
