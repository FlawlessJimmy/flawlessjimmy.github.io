// 랜딩: 휘어진 화면 한 장씩. 스크롤하면 책을 넘기듯 오른쪽 반장이 가운데 접는 선을 축으로 들려 왼쪽으로 넘어갑니다 (최근 작업 → EarthMera)
import * as THREE from 'three';

const SLIDES = [
  { img: 'shots/cover-off8.jpg', year: '2026.11', kind: '개인 프로젝트 · SaaS 제품 사이트', title: 'OFF8 업무 자동화 대시보드', desc: '직접 운영한 유료 PoC 3건을 바탕으로, 흩어진 엑셀이 대시보드가 되는 과정과 AI 상담을 제품 사이트로 보여 줍니다.', tags: ['사업 기획', '브랜딩', '구현'], more: '', link: 'https://flawlessjimmy.github.io/off8/' },
  { img: 'shots/cover-tessera.jpg', year: '2026.11', kind: '개인 프로젝트 · 자재 플랫폼', title: 'Tessera 인테리어 자재 플랫폼', desc: '34종 자재의 질감과 디테일을 가까이서 보고, 가격을 비교해 평수별 견적까지 한 번에 내는 인테리어 자재 플랫폼입니다.', tags: ['자재 디테일', '가격 · 견적', 'Three.js'], more: '', link: 'https://flawlessjimmy.github.io/tessera/' },
  { img: 'shots/cover-maoxga.jpg', year: '2026', kind: '클라이언트 · 카페24 자사몰', title: '묘향가 자사몰 리뉴얼', desc: '카페24 자사몰 전 페이지를 모바일 우선으로 다시 설계하고 구현했습니다. 회원·장바구니·네이버페이·실시간 상담까지 연결합니다.', tags: ['Cafe24', 'UX 설계', '구현'], more: '', link: 'https://www.maoxga.com/' },
  { img: 'shots/cover-kanto.jpg', year: '2026', kind: '클라이언트 · 업무 시스템', title: 'KANTO 발주 자동화', desc: '엑셀 수작업 대조를 웹 흐름으로 바꿨습니다. 자동 매칭률 98%, 월간 리포트 생성 시간은 85초에서 4초로 줄었습니다.', tags: ['Web App', '엑셀 변환', 'Cloudflare'], more: '', link: 'https://kanto-order-server.pages.dev' },
  { img: 'shots/cover-h2b.jpg', year: '2026', kind: '클라이언트 · 경영 대시보드', title: 'H2B 운영 대시보드', desc: '월 8천만 원대 매출을 다루는 대시보드를 설계부터 운영까지 맡았습니다. AS 칸반, AI 상담 큐, 매출·순이익 계산을 한곳에 모았습니다.', tags: ['FastAPI', 'PostgreSQL', '운영'], more: '#case-h2b', link: 'https://h2b-3cr.pages.dev' },
  { img: 'shots/cover-earthmera.jpg', year: '2024 — 2025', kind: 'EarthMera · Founding Product Designer', title: 'EarthMera, 세 개의 프로덕트', desc: '뉴욕 친환경 스타트업의 파운딩 디자이너로 탄소 기록 앱, 이벤트 플랫폼, 링크인바이오 ZIGU를 기획부터 핸드오프까지 맡았습니다.', tags: ['신규 가입 +1,000', '미션 완료 90%', '구독 +100'], more: '#case-earthmera', link: 'https://www.earthmera.com/ko/' },
];

// 영어일 때는 글을 미리 바꿔 둡니다 (아래 글 칸 높이를 영어 글로 재도록)
const T = window.i18n ? window.i18n.t : (s) => s;
SLIDES.forEach((s) => { s.kind = T(s.kind); s.title = T(s.title); s.desc = T(s.desc); s.tags = s.tags.map(T); });

// 영어일 때는 표지 안 글자도 영어로 만든 표지(cover-*-en.jpg)를 씁니다
if (window.i18n?.isEn) {
  SLIDES.forEach((s) => { s.img = s.img.replace(/\.jpg$/, '-en.jpg?v=2'); });
  document.querySelectorAll('img[src^="shots/cover-"]').forEach((im) => { if (!/-en\.jpg/.test(im.getAttribute('src'))) im.setAttribute('src', im.getAttribute('src').replace(/\.jpg$/, '-en.jpg?v=2')); });
}

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
  // 사이트 안에 자세한 설명(케이스)이 있는 작업만 '자세히 보기', 나머지는 '사이트'만
  more.hidden = !s.more;
  if (s.more) more.setAttribute('href', s.more);
  link.classList.toggle('is-primary', !s.more);
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
  const small = Math.min(innerWidth, innerHeight) < 760;
  const CW = small ? 1200 : 1600, CH = CW * 0.625, CS = CW / 1600;
  const tex = SLIDES.map((s) => {
    const cv = document.createElement('canvas');
    cv.width = CW; cv.height = CH;
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    t.userData.ready = false;
    loader.load(s.img, (img) => {
      if (t.userData.live) return; // 움직이는 표지가 먼저 준비됐으면 그대로 둡니다
      const g = cv.getContext('2d');
      g.setTransform(CS, 0, 0, CS, 0, 0);
      g.save(); g.beginPath(); g.roundRect(4, 4, 1592, 992, 40); g.clip();
      g.drawImage(img, 0, 0, 1600, 1000); g.restore();
      g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.16)';
      g.beginPath(); g.roundRect(5.5, 5.5, 1589, 989, 39); g.stroke();
      t.needsUpdate = true; t.userData.ready = true;
    });
    return t;
  });

  // ---------- 움직이는 표지: A 늘 살아 있는 표지 + C 판이 내려앉을 때 반동 ----------
  // 표지를 배경 + 조각(글자·창·휴대폰·칩·견본·엑셀)으로 나눠 두고, 조각마다 성격에 맞는 작은 움직임을 계속 줍니다.
  //  창: 천천히 떠 있고 가끔 유리 반사가 스침 · 휴대폰: 옆 폰은 살랑, 긴 화면은 안쪽이 스크롤
  //  방 사진: 천천히 줌 · 자재 견본: 한 장씩 들렸다 내려앉음 · 엑셀: 화면 쪽으로 빨려 들어감 · 숫자 칩: 내려앉으면 카운트업
  // 장이 넘어와 내려앉는 순간에는 위에 놓인 조각들이 쟁반 위 물건처럼 살짝 들썩였다 멈춥니다(가벼운 칩일수록 크게).
  const DEPTH = { type: 0.8, win: 1, room: 1, phone: 1.15, swatch: 1.3, xls: 1.45, chip: 1.7 };
  const live = SLIDES.map(() => null);
  const landAt = SLIDES.map(() => -1);
  const imgP = (src) => new Promise((ok, no) => { const im = new Image(); im.decoding = 'async'; im.onload = () => ok(im); im.onerror = no; im.src = src; });
  const screenSrc = (p) => (p.startsWith('../') ? p.slice(3) : 'shots/live/src/' + p.split('/').pop());
  function chipCount(b) {
    const nums = [...b.matchAll(/\d+/g)];
    if (!nums.length) return null;
    const last = nums[nums.length - 1];
    return { pre: b.slice(0, last.index), post: b.slice(last.index + last[0].length), to: +last[0], from: b.includes('→') && nums.length > 1 ? +nums[0][0] : 0 };
  }
  if (!reduced) fetch('shots/live/manifest.json').then((r) => r.json()).then((man) => {
    SLIDES.forEach((s, i) => {
      const m = s.img.match(/cover-(\w+?)(-en)?\.jpg/);
      const e = m && man[m[1] + (m[2] || '')];
      if (!e) return;
      const layers = e.layers.map((l, k) => ({ ...l, d: DEPTH[l.kind] || 1, ph: (i * 1.9 + k * 2.4) % 6.28 })).sort((p, q) => p.z - q.z);
      const kinds = {};
      layers.forEach((l) => { l.ki = kinds[l.kind] = (kinds[l.kind] ?? -1) + 1; });
      layers.forEach((l) => {
        const sc = l.screen;
        if (sc && l.kind === 'phone' && (sc.w * sc.nh) / sc.nw - sc.h > 60) l.scroll = (sc.w * sc.nh) / sc.nw - sc.h;
        if (sc && l.kind === 'room') l.zoom = true;
        if (l.chip) l.count = chipCount(l.chip.b);
        l.bd = l.kind === 'chip' ? 0.06 : l.kind === 'type' ? 0 : 0.03;
      });
      const extra = layers.filter((l) => l.scroll || l.zoom);
      Promise.all([imgP(e.bg), ...layers.map((l) => imgP(l.src)), ...extra.map((l) => imgP(screenSrc(l.screen.src)))]).then(([bg, ...ims]) => {
        layers.forEach((l, k) => (l.img = ims[k]));
        extra.forEach((l, k) => (l.scrImg = ims[layers.length + k]));
        layers.filter((l) => l.kind === 'win').forEach((l) => { l.oc = document.createElement('canvas'); l.oc.width = l.w; l.oc.height = l.h; });
        live[i] = { bg, layers, ctx: tex[i].image.getContext('2d') };
        tex[i].userData.live = true; tex[i].userData.ready = true;
      }).catch(() => {});
    });
  }).catch(() => {});

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const outCubic = (v) => 1 - Math.pow(1 - v, 3);
  // 창 위로 스치는 유리 반사 (조각 모양 안에서만)
  function sheen(g, l, t) {
    const per = 7, q = ((t + l.ph * 1.3) % per) / 1.3; // 7초마다 1.3초 동안
    if (q >= 1) { g.drawImage(l.img, l.x, l.y, l.w, l.h); return; }
    const o = l.oc.getContext('2d');
    o.globalCompositeOperation = 'source-over';
    o.clearRect(0, 0, l.w, l.h);
    o.drawImage(l.img, 0, 0);
    o.globalCompositeOperation = 'source-atop';
    const bx = -l.w * 0.5 + q * l.w * 2;
    const gr = o.createLinearGradient(bx - 160, 0, bx + 160, l.h * 0.35);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.2)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    o.fillStyle = gr; o.fillRect(0, 0, l.w, l.h);
    g.drawImage(l.oc, l.x, l.y, l.w, l.h);
  }
  function drawLive(i, t, px, py) {
    const L = live[i], g = L.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, CW, CH);
    g.setTransform(CS, 0, 0, CS, 0, 0);
    g.save();
    g.beginPath(); g.roundRect(4, 4, 1592, 992, 40); g.clip();
    g.translate(800 - px * 8, 500 - py * 5); g.scale(1.03, 1.03); g.translate(-800, -500);
    g.drawImage(L.bg, 0, 0, 1600, 1000);
    g.setTransform(CS, 0, 0, CS, 0, 0);
    const landed = landAt[i] >= 0, sinceLand = landed ? t - landAt[i] : -1;
    for (const l of L.layers) {
      const d = l.d;
      let x = px * 14 * d, y = py * 9 * d, rot = 0, sc = 1, alpha = 1;
      // C: 내려앉을 때 반동 (먼저 아래로 눌렸다 튀어 오르며 잦아듦)
      const dt = sinceLand - l.bd;
      if (landed && dt > 0 && dt < 1.6) {
        const k = Math.exp(-dt * 5.2);
        y += 13 * d * k * Math.sin(dt * 15);
        rot += 0.012 * d * k * Math.sin(dt * 15 + 0.8) * (l.cx < 800 ? -1 : 1);
      }
      // A: 조각마다 늘 하는 작은 움직임
      if (l.kind === 'win') { y += Math.sin(t * 0.6 + l.ph) * 3; rot += Math.sin(t * 0.45 + l.ph) * 0.004; }
      else if (l.kind === 'phone' && Math.abs(l.screen?.rot || 0) > 0.05) rot += Math.sin(t * 0.7 + l.ph) * 0.014;
      else if (l.kind === 'chip') y += Math.sin(t * 0.9 + l.ph) * 2.5;
      else if (l.kind === 'swatch') {
        const n = 4, q = ((t / 1.5 - l.ki) % n + n) % n;
        if (q < 1) { const lift = Math.sin(q * Math.PI); y -= 30 * lift; rot += 0.06 * lift * (l.cx < 520 ? 1 : -1); sc += 0.05 * lift; }
      } else if (l.kind === 'xls') {
        const q = ((t + l.ki * 1.5) / 4.5) % 1, e = q * q;
        x += (980 - l.cx) * e; y += (600 - l.cy) * e * 0.55; rot += e * 0.5; sc *= 1 - 0.5 * e;
        alpha = Math.min(clamp01(q / 0.12), 1 - clamp01((q - 0.7) / 0.3));
      }
      g.globalAlpha = alpha;
      g.translate(l.cx + x, l.cy + y); g.rotate(rot); g.scale(sc, sc); g.translate(-l.cx, -l.cy);
      if (l.oc) sheen(g, l, t); else g.drawImage(l.img, l.x, l.y, l.w, l.h);
      // 휴대폰 긴 화면은 안쪽이 천천히 스크롤, 방 사진은 천천히 줌
      if (l.scrImg) {
        const s = l.screen;
        g.save();
        g.translate(s.ox, s.oy); g.rotate(s.rot); g.translate(-s.ox, -s.oy);
        g.beginPath(); g.roundRect(s.x, s.y, s.w, s.h, s.radius); g.clip();
        if (l.scroll) {
          const hh = (s.w * s.nh) / s.nw, cyc = (t + l.ph) / 30;
          const yy = l.scroll * (0.5 - 0.5 * Math.cos(cyc * Math.PI * 2));
          g.drawImage(l.scrImg, s.x, s.y - yy, s.w, hh);
        } else {
          const z = 1.05 + 0.05 * Math.sin(t * 0.22 + l.ph), r = Math.max(s.w / s.nw, s.h / s.nh) * z;
          const w = s.nw * r, h = s.nh * r;
          g.drawImage(l.scrImg, s.x + (s.w - w) / 2, s.y + (s.h - h) / 2, w, h);
        }
        g.restore();
      }
      // 숫자 칩: 내려앉으면 처음 값에서 끝 값까지 올라가거나(98%) 줄어듦(85초 → 4초)
      if (l.count) {
        const p = landed ? outCubic(clamp01((sinceLand - 0.3) / 1.2)) : 0;
        if (p < 1) {
          const c = l.chip, n = l.count;
          g.fillStyle = c.bg;
          g.fillRect(c.left + c.padL - 3, c.top + 6, c.bW + 6, c.h - 12);
          g.fillStyle = c.color; g.textBaseline = 'middle';
          g.font = `${c.bWeight} ${c.bSize}px ${c.bFam}`;
          if ('letterSpacing' in g) g.letterSpacing = c.bLS;
          g.fillText(n.pre + Math.round(n.from + (n.to - n.from) * p) + n.post, c.left + c.padL, c.top + c.h / 2 + 1);
          if ('letterSpacing' in g) g.letterSpacing = '0px';
        }
      }
      g.setTransform(CS, 0, 0, CS, 0, 0);
      g.globalAlpha = 1;
    }
    g.restore();
    g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.16)';
    g.beginPath(); g.roundRect(5.5, 5.5, 1589, 989, 39); g.stroke();
    tex[i].needsUpdate = true;
  }

  // 넘기는 장의 모양: 접는 선에서 바깥 가장자리까지 조금씩 방향을 바꾸며 이어 붙입니다.
  // 딱딱한 판처럼 가장자리까지 한 번에 돌고, 똑바로 설 때 곡면이 펴졌다가 반대쪽 곡면으로 내려앉습니다.
  const DS = (R * HALF) / SEG, CURL = 0; // 0 = 종이처럼 말리지 않고 딱딱한 판처럼 통째로 넘어갑니다
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

  // 위 글과 아래 글 사이 빈 칸에 판과 점이 들어가도록 카메라 거리 · 높이를 계산합니다.
  // 크기는 고정된 화면 칸(.flip-pin)으로 잽니다. (섹션 전체 높이로 재면 휴대폰에서 판이 납작해집니다)
  const camTarget = new THREE.Vector3();
  const headEl = section.querySelector('.flip-head'), infoEl = section.querySelector('.flip-info');
  function resize() {
    const w = pin.clientWidth, h = pin.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const mob = w < 760;
    // 아래 글은 작업마다 길이가 달라서 가장 높이 올라오는 경우로 맞춥니다
    let infoTop = Infinity;
    for (let k = 0; k < N; k++) { fill(k); infoTop = Math.min(infoTop, infoEl.offsetTop); }
    fill(shown);
    const dotGap = mob ? 16 : 20, dotH = 7;
    const top = headEl.offsetTop + headEl.offsetHeight + (mob ? 22 : 26);
    const bottom = infoTop - (mob ? 20 : 26) - dotH - dotGap;
    const gapH = Math.max(90, bottom - top);
    const halfW = R * Math.sin(HALF), sag = R * (1 - Math.cos(HALF));
    const maxWf = mob ? 0.92 : 0.66;
    const d = Math.max(
      (H * h) / (2 * t * gapH) + sag,        // 빈 칸 높이 안에
      halfW / (maxWf * t * camera.aspect) + sag, // 화면 너비 안에
      H / 2 / (t * 0.5),                       // 큰 화면에서 너무 커지지 않게
    );
    camera.position.set(0, 0, d);
    camTarget.set(0, 0, 0);
    camera.lookAt(camTarget);
    const halfPx = (H * h) / (4 * t * (d - sag));
    const cy = Math.min((top + bottom) / 2, bottom - halfPx);
    book.position.y = (1 - (2 * cy) / h) * t * d;
    camera.updateProjectionMatrix();
    dots.style.top = Math.round(cy + halfPx + dotGap) + 'px';
    dots.style.bottom = 'auto';
  }
  resize();
  addEventListener('resize', resize);
  document.fonts?.ready.then(resize);

  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(section);
  const start = performance.now();
  let mx = 0, my = 0, smx = 0, smy = 0, frameN = 0;
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
    // 보이는 장의 표지만 매 프레임 다시 그립니다 (휴대폰은 한 프레임 건너)
    // 장이 완전히 자리 잡은 순간을 기록하고(반동 · 카운트업 시작), 화면에서 벗어난 장은 다시 처음 상태로
    {
      const tn = performance.now() / 1000;
      for (let k = 0; k < N; k++) if (Math.abs(pos - k) >= 0.999) landAt[k] = -1;
      if (f === 0 && e > 0.85 && landAt[i] < 0 && live[i]) landAt[i] = tn;
    }
    frameN++;
    if (!small || frameN % 2 === 0) {
      const tl = performance.now() / 1000;
      for (const k of f > 0 ? [i, Math.min(N - 1, i + 1)] : [i]) if (live[k]) drawLive(k, tl, smx, smy);
    }
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
