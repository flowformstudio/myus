/* ──────────────────────────────────────────────────────────────────────
   membership-profile.js — populates the four phone-country <select>s
   with the full country list (name + calling code) from
   data/countries.json. Mirrors the live account.myus.com behavior.
   ────────────────────────────────────────────────────────────────────── */
(function () {
  const isSubpage = /\/pages\//.test(location.pathname);
  const root = isSubpage ? '../' : '';

  async function main() {
    const selects = document.querySelectorAll('[data-country-select]');
    if (!selects.length) return;
    let data;
    try {
      const r = await fetch(root + 'data/countries.json');
      data = await r.json();
    } catch (e) {
      console.error('membership-profile: failed to load countries.json', e);
      return;
    }
    selects.forEach(sel => {
      const noCode = sel.hasAttribute('data-no-code');
      const list = noCode ? data.countries : data.countries.filter(c => c.callingCode);
      const opts = list.map(c => {
        const label = noCode ? c.name : `${c.name} (${c.callingCode})`;
        return `<option value="${c.code}">${escapeHTML(label)}</option>`;
      }).join('');
      sel.insertAdjacentHTML('beforeend', opts);
      const defCode = sel.getAttribute('data-default-code');
      if (defCode) sel.value = defCode;
    });
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
