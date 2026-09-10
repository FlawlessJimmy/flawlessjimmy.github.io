// ─────────────────────────────────────────────
// 1. Lenis (부드러운 스크롤) 초기화
// ─────────────────────────────────────────────
const lenis = new Lenis({
  lerp: 0.1,        // 0~1, 낮을수록 더 미끄러짐 (0.08~0.12 권장)
  wheelMultiplier: 1,
  smoothWheel: true,
});

// ─────────────────────────────────────────────
// 2. GSAP ScrollTrigger 와 Lenis 연결 (핵심)
//    - Lenis가 스크롤할 때마다 ScrollTrigger에 위치 갱신 알림
//    - GSAP의 ticker 하나로 Lenis의 프레임을 돌려 두 시계가 동기화
// ─────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // gsap은 초 단위, lenis는 ms 단위
});
gsap.ticker.lagSmoothing(0); // 탭 전환 후 복귀 시 튀는 현상 방지

// ─────────────────────────────────────────────
// 3. 애니메이션
// ─────────────────────────────────────────────

// 스크롤 진행도 바
gsap.to('.progress', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
});

// 히어로: 로드 시 한 줄씩 올라오며 등장
gsap.timeline({ defaults: { ease: 'power4.out' } })
  .to('.hero-title .line > span', { y: 0, duration: 1.2, stagger: 0.12 }, 0.2)
  .to('.hero-sub', { opacity: 1, duration: 0.8 }, '-=0.6');

// 히어로: 스크롤하면 위로 밀리며 페이드아웃
gsap.to('.hero-title, .hero-sub', {
  y: -120,
  opacity: 0,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
});

// 패럴랙스: data-speed 값에 따라 다른 속도로 이동
gsap.utils.toArray('.parallax-layer').forEach((layer) => {
  const speed = parseFloat(layer.dataset.speed);
  gsap.fromTo(layer,
    { yPercent: -30 * speed },
    {
      yPercent: 30 * speed,
      ease: 'none',
      scrollTrigger: { trigger: '.parallax', start: 'top bottom', end: 'bottom top', scrub: true },
    });
});

// 가로 스크롤: 섹션을 핀 고정하고 track 을 왼쪽으로 이동
const track = document.querySelector('.track');
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.horizontal',
    start: 'top top',
    end: () => '+=' + (track.scrollWidth - window.innerWidth),
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true, // 리사이즈 시 거리 재계산
  },
});

// 스태거 카드: 뷰포트에 들어오면 순차 등장 (한 번만)
gsap.to('.card', {
  opacity: 1,
  y: 0,
  duration: 0.8,
  ease: 'power3.out',
  stagger: 0.12,
  scrollTrigger: { trigger: '.grid', start: 'top 80%', once: true },
});

// 공용 reveal 클래스
gsap.utils.toArray('.reveal').forEach((el) => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  });
});

// 스케일 박스: 섹션을 지나는 동안 커졌다가 원래 크기로
gsap.fromTo('.scale-box',
  { scale: 0.6, borderRadius: '50%' },
  {
    scale: 1.6,
    borderRadius: '24px',
    ease: 'none',
    scrollTrigger: { trigger: '.scale', start: 'top bottom', end: 'center center', scrub: true },
  });
