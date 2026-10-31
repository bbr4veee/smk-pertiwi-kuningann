(function () {
  /* Loading hanya dilewati jika pengunjung baru saja mengeklik link internal di tab ini */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.origin !== location.origin) return;
    if (a.pathname === location.pathname && a.hash) return;
    try { sessionStorage.setItem('skipLoader', Date.now()); } catch (x) {}
  }, true);
  var root = document.documentElement, el = document.getElementById('loader');
  if (!el || !root.classList.contains('loading')) { root.classList.remove('hold'); if (el) el.remove(); return; }
  var bar = el.querySelector('.ld-bar i');
  var start = performance.now(), MIN = 3000, ready = false, p = 0, finished = false;
  function ok() { ready = true; }
  if (document.readyState === 'complete') ok(); else addEventListener('load', ok);
  setTimeout(ok, 6000);                                   // jaga-jaga jika ada aset yang lambat
  function finish() {
    if (finished) return; finished = true;
    el.classList.add('out');
    setTimeout(function () { root.classList.remove('hold'); }, 250);   // intro hero mulai saat loading memudar
    setTimeout(function () { root.classList.remove('loading'); el.remove(); }, 800);
  }
  (function tick(now) {
    var t = now - start, u = Math.min(1, Math.max(0, (t - 900) / (MIN - 900 - 500)));
    var e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;            // pelan di awal, makin cepat
    var goal = ready && t >= MIN ? 100 : Math.min(92, e * 92);
    p += (goal - p) * 0.14; if (goal === 100 && p > 99.5) p = 100;
    bar.style.transform = 'scaleX(' + (p / 100) + ')';
    if (p >= 100) setTimeout(finish, 350); else requestAnimationFrame(tick);
  })(start);
})();
