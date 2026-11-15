/* 심녕호 포트폴리오 · GSAP + ScrollTrigger + SplitText + Lenis (랜딩 3D는 flip.js) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ── Lenis ↔ ScrollTrigger ── */
  const lenis = new Lenis({ lerp: reduceMotion ? 1 : 0.09, smoothWheel: true });
  window.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.scrollTo(0, { immediate: true, force: true });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); lenis.scrollTo(a.getAttribute('href'), { duration: 1.6 }); }));

  /* ── 커서 + 마그네틱 ── */
  if (finePointer) {
    const cur = $('.cursor'), dot = $('.cursor-dot'), label = $('span', cur);
    gsap.set([cur, dot], { x: innerWidth / 2, y: innerHeight / 2 });
    const cx = gsap.quickTo(cur, 'x', { duration: 0.55, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: 0.55, ease: 'power3' });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12 }), dy = gsap.quickTo(dot, 'y', { duration: 0.12 });
    addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); });
    document.addEventListener('pointerover', (e) => { const t = e.target.closest('[data-cursor]'); if (t) { label.textContent = t.dataset.cursor; cur.classList.add('is-hover'); } });
    document.addEventListener('pointerout', (e) => { const t = e.target.closest('[data-cursor]'); if (t && !t.contains(e.relatedTarget)) cur.classList.remove('is-hover'); });
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.35)' }), yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.35)' });
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - (r.left + r.width / 2)) * 0.3); yTo((e.clientY - (r.top + r.height / 2)) * 0.3); });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  document.fonts.ready.then(init);
  addEventListener('load', () => ScrollTrigger.refresh());

  function init() {
    window.scrollTo(0, 0);
    setupScroll();
    ScrollTrigger.refresh();
  }

  function setupScroll() {
    gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    const nav = $('.nav');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => nav.classList.toggle('is-hidden', s.direction === 1 && s.scroll() > 200) });
    $$('[data-reveal]').forEach((el) => gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));

    /* MARQUEE */
    const loops = $$('.marquee-track').map((tr, i) => { const tw = gsap.to(tr, { xPercent: -50, ease: 'none', duration: i ? 34 : 28, repeat: -1 }); tw.totalTime(tw.duration() * 1000); return tw; });
    const mrows = $$('.marquee-row');
    let dir = 1, speed = 1, target = 1, skew = 0;
    ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onUpdate: (s) => { const v = s.getVelocity(); dir = s.direction; target = dir * (1 + Math.min(Math.abs(v) / 260, 6)); skew = gsap.utils.clamp(-10, 10, v / -180); } });
    gsap.ticker.add(() => { speed += (target - speed) * 0.08; target += (dir - target) * 0.04; skew *= 0.9; loops.forEach((tw, i) => tw.timeScale(speed * (i ? -1 : 1))); mrows.forEach((r) => gsap.set(r, { skewX: skew })); });

    /* ABOUT: 글자가 차례로 밝아지고, 마우스를 대면 돋보기처럼 커집니다 */
    const man = new SplitText('.manifesto-text', { type: 'words' });
    gsap.fromTo(man.words, { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '.manifesto-text', start: 'top 80%', end: 'bottom 55%', scrub: true } });
    magnifier($('.manifesto-text'));

    /* TIMELINE: 선이 그어지며 점이 차례로 */
    const tl = $('.tl');
    if (tl) {
      const items = $$('.tl-list li', tl);
      gsap.set(items, { y: 24, opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: tl, start: 'top 82%', end: 'bottom 55%', scrub: true } })
        .fromTo('.tl-line b', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0)
        .to(items, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.25, stagger: 0.15 }, 0.02);
    }

    /* CASES: 오른쪽 글이 지나가면 왼쪽 화면이 바뀝니다 */
    $$('.case').forEach((cs) => {
      const steps = $$('.cs-step', cs), vis = $$('.cs-vis', cs);
      let cur = -1;
      const set = (k) => {
        if (k === cur) return;
        const dir = k > cur ? 1 : -1;
        cur = k;
        steps.forEach((s, i) => s.classList.toggle('is-on', i === k));
        vis.forEach((v, i) => {
          if (i === k) {
            v.classList.add('is-on');
            gsap.fromTo(v, { opacity: 0, y: 40 * dir }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', overwrite: true });
            gsap.fromTo($$('.phone-f, .br-f, .res-grid > *, .kpi-pair > div, .note-card, .res-big.solo, .cs-cap, .ph-labels', v), { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.05, overwrite: true });
          } else if (v.classList.contains('is-on')) {
            v.classList.remove('is-on');
            gsap.to(v, { opacity: 0, y: -30 * dir, duration: 0.4, ease: 'power2.in', overwrite: true });
          }
        });
      };
      gsap.set(vis, { opacity: 0 });
      set(0);
      steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 62%', end: 'bottom 62%', onToggle: (self) => self.isActive && set(i) }));
      gsap.from($$('.case-nums > div', cs), { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: $('.case-nums', cs), start: 'top 88%', once: true } });
    });

    /* MORE: 카드가 차례로 */
    gsap.from('.mw', { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.more-grid', start: 'top 82%', once: true } });

    /* NUMBERS: 숫자가 올라갑니다 */
    $$('.nums-grid [data-count]').forEach((el) => {
      const to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      const o = { v: 0 };
      el.textContent = pre + '0' + suf;
      gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: () => { el.textContent = pre + Math.round(o.v).toLocaleString('ko-KR') + suf; } });
    });
    gsap.from('.nums-grid > div', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: '.nums-grid', start: 'top 85%', once: true } });

    /* PROCESS: 단계가 차례로, 선이 이어집니다 */
    gsap.from('.pr-steps li', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: '.pr-steps', start: 'top 82%', once: true } });

    /* OPS: 막대가 줄어들고 숫자가 내려감 */
    $$('.ops-card').forEach((card) => {
      const before = $('.ops-bars .before', card), after = $('.ops-bars .after', card), strong = $('strong[data-from]', card);
      const tl = gsap.timeline({ paused: true });
      tl.from(card, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' });
      if (before) tl.fromTo([before, after], { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, '-=0.3');
      if (after) tl.to(after, { scaleX: parseFloat(getComputedStyle(after).getPropertyValue('--r')), duration: 1.6, ease: 'power3.inOut' }, '+=0.15');
      if (strong) {
        const o = { v: +strong.dataset.from }, to = +strong.dataset.to, unit = strong.dataset.unit || '';
        tl.to(o, { v: to, duration: 1.6, ease: 'power3.inOut', onUpdate: () => { strong.textContent = o.v.toFixed(1) + unit; }, onComplete: () => { if (strong.dataset.end) strong.textContent = strong.dataset.end; } }, '<');
      }
      ScrollTrigger.create({ trigger: card, start: 'top 85%', once: true, onEnter: () => tl.play() });
    });

    /* CTA */
    const ctaSplit = new SplitText('.cta-title .line', { type: 'chars' });
    gsap.from(ctaSplit.chars, { yPercent: 145, duration: 1.2, ease: 'expo.out', stagger: 0.025, scrollTrigger: { trigger: '.cta', start: 'top 65%' } });
    gsap.from('.cta-btn', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 55%' } });
  }

  /* 돋보기: 커서를 따라다니는 동그란 렌즈 안에서 글자가 크게 보입니다 */
  function magnifier(box) {
    if (!finePointer || reduceMotion || !box) return;
    const S = 1.7, D = 230, Rr = D / 2;
    const lens = document.createElement('div');
    lens.className = 'lens';
    lens.setAttribute('aria-hidden', 'true');
    document.body.appendChild(lens);
    let clone = null, mx = 0, my = 0;
    const cur = document.querySelector('.cursor');
    const xTo = gsap.quickTo(lens, 'x', { duration: 0.35, ease: 'power3' }), yTo = gsap.quickTo(lens, 'y', { duration: 0.35, ease: 'power3' });
    function place() {
      if (!clone) return;
      const r = box.getBoundingClientRect();
      // 렌즈 중심 아래의 글자가 렌즈 가운데에 크게 오도록 복제본을 옮깁니다
      const lx = gsap.getProperty(lens, 'x'), ly = gsap.getProperty(lens, 'y');
      clone.style.transform = `translate(${Rr - (lx - r.left) * S}px, ${Rr - (ly - r.top) * S}px) scale(${S})`;
    }
    box.addEventListener('pointerenter', (e) => {
      clone = box.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.add('lens-text');
      clone.style.width = box.getBoundingClientRect().width + 'px';
      lens.replaceChildren(clone);
      mx = e.clientX; my = e.clientY;
      gsap.set(lens, { x: mx, y: my });
      gsap.to(lens, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)' });
      cur?.classList.add('is-lens-hide');
    });
    box.addEventListener('pointerleave', () => { gsap.to(lens, { scale: 0.4, opacity: 0, duration: 0.25 }); cur?.classList.remove('is-lens-hide'); });
    box.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; xTo(mx); yTo(my); });
    gsap.ticker.add(place);
    gsap.set(lens, { scale: 0.4, opacity: 0 });
  }
})();
