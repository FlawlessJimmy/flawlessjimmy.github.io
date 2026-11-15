// 랜딩: 휘어진 화면 한 장씩. 스크롤하면 책을 넘기듯 오른쪽 반장이 가운데 접는 선을 축으로 들려 왼쪽으로 넘어갑니다 (최근 작업 → EarthMera)
import * as THREE from 'three';

const SLIDES = [
  { img: 'shots/cover-off8.jpg', year: '2026.11', kind: '개인 프로젝트 · SaaS 제품 사이트', title: 'OFF8 업무 자동화 대시보드', desc: '직접 운영한 유료 PoC 3건을 바탕으로, 흩어진 엑셀이 대시보드가 되는 과정과 AI 상담을 제품 사이트로 보여 줍니다.', tags: ['사업 기획', '브랜딩', '구현'], more: '#more', link: 'https://flawlessjimmy.github.io/off8/' },
  { img: 'shots/cover-tessera.jpg', year: '2026.11', kind: '개인 프로젝트 · 자재 플랫폼', title: 'Tessera 인테리어 자재 플랫폼', desc: '34종 자재의 질감과 디테일을 가까이서 보고, 가격을 비교해 평수별 견적까지 한 번에 내는 인테리어 자재 플랫폼입니다.', tags: ['자재 디테일', '가격 · 견적', 'Three.js'], more: '#more', link: 'https://flawlessjimmy.github.io/tessera/' },
  { img: 'shots/cover-maoxga.jpg', year: '2026', kind: '클라이언트 · 카페24 자사몰', title: '묘향가 자사몰 리뉴얼', desc: '카페24 자사몰 전 페이지를 모바일 우선으로 다시 설계하고 구현했습니다. 회원·장바구니·네이버페이·실시간 상담까지 연결합니다.', tags: ['Cafe24', 'UX 설계', '구현'], more: '#more', link: 'https://www.maoxga.com/' },
  { img: 'shots/cover-kanto.jpg', year: '2026', kind: '클라이언트 · 업무 시스템', title: 'KANTO 발주 자동화', desc: '엑셀 수작업 대조를 웹 흐름으로 바꿨습니다. 자동 매칭률 98%, 월간 리포트 생성 시간은 85초에서 4초로 줄었습니다.', tags: ['Web App', '엑셀 변환', 'Cloudflare'], more: '#more', link: 'https://kanto-order-server.pages.dev' },
  { img: 'shots/cover-h2b.jpg', year: '2026', kind: '클라이언트 · 경영 대시보드', title: 'H2B 운영 대시보드', desc: '월 8천만 원대 매출을 다루는 대시보드를 설계부터 운영까지 맡았습니다. AS 칸반, AI 상담 큐, 매출·순이익 계산을 한곳에 모았습니다.', tags: ['FastAPI', 'PostgreSQL', '운영'], more: '#case-h2b', link: 'https://h2b-3cr.pages.dev' },
  { img: 'shots/cover-earthmera.jpg', year: '2024 — 2025', kind: 'EarthMera · Founding Product Designer', title: 'EarthMera, 세 개의 프로덕트', desc: '뉴욕 친환경 스타트업의 파운딩 디자이너로 탄소 기록 앱, 이벤트 플랫폼, 링크인바이오 ZIGU를 기획부터 핸드오프까지 맡았습니다.', tags: ['신규 가입 +1,000', '미션 완료 90%', '구독 +100'], more: '#case-earthmera', link: 'https://www.earthmera.com/ko/' },
];

// 작업마다 바탕에 번지는 빛의 색
const ACC = [[99, 54, 232], [255, 111, 15], [176, 196, 92], [60, 123, 255], [60, 207, 230], [98, 240, 221]];
const $ = (s) => document.querySelector(s);
const N = SLIDES.length;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const R = 5.2, ARC = 1.0; // 원통 반지름 · 화면이 차지하는 각도(라디안)

const section = $('#top');
const canvas = $('#flipGl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  section.classList.add('no-gl');
}

// ---------- 글 정보 ----------
const no = $('#fiNo'), kind = $('#fiKind'), title = $('#fiTitle'), desc = $('#fiDesc'), year = $('#fiYear'), tags = $('#fiTags'), link = $('#fiLink'), more = $('#fiMore');
$('#fiTotal').textContent = '/ ' + String(N).padStart(2, '0');
const dots = $('#flipDots');
dots.innerHTML = SLIDES.map((s, i) => `<button type="button" aria-label="${s.title}" data-i="${i}"></button>`).join('');
const fallback = $('#flipImg');
function fill(i) {
  const s = SLIDES[i];
  no.textContent = String(i + 1).padStart(2, '0');
  kind.textContent = s.kind; title.textContent = s.title; desc.textContent = s.desc; year.textContent = s.year;
  tags.innerHTML = s.tags.map((t) => `<span>${t}</span>`).join('');
  link.hidden = !s.link;
  if (s.link) link.href = s.link;
  more.setAttribute('href', s.more);
  [...dots.children].forEach((d, k) => d.classList.toggle('is-on', k === i));
  if (fallback) fallback.src = s.img;
}
let shown = 0;
fill(0);
function show(i) {
  if (i === shown) return;
  const dir = i > shown ? 1 : -1;
  shown = i;
  const rows = document.querySelectorAll('.flip-info .swap');
  if (!window.gsap || reduced) { fill(i); return; }
  gsap.timeline()
    .to(rows, { yPercent: -60 * dir, opacity: 0, duration: 0.22, ease: 'power2.in', stagger: 0.025, overwrite: true })
    .add(() => fill(shown))
    .fromTo(rows, { yPercent: 60 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.04 });
}
more.addEventListener('click', (e) => {
  const t = document.querySelector(more.getAttribute('href'));
  if (!t) return;
  e.preventDefault();
  window.lenis ? window.lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' });
});

// ---------- 3D: 책장처럼 넘어가는 휘어진 화면 ----------
let pos = 0, target = 0;
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const book = new THREE.Group();
  scene.add(book);
  const HALF = ARC / 2, SEG = 40;
  const H = ARC * R * 0.625;

  // 반쪽 판: 접는 선(가운데)에서 바깥쪽 가장자리까지. side -1 = 왼쪽, +1 = 오른쪽
  // 좌표는 접는 선 기준: x = side·R·sin(a), z = R·(1−cos a) (가장자리가 화면 쪽으로 다가오는 오목한 모양)
  function halfGeo(uFrom, uTo) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array((SEG + 1) * 2 * 3), uv = new Float32Array((SEG + 1) * 2 * 2), idx = [];
    for (let k = 0; k <= SEG; k++) {
      const t = k / SEG, u = uFrom + (uTo - uFrom) * t;
      for (let r = 0; r < 2; r++) {
        const j = k * 2 + r;
        uv[j * 2] = u; uv[j * 2 + 1] = r;
        pos[j * 3 + 1] = (r - 0.5) * H;
      }
      if (k < SEG) { const a = k * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }
  // 반쪽 판의 모양: 접는 선에서 t(0~1)만큼 떨어진 점. theta = 넘김 각도(0 왼쪽에 누움 ~ π 오른쪽에 누움)
  function shape(g, side, theta = 0) {
    const p = g.attributes.position;
    const c = Math.cos(theta), s = Math.sin(theta);
    for (let k = 0; k <= SEG; k++) {
      const a = (k / SEG) * HALF;
      const x0 = side * R * Math.sin(a);
      const z0 = R * (1 - Math.cos(a)) * (side < 0 ? c : 1); // 넘어가는 동안 휘는 방향이 뒤집힙니다
      // 접는 선(세로축)을 중심으로 회전
      const x = side < 0 ? x0 * c + z0 * s * 0 : x0, z = side < 0 ? -x0 * s + z0 : z0;
      for (let r = 0; r < 2; r++) { const j = k * 2 + r; p.setX(j, x); p.setZ(j, z + (side < 0 ? 0.002 : 0)); }
    }
    p.needsUpdate = true;
    g.computeBoundingSphere();
  }

  // 정적인 왼쪽·오른쪽 판 + 넘어가는 한 장(앞면·뒷면)
  const gL = halfGeo(0.5, 0), gR = halfGeo(0.5, 1), gLeafF = halfGeo(0.5, 1), gLeafB = halfGeo(0.5, 0);
  shape(gL, -1); shape(gR, 1);
  const mat = (side) => new THREE.MeshBasicMaterial({ transparent: true, side, color: 0x111417 });
  const mL = new THREE.Mesh(gL, mat(THREE.DoubleSide)), mR = new THREE.Mesh(gR, mat(THREE.DoubleSide));
  // 넘기는 장: 오른쪽에 누운 동안은 앞면(A의 오른쪽), 왼쪽에 내려앉으면 뒷면(B의 왼쪽)이 보입니다
  const leafF = new THREE.Mesh(gLeafF, mat(THREE.FrontSide)), leafB = new THREE.Mesh(gLeafB, mat(THREE.BackSide));
  leafF.renderOrder = 2; leafB.renderOrder = 2;
  book.add(mL, mR, leafF, leafB);
  // 접는 선을 따라 생기는 얇은 그림자
  const spine = new THREE.Mesh(new THREE.PlaneGeometry(0.06, H), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 }));
  spine.position.z = 0.004; spine.renderOrder = 3;
  book.add(spine);

  // 모서리를 둥글게 깎은 이미지 텍스처
  const loader = new THREE.ImageLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const tex = SLIDES.map((s) => {
    const cv = document.createElement('canvas');
    cv.width = 1600; cv.height = 1000;
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    t.userData.ready = false;
    loader.load(s.img, (img) => {
      const g = cv.getContext('2d');
      g.save(); g.beginPath(); g.roundRect(4, 4, 1592, 992, 40); g.clip();
      g.drawImage(img, 0, 0, 1600, 1000); g.restore();
      g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.16)';
      g.beginPath(); g.roundRect(5.5, 5.5, 1589, 989, 39); g.stroke();
      t.needsUpdate = true; t.userData.ready = true;
    });
    return t;
  });

  // 넘기는 장의 모양: 접는 선에서 바깥 가장자리까지 조금씩 방향을 바꾸며 이어 붙입니다.
  // 가장자리가 접는 선보다 살짝 늦게 따라와 종이가 휘듯 말리는 느낌이 납니다.
  const DS = (R * HALF) / SEG, CURL = 0.6;
  function leafShape(theta) {
    const flipC = Math.cos(theta), lag = CURL * Math.sin(theta);
    let x = 0, z = 0;
    const pts = [[0, 0]];
    for (let k = 1; k <= SEG; k++) {
      const sMid = (k - 0.5) * DS, t = (k - 0.5) / SEG;
      // 누운 상태의 곡면 방향(+x에서 화면 쪽으로 휨) · 넘김 각도 · 가장자리일수록 늦게 따라옴
      const d = (sMid / R) * flipC + (theta - lag * t);
      x += Math.cos(d) * DS; z += Math.sin(d) * DS;
      pts.push([x, z]);
    }
    [gLeafF, gLeafB].forEach((g) => {
      const p = g.attributes.position;
      for (let k = 0; k <= SEG; k++) for (let r = 0; r < 2; r++) { const j = k * 2 + r; p.setX(j, pts[k][0]); p.setZ(j, pts[k][1] + 0.006); }
      p.needsUpdate = true;
      g.computeBoundingSphere();
    });
  }

  // 바탕: 천천히 떠다니는 빛 알갱이 (넘길 때 바람처럼 함께 휩쓸립니다)
  const PC = 320, pp = new Float32Array(PC * 3), pseed = new Float32Array(PC);
  for (let k = 0; k < PC; k++) { pp[k * 3] = (Math.random() - 0.5) * 22; pp[k * 3 + 1] = (Math.random() - 0.5) * 12; pp[k * 3 + 2] = -1.5 - Math.random() * 9; pseed[k] = Math.random() * 10; }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const pmat = new THREE.PointsMaterial({ size: 0.12, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.75, color: 0x62f0dd });
  const dust = new THREE.Points(pg, pmat);
  scene.add(dust);
  const pin = section.querySelector('.flip-pin');
  let accKey = '';

  // 화면 크기에 맞춰 판이 위쪽 60% 안에 들어오도록 카메라 거리를 계산합니다
  const camTarget = new THREE.Vector3();
  function resize() {
    const w = section.clientWidth, h = section.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const hf = w < 760 ? 0.34 : 0.5;
    let d = H / 2 / (t * hf);
    const halfW = R * Math.sin(HALF), sag = R * (1 - Math.cos(HALF));
    const maxWf = w < 760 ? 0.9 : 0.66;
    const wf = halfW / ((d - sag) * t * camera.aspect);
    if (wf > maxWf) d = halfW / (maxWf * t * camera.aspect) + sag;
    camera.position.set(0, 0, d);
    camTarget.set(0, 0, 0);
    camera.lookAt(camTarget);
    book.position.y = (w < 760 ? 0.3 : 0.12) * t * d;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(section);
  const start = performance.now();
  let mx = 0, my = 0, smx = 0, smy = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  const bright = (m, v) => m.material.color.setScalar(v);

  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible) return;
    const intro = reduced ? 1 : Math.min(1, (performance.now() - start) / 1300);
    const e = 1 - Math.pow(1 - intro, 3);
    const prev = pos;
    pos += (target - pos) * (reduced ? 1 : 0.06);
    if (Math.abs(target - pos) < 1e-4) pos = target;
    // 거의 다 넘어갔거나 거의 안 넘어간 상태는 온전한 한 장으로 봅니다 (반쪽만 바뀌어 보이는 틈 방지)
    let i = Math.min(N - 1, Math.floor(pos)), f = Math.min(1, Math.max(0, pos - i));
    if (f > 0.995) { i = Math.min(N - 1, i + 1); f = 0; }
    if (f < 0.005) f = 0;
    const A = tex[i], B = tex[Math.min(N - 1, i + 1)];
    // 넘김: 오른쪽 반장(A의 오른쪽)이 접는 선을 축으로 들려 왼쪽으로 넘어가고, 뒷면에는 B의 왼쪽이 있습니다
    const fe = f * f * (3 - 2 * f); // 천천히 들리고, 가운데서 빠르고, 천천히 내려앉습니다
    const theta = fe * Math.PI;
    mR.material.map = f > 0 ? B : A; // 들린 장 아래로 B의 오른쪽이 드러납니다
    mL.material.map = A;              // 아직 덮이지 않은 왼쪽은 A
    leafF.material.map = A; leafB.material.map = B;
    [mL, mR, leafF, leafB].forEach((m) => { m.material.needsUpdate = m.material.userData.map !== m.material.map; m.material.userData.map = m.material.map; });
    leafShape(theta);
    leafF.visible = leafB.visible = f > 0;
    // 밝기: 들린 장은 세워질수록 어둡게, 그 아래 드러나는 면은 그림자에서 밝아집니다
    const ready = A.userData.ready ? 1 : 0.06;
    const lit = Math.abs(Math.cos(theta));
    bright(leafF, (0.35 + 0.65 * lit) * e * ready);
    bright(leafB, (0.35 + 0.65 * lit) * e * ready);
    bright(mR, (f > 0 ? 0.42 + 0.58 * Math.min(1, fe * 1.5) : 1) * e * ready);
    bright(mL, (1 - 0.5 * Math.max(0, fe - 0.5) * 2) * e * ready);
    // 바탕 빛: 두 작업의 색 사이를 넘김에 맞춰 섞습니다
    const c0 = ACC[i], c1 = ACC[Math.min(N - 1, i + 1)];
    const rgb = c0.map((v, k) => Math.round(v + (c1[k] - v) * fe));
    const key = rgb.join(',');
    if (key !== accKey) { accKey = key; pin.style.setProperty('--acc', key); pmat.color.setRGB(0.55 + rgb[0] / 570, 0.55 + rgb[1] / 570, 0.55 + rgb[2] / 570); }
    // 빛 알갱이: 천천히 떠오르고, 넘기는 속도만큼 옆으로 휩쓸립니다
    const now = performance.now() / 1000, vel = (pos - prev) * 60;
    const pa = pg.attributes.position;
    for (let k = 0; k < PC; k++) {
      let y = pa.getY(k) + 0.0035 + Math.sin(now * 0.6 + pseed[k]) * 0.002;
      if (y > 6) y = -6;
      let x = pa.getX(k) - vel * 0.05 * (1 + (pa.getZ(k) + 10) * 0.08);
      if (x < -11) x += 22; if (x > 11) x -= 22;
      pa.setXY(k, x, y);
    }
    pa.needsUpdate = true;
    pmat.opacity = 0.55 + Math.min(0.35, Math.abs(vel) * 0.6);
    spine.material.opacity = 0.35 * Math.sin(theta);
    // 등장 + 마우스에 따라 살짝 기울기
    smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
    book.rotation.y = (1 - e) * -0.6 + smx * 0.18 + Math.sin(fe * Math.PI) * 0.06;
    book.rotation.x = smy * 0.08;
    book.scale.setScalar(0.88 + 0.12 * e);
    renderer.render(scene, camera);
  };
  tick();

  // 앞 화면을 누르면 사이트 열기
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  canvas.addEventListener('click', (ev) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const s = SLIDES[Math.round(pos)];
    if (ray.intersectObjects([mL, mR]).length && s.link) window.open(s.link, '_blank', 'noopener');
  });
}

// ---------- 스크롤: 한 장씩 넘기기 ----------
function setupScroll() {
  if (!window.ScrollTrigger) return;
  const st = ScrollTrigger.create({
    trigger: section, pin: '.flip-pin', start: 'top top', refreshPriority: 1, end: () => '+=' + Math.round(innerHeight * 0.85 * (N - 1)),
    onUpdate: (s) => {
      target = s.progress * (N - 1);
      show(Math.max(0, Math.min(N - 1, Math.round(target))));
    },
  });
  // 멈추면 가까운 장에 착 붙기
  let t = null;
  window.lenis?.on('scroll', () => {
    clearTimeout(t);
    const y = window.lenis.scroll;
    if (y <= st.start + 2 || y >= st.end - 2) return;
    t = setTimeout(() => {
      const i = Math.round(target);
      if (Math.abs(target - i) > 0.01) window.lenis.scrollTo(st.start + (i / (N - 1)) * (st.end - st.start), { duration: 1.3, easing: (x) => 1 - Math.pow(1 - x, 3) });
    }, 180);
  });
  dots.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const y = st.start + (+b.dataset.i / (N - 1)) * (st.end - st.start);
    window.lenis ? window.lenis.scrollTo(y, { duration: 1.2 }) : scrollTo(0, y);
  });
  // 확인용: ?flip=2.5 → 그 위치로 (스크롤 없이 장면만 고정하려면 ?fliphold=2.5)
  const qs = new URLSearchParams(location.search);
  if (qs.has('flip')) setTimeout(() => window.lenis?.scrollTo(st.start + (+qs.get('flip') / (N - 1)) * (st.end - st.start), { immediate: true, force: true }), 300);
  if (qs.has('fliphold')) { const v = +qs.get('fliphold'); setInterval(() => { target = v; pos = v; }, 16); }
}
setupScroll();
