(function () {
  var doc = document, root = doc.documentElement;
  if (!root.classList.contains('mo')) root.classList.add('mo');
  window.__mo = 1;

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var vh = innerHeight, items = [], dirty = true, running = false;
  var $$ = function (s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); };

  /* 1. Pecah teks jadi kata (inline, jadi tata letak tidak berubah) */
  function split(el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.nodeValue.split(/(\s+)/), frag = doc.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(p)); return; }
            var s = doc.createElement('span'); s.className = 'w'; s.textContent = p;
            s.style.opacity = '.14'; s.style.filter = 'blur(6px)';
            frag.appendChild(s); words.push(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    return words;
  }
  $$('.sambutan h2,.sb-isi p,.aktivitas h2,.akt-d,.mitra h2,.ppdb h2,.ppdb p,.head h2').forEach(function (el) {
    var w = split(el);
    if (w.length) items.push({ k: 'words', el: el, w: w, c: 0 });
  });

  /* 2. Efek scroll-linked lain */
  var hero = doc.querySelector('.hero');
  if (hero) items.push({ k: 'hero', el: hero, in_: hero.querySelector('.hero-in'), vid: hero.querySelector('.vbg video'), c: 0 });
  $$('.sb-foto').forEach(function (el) { items.push({ k: 'photo', el: el, c: 0 }); });
  $$('.sb-bar').forEach(function (el) { items.push({ k: 'bar', el: el, c: 0 }); });
  $$('.ppdb').forEach(function (el) { items.push({ k: 'ppdb', el: el, in_: el.querySelector('.ppdb-in'), c: 0 }); });
  $$('.feat .img.photo img').forEach(function (el) { items.push({ k: 'zoom', el: el, box: el.parentNode, c: 0 }); });

  /* 3. Kemunculan bertahap (IntersectionObserver) */
  var rv = $$('.akt,.mt,.feat,.it,.card,.sb-label,.ft-col,.ft-bot,.center .btn,.wrap>h1,.head .more,.ppdb-btn');
  if ('IntersectionObserver' in window) {
    rv.forEach(function (el) { el.classList.add('rv'); });
    var io = new IntersectionObserver(function (es) {
      var batch = es.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
      batch.forEach(function (e, i) {
        var el = e.target; io.unobserve(el);
        el.style.setProperty('--d', (i * 0.09).toFixed(2) + 's');
        el.classList.add('in');
        var done = function (ev) {
          if (ev.propertyName !== 'transform') return;
          el.removeEventListener('transitionend', done);
          el.classList.remove('rv', 'in'); el.style.removeProperty('--d');
        };
        el.addEventListener('transitionend', done);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* 4. Mesin animasi: nilai dihaluskan (damping) agar terasa mengalir */
  function target(it) {
    var r = it.el.getBoundingClientRect(), h = r.height;
    switch (it.k) {
      case 'hero': return clamp(-r.top / Math.max(h, 1), 0, 1);
      case 'words': return clamp((vh * 0.9 - r.top) / (vh * 0.28 + h * 0.65), 0, 1);
      case 'photo': return clamp((vh * 0.95 - r.top) / (vh * 0.55), 0, 1);
      case 'bar': return clamp((vh * 0.92 - r.top) / (vh * 0.2), 0, 1);
      case 'ppdb': return clamp((vh - r.top) / (vh * 0.85), 0, 1);
      case 'zoom': var b = it.box.getBoundingClientRect(); return clamp((vh - b.top) / (vh + b.height), 0, 1);
    }
    return 0;
  }
  function apply(it, p) {
    var s;
    switch (it.k) {
      case 'hero':
        it.in_ && (it.in_.style.transform = p ? 'translate3d(0,' + (p * 90).toFixed(1) + 'px,0) scale(' + (1 - p * 0.08).toFixed(3) + ')' : '',
          it.in_.style.opacity = p ? (1 - p * 1.35 < 0 ? 0 : 1 - p * 1.35).toFixed(3) : '',
          it.in_.style.filter = p > 0.02 ? 'blur(' + (p * 10).toFixed(1) + 'px)' : '');
        it.vid && (it.vid.style.transform = p ? 'scale(' + (1 + p * 0.22).toFixed(3) + ')' : '');
        break;
      case 'words':
        var n = it.w.length;
        for (var i = 0; i < n; i++) {
          var t = clamp((p * 1.35 - (i / n)) / 0.35, 0, 1);
          it.w[i].style.opacity = (0.14 + 0.86 * t).toFixed(3);
          it.w[i].style.filter = t < 0.99 ? 'blur(' + ((1 - t) * 6).toFixed(1) + 'px)' : '';
        }
        break;
      case 'photo':
        s = 1 - (1 - p) * 0.12;
        it.el.style.setProperty('--p', p.toFixed(3));
        it.el.style.opacity = (0.25 + 0.75 * p).toFixed(3);
        it.el.style.transform = p < 0.999 ? 'translate3d(0,' + ((1 - p) * 54).toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ')' : '';
        break;
      case 'bar':
        it.el.style.setProperty('--p', p.toFixed(3)); break;
      case 'ppdb':
        var q = 1 - p;
        it.el.style.clipPath = q > 0.002 ? 'inset(' + (q * 9).toFixed(2) + '% ' + (q * 6).toFixed(2) + '% round ' + (q * 28).toFixed(1) + 'px)' : '';
        it.in_ && (it.in_.style.transform = q > 0.002 ? 'translate3d(0,' + (q * 46).toFixed(1) + 'px,0)' : '');
        break;
      case 'zoom':
        it.el.style.transform = 'scale(' + (1.16 - p * 0.16).toFixed(3) + ')'; break;
    }
  }
  /* nilai awal tanpa animasi untuk elemen yang sudah lewat / sudah terlihat */
  items.forEach(function (it) { it.c = target(it); apply(it, it.c); });

  function frame() {
    var moving = false;
    for (var i = 0; i < items.length; i++) {
      var it = items[i], r = it.el.getBoundingClientRect();
      if (r.bottom < -vh * 0.5 && it.c >= 0.999 && it.k !== 'hero') continue;   // sudah selesai & di atas layar
      if (r.top > vh * 1.5) continue;                                          // jauh di bawah
      var tg = target(it), d = tg - it.c;
      if (Math.abs(d) > 0.0007) { it.c = lerp(it.c, tg, 0.14); moving = true; } else it.c = tg;
      apply(it, it.c);
    }
    if (moving || dirty) { dirty = false; requestAnimationFrame(frame); } else running = false;
  }
  function kick() { dirty = true; if (!running) { running = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', function () { vh = innerHeight; kick(); });
  kick();
})();
