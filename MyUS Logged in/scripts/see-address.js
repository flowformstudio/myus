/* ──────────────────────────────────────────────────────────────────────
   See Address modal + copy-line feedback
   - Click any [data-see-address] button → open modal with that location's data
   - Click any [data-copy] row → copy that value to clipboard, flash a green
     check on the row, and surface a "Copied" toast at the bottom
   - "Copy Full Address" button concatenates all six lines and copies them
   ────────────────────────────────────────────────────────────────────── */
(function () {
  const modal = document.getElementById('seeAddressModal');
  if (!modal) return;

  const setText = (sel, val) => modal.querySelector(sel).textContent = (val ?? '') === '' ? '—' : val;
  const fieldByKey = {
    a1: '[data-modal-a1]',
    a2: '[data-modal-a2]',
    city: '[data-modal-city]',
    state: '[data-modal-state]',
    zip: '[data-modal-zip]',
    tel: '[data-modal-tel]',
  };

  function openFrom(btn) {
    const d = btn.dataset;
    setText('[data-modal-name]', (d.name || '') + ' Tax-Free Address');
    modal.querySelector('[data-modal-flag]').style.backgroundImage = d.flag ? `url("${d.flag}")` : '';
    const [ready = 0, review = 0, action = 0] = (d.counts || '0,0,0').split(',').map(Number);
    setText('[data-modal-ready]',  ready);
    setText('[data-modal-review]', review);
    setText('[data-modal-action]', action);
    setText(fieldByKey.a1,    d.a1);
    setText(fieldByKey.a2,    d.a2);
    setText(fieldByKey.city,  d.city);
    setText(fieldByKey.state, d.state);
    setText(fieldByKey.zip,   d.zip);
    setText(fieldByKey.tel,   d.tel);
    // reset any previously copied row
    modal.querySelectorAll('.value-row.copied').forEach(r => r.classList.remove('copied'));
    modal.classList.add('open');
  }
  function close() { modal.classList.remove('open'); }

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-see-address]');
    if (btn) { e.preventDefault(); openFrom(btn); return; }
    if (e.target.closest('[data-modal-close]')) { close(); return; }
    if (e.target === modal) close();  // backdrop click
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // ─── Copy line feedback ───────────────────────────────────────────
  const toast = document.getElementById('copyToast');
  const toastText = toast && toast.querySelector('[data-toast-text]');
  let toastTimer;
  function showToast(msg = 'Copied to clipboard') {
    if (!toast) return;
    if (toastText) toastText.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1700);
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
      }
      return true;
    } catch (e) { return false; }
  }

  modal.querySelectorAll('[data-copy]').forEach(row => {
    row.addEventListener('click', async () => {
      const val = row.querySelector('.val').textContent.trim();
      const ok = await copyText(val);
      if (!ok) return;
      // clear any prior copied row, mark this one
      modal.querySelectorAll('.value-row.copied').forEach(r => r.classList.remove('copied'));
      row.classList.add('copied');
      showToast('Copied to clipboard');
      setTimeout(() => row.classList.remove('copied'), 1700);
    });
  });

  const fullBtn = document.getElementById('copyFullAddress');
  if (fullBtn) {
    fullBtn.addEventListener('click', async () => {
      const name = modal.querySelector('[data-modal-name]').textContent.trim();
      const lines = [
        modal.querySelector(fieldByKey.a1).textContent.trim(),
        modal.querySelector(fieldByKey.a2).textContent.trim(),
        [
          modal.querySelector(fieldByKey.city).textContent.trim(),
          modal.querySelector(fieldByKey.state).textContent.trim(),
          modal.querySelector(fieldByKey.zip).textContent.trim(),
        ].filter(s => s && s !== '—').join(', '),
        modal.querySelector(fieldByKey.tel).textContent.trim(),
      ].filter(s => s && s !== '—');
      const text = `${name}\n${lines.join('\n')}`;
      const ok = await copyText(text);
      if (ok) showToast('Full address copied');
    });
  }
})();
