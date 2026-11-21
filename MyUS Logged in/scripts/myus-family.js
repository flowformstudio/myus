/* ──────────────────────────────────────────────────────────────────────
   MyUS Family tab — three interactive UX explorations.
   All state is in-memory per option so each direction can be demoed
   independently, always starting from empty.
   ────────────────────────────────────────────────────────────────────── */
(function () {
  const RATES = { 1: 27.84, 2: 14.07, 3: 9.93, 4: 7.69 };
  const SAVE  = { 1: 0, 2: 50, 3: 64, 4: 72 };
  const COLORS = ['#0c71c9', '#980cc9', '#18873d', '#ff7a00', '#1a9e9a', '#c94f7c']; // avatar/1–6 tokens (blue/500, purple/600, green/500, orange/600, teal/500, pink/500)
  const money = (n) => '$' + n.toFixed(2);
  const rateFor = (people) => RATES[Math.min(people, 4)];
  const saveFor = (people) => SAVE[Math.min(people, 4)];
  const initials = (m) => (m.first[0] + (m.last[0] || '')).toUpperCase();
  const today = () => new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  /* ── Option switcher ── */
  document.querySelectorAll('.fam-opt-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fam-opt-btn').forEach((b) => b.classList.remove('is-on'));
      btn.classList.add('is-on');
      document.querySelectorAll('.fam-option').forEach((o) => {
        o.hidden = o.dataset.option !== btn.dataset.opt;
      });
    });
  });

  /* ════════ OPTION 1 — inline form + rows ════════ */
  const o1 = { members: [] };
  const o1First = document.getElementById('o1-first');
  const o1Last  = document.getElementById('o1-last');
  const o1Email = document.getElementById('o1-email');
  const o1Hint  = document.getElementById('o1-hint');
  const o1List  = document.getElementById('o1-list');

  function o1Hint$(msg, cls) {
    o1Hint.textContent = msg;
    o1Hint.className = 'fam-form-hint' + (cls ? ' ' + cls : '');
  }

  document.getElementById('o1-add').addEventListener('click', () => {
    const m = { first: o1First.value.trim(), last: o1Last.value.trim(), email: o1Email.value.trim(), added: today() };
    if (!m.first || !m.last || !validEmail(m.email)) {
      o1Hint$('Please fill in first name, last name, and a valid email.', 'is-error');
      return;
    }
    o1.members.push(m);
    o1First.value = o1Last.value = o1Email.value = '';
    o1Hint$(m.first + ' was added — shipping together now saves you up to ' + saveFor(o1.members.length + 1) + '% each.*', 'is-ok');
    renderO1();
    o1First.focus();
  });

  function renderO1() {
    o1List.innerHTML = '';
    o1.members.forEach((m, i) => {
      const row = document.createElement('div');
      row.className = 'fam-row';
      if (m.editing) {
        row.classList.add('is-editing');
        row.innerHTML =
          '<div class="fam-edit-fields">' +
          '<input class="mp-input" value="' + m.first + '" data-f="first" />' +
          '<input class="mp-input" value="' + m.last + '" data-f="last" />' +
          '<input class="mp-input" value="' + m.email + '" data-f="email" />' +
          '</div>' +
          '<div class="fam-row-actions">' +
          '<button class="fam-act" data-a="save">Save</button>' +
          '<button class="fam-act" data-a="cancel">Cancel</button>' +
          '</div>';
        row.querySelector('[data-a=save]').addEventListener('click', () => {
          const g = (f) => row.querySelector('[data-f=' + f + ']').value.trim();
          if (!g('first') || !g('last') || !validEmail(g('email'))) return;
          Object.assign(m, { first: g('first'), last: g('last'), email: g('email'), editing: false });
          renderO1();
        });
        row.querySelector('[data-a=cancel]').addEventListener('click', () => { m.editing = false; renderO1(); });
      } else {
        row.innerHTML =
          '<div class="fam-avatar" style="background:' + COLORS[i % COLORS.length] + '">' + initials(m) + '</div>' +
          '<div class="fam-row-info">' +
          '<div class="fam-row-name">' + m.first + ' ' + m.last + '</div>' +
          '<div class="fam-row-email">' + m.email + '</div>' +
          '</div>' +
          '<span class="fam-row-added">Added ' + m.added + '</span>' +
          '<div class="fam-row-actions">' +
          '<button class="fam-act" data-a="edit">Edit</button>' +
          '<button class="fam-act danger" data-a="remove">Remove</button>' +
          '</div>';
        row.querySelector('[data-a=edit]').addEventListener('click', () => { m.editing = true; renderO1(); });
        row.querySelector('[data-a=remove]').addEventListener('click', () => { o1.members.splice(i, 1); renderO1(); });
      }
      o1List.appendChild(row);
    });
  }

  /* ════════ OPTION 2 — modal + table (★ chosen; mirrors Atlas Figma Flows 1–3) ════════ */
  const o2 = { members: [], editIndex: -1, busy: false };
  const o2Modal   = document.getElementById('o2-modal');
  const o2Confirm = document.getElementById('o2-confirm');
  const o2First = document.getElementById('o2-first');
  const o2Last  = document.getElementById('o2-last');
  const o2Email = document.getElementById('o2-email');
  const o2SaveBtn = document.getElementById('o2-save');

  function o2SetError(input, on) {
    input.classList.toggle('is-error', on);
    const msg = input.parentElement.querySelector('.fif-error');
    if (msg) msg.hidden = !on;
  }
  function o2ClearErrors() { [o2First, o2Last, o2Email].forEach((i) => o2SetError(i, false)); }
  [o2First, o2Last, o2Email].forEach((i) => i.addEventListener('input', () => o2SetError(i, false)));

  function o2Open(editIndex) {
    o2.editIndex = editIndex;
    const m = editIndex >= 0 ? o2.members[editIndex] : null;
    document.getElementById('o2-modal-title').textContent = m ? 'Edit ' + m.first + "\u2019s details" : 'Add to your Family';
    document.getElementById('o2-modal-sub').textContent = m ? 'Changes apply right away.' : "They'll be able to ship packages to your suite.";
    o2First.value = m ? m.first : '';
    o2Last.value  = m ? m.last  : '';
    o2Email.value = m ? m.email : '';
    // Notify-by-email option: only when adding, unchecked by default
    const o2Notify = document.getElementById('o2-notify');
    o2Notify.checked = false;
    document.querySelector('label[for="o2-notify"]').textContent = 'Notify them by email';
    document.getElementById('o2-notify-tip').textContent = m
      ? 'We\u2019ll email them the updated details.'
      : 'We\u2019ll email them your suite address and how to get started.';
    o2ClearErrors();
    o2SaveBtn.classList.remove('is-loading');
    o2.busy = false;
    o2Modal.hidden = false;
    o2First.focus();
  }
  function o2Close() { if (!o2.busy) o2Modal.hidden = true; }

  document.getElementById('o2-open').addEventListener('click', () => o2Open(-1));
  document.getElementById('o2-open2').addEventListener('click', () => o2Open(-1));
  document.getElementById('o2-close').addEventListener('click', o2Close);
  document.getElementById('o2-cancel').addEventListener('click', o2Close);
  o2Modal.addEventListener('click', (e) => { if (e.target === o2Modal) o2Close(); });
  document.getElementById('o2-done').addEventListener('click', () => { o2Confirm.hidden = true; });
  o2Confirm.addEventListener('click', (e) => { if (e.target === o2Confirm) o2Confirm.hidden = true; });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { o2Close(); o2Confirm.hidden = true; o2CloseRemove(); }
    if (e.key === 'Enter' && !o2Modal.hidden && !o2.busy) o2SaveBtn.click();
  });

  o2SaveBtn.addEventListener('click', () => {
    if (o2.busy) return;
    const m = { first: o2First.value.trim(), last: o2Last.value.trim(), email: o2Email.value.trim(), added: today() };
    // Flow 1 · Step 3 — inline errors, nothing else moves
    let bad = false;
    if (!m.first) { o2SetError(o2First, true); bad = true; }
    if (!m.last)  { o2SetError(o2Last, true);  bad = true; }
    if (!validEmail(m.email)) { o2SetError(o2Email, true); bad = true; }
    if (bad) { (!m.first ? o2First : !m.last ? o2Last : o2Email).focus(); return; }

    const isEdit = o2.editIndex >= 0;
    const notify = document.getElementById('o2-notify').checked;
    // Flow 1 · Step 5 — Save shows a spinner while we "send"
    o2.busy = true;
    o2SaveBtn.classList.add('is-loading');
    setTimeout(() => {
      if (isEdit) Object.assign(o2.members[o2.editIndex], m);
      else o2.members.push(m);
      o2.busy = false;
      o2SaveBtn.classList.remove('is-loading');
      o2Modal.hidden = true;
      renderO2();
      if (!isEdit) {
        // Flow 1 · Step 6 — confirmation (welcome email only if the owner opted in)
        document.getElementById('o2-confirm-title').textContent = m.first + ' was added to your Family';
        document.getElementById('o2-confirm-sub').textContent = notify
          ? 'We\u2019ve emailed them the suite address and next steps.'
          : 'We haven\u2019t emailed them. Share your suite address whenever you\u2019re ready.';
        o2Confirm.hidden = false;
        document.getElementById('o2-done').focus();
      }
    }, 900);
  });

  // Info icon tooltips: hover/focus via CSS, tap-to-toggle for touch
  document.querySelectorAll('.fam-info[data-tip]').forEach((b) => {
    b.addEventListener('click', (e) => { e.preventDefault(); b.classList.toggle('is-open'); });
    b.addEventListener('blur', () => b.classList.remove('is-open'));
  });

  const o2Remove = document.getElementById('o2-remove');
  function o2AskRemove(i) {
    const m = o2.members[i];
    o2.removeIndex = i;
    document.getElementById('o2-remove-title').textContent = 'Remove ' + m.first + ' from your Family?';
    document.getElementById('o2-remove-notify').checked = false; // off by default
    o2Remove.hidden = false;
    document.getElementById('o2-remove-cancel').focus();
  }
  function o2CloseRemove() { o2Remove.hidden = true; o2.removeIndex = -1; }
  document.getElementById('o2-remove-cancel').addEventListener('click', o2CloseRemove);
  o2Remove.addEventListener('click', (e) => { if (e.target === o2Remove) o2CloseRemove(); });
  document.getElementById('o2-remove-confirm').addEventListener('click', () => {
    if (o2.removeIndex >= 0) o2.members.splice(o2.removeIndex, 1);
    o2CloseRemove();
    renderO2();
  });

  function renderO2() {
    const empty = o2.members.length === 0;
    document.getElementById('o2-empty').hidden = !empty;
    document.getElementById('o2-tablewrap').hidden = empty;
    const tbody = document.getElementById('o2-rows');
    tbody.innerHTML = '';
    o2.members.forEach((m, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="fam-cell-name"><span class="fam-avatar" style="background:' + COLORS[i % COLORS.length] + '">' + initials(m) + '</span>' + m.first + ' ' + m.last + '</span></td>' +
        '<td class="fam-cell-email">' + m.email + '</td>' +
        '<td><div class="fam-row-actions">' +
        '<button class="fam-act" data-a="edit" type="button">Edit</button>' +
        '<button class="fam-act danger" data-a="remove" type="button">Remove</button>' +
        '</div></td>';
      tr.querySelector('[data-a=edit]').addEventListener('click', () => o2Open(i));
      // Flow 3 · Step 2 — "Are you sure?" before anything is removed
      tr.querySelector('[data-a=remove]').addEventListener('click', () => o2AskRemove(i));
      tbody.appendChild(tr);
    });
  }

  /* ════════ OPTION 3 — savings slots ════════ */
  const o3 = { members: [], editIndex: -1 };
  const o3Slots = document.getElementById('o3-slots');
  const o3Form  = document.getElementById('o3-form');
  const o3First = document.getElementById('o3-first');
  const o3Last  = document.getElementById('o3-last');
  const o3Email = document.getElementById('o3-email');

  function o3OpenForm(editIndex) {
    o3.editIndex = editIndex;
    const m = editIndex >= 0 ? o3.members[editIndex] : null;
    document.getElementById('o3-form-title').textContent = m ? 'Edit ' + m.first + "'s details" : 'Add to your Family';
    document.getElementById('o3-remove').hidden = !m;
    o3First.value = m ? m.first : '';
    o3Last.value  = m ? m.last  : '';
    o3Email.value = m ? m.email : '';
    o3Form.hidden = false;
    o3First.focus();
  }

  document.getElementById('o3-cancel').addEventListener('click', () => { o3Form.hidden = true; });
  document.getElementById('o3-remove').addEventListener('click', () => {
    if (o3.editIndex >= 0) o3.members.splice(o3.editIndex, 1);
    o3Form.hidden = true;
    renderO3();
  });
  document.getElementById('o3-save-btn').addEventListener('click', () => {
    const m = { first: o3First.value.trim(), last: o3Last.value.trim(), email: o3Email.value.trim(), added: today() };
    if (!m.first || !m.last || !validEmail(m.email)) return;
    if (o3.editIndex >= 0) Object.assign(o3.members[o3.editIndex], m);
    else o3.members.push(m);
    o3Form.hidden = true;
    renderO3();
  });

  function renderO3() {
    o3Slots.innerHTML = '';

    const you = document.createElement('div');
    you.className = 'fam-slot you';
    you.innerHTML = '<div class="fam-slot-circle">IG</div><div class="fam-slot-name">You</div><div class="fam-slot-sub">Account owner</div>';
    o3Slots.appendChild(you);

    o3.members.forEach((m, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fam-slot';
      b.innerHTML =
        '<div class="fam-slot-circle" style="background:' + COLORS[i % COLORS.length] + '">' + initials(m) + '</div>' +
        '<div class="fam-slot-name">' + m.first + '</div>' +
        '<div class="fam-slot-sub">Edit / remove</div>';
      b.addEventListener('click', () => o3OpenForm(i));
      o3Slots.appendChild(b);
    });

    // Empty slots up to a circle of four; always keep at least one open slot.
    const people = o3.members.length + 1;
    const emptyCount = Math.max(4 - people, 1);
    for (let s = 0; s < emptyCount; s++) {
      const next = people + s + 1;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fam-slot empty';
      b.innerHTML =
        '<div class="fam-slot-circle">+</div>' +
        '<div class="fam-slot-name">Add someone</div>' +
        '<div class="fam-slot-sub">' + (next <= 4 ? '→ ' + money(rateFor(next)) + ' each' : 'Free') + '</div>';
      b.addEventListener('click', () => o3OpenForm(-1));
      o3Slots.appendChild(b);
    }

    document.getElementById('o3-price').textContent = money(rateFor(people));
    const saveEl = document.getElementById('o3-save');
    saveEl.hidden = people < 2;
    saveEl.textContent = 'Saving ' + saveFor(people) + '%' + (people > 4 ? '+' : '') + ' each*';
    const nudge = document.getElementById('o3-nudge');
    if (people < 4) {
      nudge.hidden = false;
      nudge.textContent = 'Add one more person and this drops to ' + money(rateFor(people + 1)) + ' each.';
    } else {
      nudge.hidden = true;
    }
  }

  renderO1();
  renderO2();
  renderO3();

  /* ── Capture mode (?capture=<1|2|3>-<empty|filled>) — used for design
     exports: hides app chrome + internal switcher, seeds demo members. ── */
  const cap = new URLSearchParams(location.search).get('capture');
  if (cap) {
    const [opt, state] = cap.split('-');
    document.body.classList.add('capture-mode');
    document.querySelectorAll('.fam-option').forEach((o) => { o.hidden = o.dataset.option !== opt; });
    if (state === 'filled') {
      const seed = [
        { first: 'Maya', last: 'Haddad', email: 'maya@example.com', added: 'Aug 24, 2026' },
        { first: 'Tariq', last: 'Haddad', email: 'tariq@example.com', added: 'Aug 24, 2026' },
      ];
      if (opt === '1') { o1.members.push(...seed); renderO1(); }
      if (opt === '2') { o2.members.push(...seed); renderO2(); }
      if (opt === '3') { o3.members.push(...seed); renderO3(); }
    }
    if (opt === '2' && state === 'modal') { renderO2(); o2Open(-1); }
    if (opt === '2' && state === 'remove') { o2.members.push({ first: 'Maya', last: 'Haddad', email: 'maya@example.com', added: 'Aug 24, 2026' }); renderO2(); o2AskRemove(0); }
    const card = document.querySelector('.mp-card');
    const report = () => { document.title = 'CARDH=' + Math.ceil(card.getBoundingClientRect().height); };
    report();
    setTimeout(report, 300);
  }
})();
