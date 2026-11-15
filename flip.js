// 랜딩: 휘어진 화면 한 장씩, 스크롤하면 원통을 따라 다음 작업이 넘어옵니다 (최근 작업 → EarthMera)
import * as THREE from 'three';

const SLIDES = [
  { img: 'shots/flip-off8.jpg', year: '2026.11', kind: '개인 프로젝트 · SaaS 제품 사이트', title: 'OFF8 업무 자동화 대시보드', desc: '직접 운영한 유료 PoC 3건을 바탕으로, 흩어진 엑셀이 대시보드가 되는 과정과 AI 상담을 제품 사이트로 보여 줍니다.', tags: ['사업 기획', '브랜딩', '구현'], link: 'https://flawlessjimmy.github.io/off8/' },
  { img: 'shots/flip-tessera.jpg', year: '2026.11', kind: '개인 프로젝트 · 3D 커머스', title: 'Tessera 인테리어 자재 플랫폼', desc: '마루·타일·벽지를 방 안에 직접 깔아 보고 고르는 자재 플랫폼입니다. 회전문처럼 넘어가는 3D 방으로 시작합니다.', tags: ['Three.js', 'GSAP', '기획 · 디자인'], link: 'https://flawlessjimmy.github.io/tessera/' },
  { img: 'shots/flip-maoxga.jpg', year: '2026', kind: '클라이언트 · 카페24 자사몰', title: '묘향가 자사몰 리뉴얼', desc: '카페24 자사몰 전 페이지를 모바일 우선으로 다시 설계하고 구현했습니다. 회원·장바구니·네이버페이·실시간 상담까지 연결합니다.', tags: ['Cafe24', 'UX 설계', '구현'], link: 'https://www.maoxga.com/' },
  { img: 'shots/flip-kanto.jpg', year: '2026', kind: '클라이언트 · 업무 시스템', title: 'KANTO 발주 자동화', desc: '엑셀 수작업 대조를 웹 흐름으로 바꿨습니다. 자동 매칭률 98%, 월간 리포트 생성 시간은 85초에서 4초로 줄었습니다.', tags: ['Web App', '엑셀 변환', 'Cloudflare'], link: 'https://kanto-order-server.pages.dev' },
  { img: 'shots/flip-h2b.jpg', year: '2026', kind: '클라이언트 · 경영 대시보드', title: 'H2B 운영 대시보드', desc: '월 8천만 원대 매출을 다루는 대시보드를 설계부터 운영까지 맡았습니다. AS 칸반, AI 상담 큐, 매출·순이익 계산을 한곳에 모았습니다.', tags: ['FastAPI', 'PostgreSQL', '운영'], link: 'https://h2b-3cr.pages.dev' },
  { img: 'shots/flip-ticketeer.jpg', year: '2025', kind: 'EarthMera · New York', title: 'Ticketeer 이벤트 플랫폼', desc: '앱 설치 없이 QR로 참여하는 이벤트 플랫폼입니다. UKIS 2025(500명, 21개 부스)에 첫 상용 납품했고, 미션 완료율 90%를 기록했습니다.', tags: ['0 → 1 설계', '참가자 · 부스 · 주최자', '상용 납품'], link: '' },
  { img: 'shots/flip-earthmera.jpg', year: '2024 — 2025', kind: 'EarthMera · Lead Product Designer', title: 'EarthMera, 세 개의 프로덕트', desc: '뉴욕 친환경 스타트업의 유일한 디자이너로 탄소 기록 앱, 이벤트 플랫폼, 링크인바이오 ZIGU를 기획부터 핸드오프까지 맡았습니다.', tags: ['신규 가입 +1,000', '미션 완료 90%', '구독 +100'], link: '' },
];

const $ = (s) => document.querySelector(s);
const N = SLIDES.length;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const R = 4.2, ARC = 1.2, STEP = (96 * Math.PI) / 180;

const section = $('#top');
const canvas = $('#flipGl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  section.classList.add('no-gl');
}

// ---------- 글 정보 ----------
const no = $('#fiNo'), kind = $('#fiKind'), title = $('#fiTitle'), desc = $('#fiDesc'), year = $('#fiYear'), tags = $('#fiTags'), link = $('#fiLink');
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

// ---------- 3D: 원통 위의 휘어진 화면들 ----------
let pos = 0, target = 0;
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const ring = new THREE.Group();
  scene.add(ring);

  // 평평한 판을 원통 곡면으로 휘기 (가장자리가 화면 쪽으로 다가오는 오목한 모양)
  const W = ARC * R, H = W * 0.625;
  const geo = new THREE.PlaneGeometry(W, H, 64, 1);
  const p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) {
    const a = p.getX(k) / R;
    p.setX(k, R * Math.sin(a));
    p.setZ(k, -R * Math.cos(a));
  }
  geo.computeVertexNormals();

  // 모서리를 둥글게 깎은 이미지 텍스처
  const loader = new THREE.ImageLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const meshes = SLIDES.map((s, i) => {
    const cv = document.createElement('canvas');
    cv.width = 1600; cv.height = 1000;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, color: 0x111417 });
    loader.load(s.img, (img) => {
      const g = cv.getContext('2d');
      g.clearRect(0, 0, 1600, 1000);
      g.save();
      g.beginPath();
      g.roundRect(4, 4, 1592, 992, 46);
      g.clip();
      g.drawImage(img, 0, 0, 1600, 1000);
      g.restore();
      g.lineWidth = 3;
      g.strokeStyle = 'rgba(255,255,255,.18)';
      g.beginPath(); g.roundRect(5.5, 5.5, 1589, 989, 45); g.stroke();
      tex.needsUpdate = true;
      mat.userData.ready = true;
    });
    const m = new THREE.Mesh(geo, mat);
    const pivot = new THREE.Group();
    pivot.rotation.y = -i * STEP; // 다음 작업은 오른쪽에서 기다립니다
    pivot.add(m);
    ring.add(pivot);
    return m;
  });

  // 화면 크기에 맞춰 판이 위쪽 60% 안에 들어오도록 카메라 거리를 계산합니다
  let intro = reduced ? 1 : 0;
  function resize() {
    const w = section.clientWidth, h = section.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const hf = w < 760 ? 0.36 : 0.56; // 판 높이가 화면 높이에서 차지하는 비율
    let d = H / 2 / (t * hf);
    const halfW = R * Math.sin(ARC / 2), sag = R * (1 - Math.cos(ARC / 2));
    const maxWf = w < 760 ? 0.9 : 0.66;
    const wf = halfW / ((d - sag) * t * camera.aspect);
    if (wf > maxWf) d = halfW / (maxWf * t * camera.aspect) + sag;
    camera.position.set(0, 0, d - R);
    camera.lookAt(0, 0, -R);
    // 판 중심을 화면 위쪽(40%)으로 올립니다
    ring.position.y = (w < 760 ? 0.36 : 0.16) * t * d;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0 });
  let visible = true;
  io.observe(section);
  const start = performance.now();
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible) return;
    if (!reduced) intro = Math.min(1, (performance.now() - start) / 1400);
    pos += (target - pos) * (reduced ? 1 : 0.075);
    if (Math.abs(target - pos) < 1e-4) pos = target;
    const e = 1 - Math.pow(1 - intro, 3);
    ring.rotation.y = pos * STEP - (1 - e) * 0.5;
    ring.scale.setScalar(0.9 + 0.1 * e);
    meshes.forEach((m, i) => {
      const off = Math.abs(i - pos);
      // 앞 화면만 밝고, 옆으로 돌아가는 화면은 어두워집니다
      const b = m.material.userData.ready ? Math.max(0.18, 1 - off * 0.85) * e : 0.07;
      m.material.color.setScalar(b);
      m.visible = off < 1.6;
    });
    renderer.render(scene, camera);
  };
  tick();

  // 앞 화면을 누르면 사이트 열기
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  canvas.addEventListener('click', (ev) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const i = Math.round(pos);
    if (ray.intersectObject(meshes[i]).length && SLIDES[i].link) window.open(SLIDES[i].link, '_blank', 'noopener');
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
      if (Math.abs(target - i) > 0.01) window.lenis.scrollTo(st.start + (i / (N - 1)) * (st.end - st.start), { duration: 1, easing: (x) => 1 - Math.pow(1 - x, 3) });
    }, 180);
  });
  dots.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const y = st.start + (+b.dataset.i / (N - 1)) * (st.end - st.start);
    window.lenis ? window.lenis.scrollTo(y, { duration: 1.2 }) : scrollTo(0, y);
  });
  // 확인용: ?flip=2.5 → 그 위치로
  const q = new URLSearchParams(location.search).get('flip');
  if (q !== null) setTimeout(() => window.lenis?.scrollTo(st.start + (+q / (N - 1)) * (st.end - st.start), { immediate: true, force: true }), 300);
}
setupScroll();
