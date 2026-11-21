/* ──────────────────────────────────────────────────────────────────────
   location.js — hydrates pages/location.html from ?code=<iso2>,
   falling back to the first favorite or US. Wires the favorite-star
   button into the same `myus.favorites.v1` storage used by the dashboard.
   ────────────────────────────────────────────────────────────────────── */
(function () {
  const isSubpage = /\/pages\//.test(location.pathname);
  const root = isSubpage ? '../' : '';
  const STORAGE_KEY = 'myus.favorites.v1';
  const MAX_FAVS = 6;

  function favs() {
    try { const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); return Array.isArray(v) ? v : null; } catch { return null; }
  }
  function saveFavs(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {} }

  async function main() {
    let data;
    try {
      const r = await fetch(root + 'data/countries.json');
      data = await r.json();
    } catch (e) {
      console.error('location: failed to load countries.json', e);
      return;
    }

    const params = new URLSearchParams(location.search);
    const code = (params.get('code') || (favs() || data.favorites)[0] || 'us').toLowerCase();
    const country = data.countries.find(c => c.code === code);
    if (!country) {
      document.querySelector('[data-loc-name]').textContent = 'Location not found';
      return;
    }

    document.title = `${country.name} · MyUS.com`;
    document.querySelector('[data-loc-name]').textContent = country.name;
    document.querySelector('[data-loc-flag]').style.backgroundImage = `url('${country.flag}')`;

    const favList = favs() || data.favorites || [];
    const favBtn = document.querySelector('[data-loc-fav]');
    const favLabel = document.querySelector('[data-loc-fav-label]');
    function paint() {
      const isFav = favList.includes(code);
      favBtn.textContent = isFav ? '★' : '☆';
      favBtn.classList.toggle('is-fav', isFav);
      favLabel.textContent = isFav ? 'Favorite location' : 'Set as Favorite location';
    }
    paint();

    favBtn.addEventListener('click', () => {
      const idx = favList.indexOf(code);
      if (idx >= 0) {
        favList.splice(idx, 1);
      } else {
        if (favList.length >= MAX_FAVS) {
          // borrow the dashboard's limit toast if it has been styled in
          alert(`Favorites limit reached (${MAX_FAVS}/${MAX_FAVS}). Unfavorite one to add another.`);
          return;
        }
        favList.push(code);
      }
      saveFavs(favList);
      paint();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
