/* ──────────────────────────────────────────────────────────────────────
   layout.js — injects the shared topbar / sidebar / footer into every
   page. Each page tags itself with <body data-page="..."> so this script
   can highlight the matching sidebar link.

   Asset paths in the partials are relative to the SITE ROOT (the folder
   containing index.html). Sub-pages live in pages/*.html, so we rewrite
   relative paths in the injected HTML if the current document sits one
   directory below the root.
   ────────────────────────────────────────────────────────────────────── */
(function () {
  const body = document.body;
  const page = body.dataset.page || 'dashboard';

  // Detect whether we're a sub-page (pages/...) and need to prefix asset paths with "../"
  const isSubpage = /\/pages\//.test(location.pathname);
  const root = isSubpage ? '../' : '';

  function fix(html) {
    // Rewrite the leading bare relative paths so they work from any depth.
    return html
      .replace(/(src|href)="assets\//g,  `$1="${root}assets/`)
      .replace(/(src|href)="index\.html/g, `$1="${root}index.html`)
      .replace(/(src|href)="pages\//g,   `$1="${root}pages/`);
  }

  async function inject(slotSelector, partialPath) {
    const slot = document.querySelector(slotSelector);
    if (!slot) return;
    try {
      const r = await fetch(root + 'partials/' + partialPath);
      if (!r.ok) throw new Error(partialPath + ' ' + r.status);
      slot.outerHTML = fix(await r.text());
    } catch (e) {
      console.error('layout: failed to load', partialPath, e);
    }
  }

  async function init() {
    await inject('[data-slot="topbar"]', 'topbar.html');
    await inject('[data-slot="sidebar"]', 'sidebar.html');
    await inject('[data-slot="footer"]', 'footer.html');
    // Mark the active sidebar link
    const active = document.querySelector(`.sidebar-link[data-page="${page}"]`);
    if (active) active.classList.add('sidebar-link-active');
    wireMobileMenu();
  }

  // Mobile drawer wiring — hamburger ↔ sidebar slide-in, with backdrop, Esc,
  // auto-close on link click, and auto-close on resize past the breakpoint.
  function wireMobileMenu() {
    // Insert a single backdrop element once
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }
    const open  = () => { document.body.classList.add('sidebar-open'); };
    const close = () => { document.body.classList.remove('sidebar-open'); };

    document.querySelectorAll('[data-menu-toggle]').forEach(b => b.addEventListener('click', open));
    document.querySelectorAll('[data-menu-close]').forEach(b => b.addEventListener('click', close));
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    // Close when a sidebar link is tapped on mobile
    document.querySelectorAll('.sidebar a').forEach(a => a.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 900px)').matches) close();
    }));

    // If the user resizes back up to desktop, drop the open state
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
