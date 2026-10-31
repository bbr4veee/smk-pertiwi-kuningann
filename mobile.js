(function () {
  var d = document, h = d.querySelector('.top'); if (!h) return;
  var btn = h.querySelector('.nav-toggle'), mq = matchMedia('(max-width: 900px)');
  function set(open) {
    h.classList.toggle('open', open); d.documentElement.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    if (!open) Array.prototype.forEach.call(h.querySelectorAll('.dd.open'), function (x) { x.classList.remove('open'); });
  }
  btn.addEventListener('click', function () { set(!h.classList.contains('open')); });
  Array.prototype.forEach.call(h.querySelectorAll('.dd>a'), function (a) {
    a.addEventListener('click', function (e) {
      if (!mq.matches) return;
      e.preventDefault();
      var dd = a.parentNode, was = dd.classList.contains('open');
      Array.prototype.forEach.call(h.querySelectorAll('.dd.open'), function (x) { x.classList.remove('open'); });
      if (!was) dd.classList.add('open');
    });
  });
  Array.prototype.forEach.call(h.querySelectorAll('nav a[href], .cta-top'), function (a) {
    a.addEventListener('click', function (e) { if (!e.defaultPrevented) set(false); });
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && h.classList.contains('open')) { set(false); btn.focus(); } });
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () { if (!mq.matches) set(false); });
})();
