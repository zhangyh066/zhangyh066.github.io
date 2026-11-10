const root = document.documentElement;
const header = document.getElementById('site-header');
const languageToggle = document.getElementById('language-toggle');
const languageLabel = document.getElementById('language-label');
const themeToggle = document.getElementById('theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let language = 'zh';
try {
  language = localStorage.getItem('yuhui-language') || 'zh';
} catch (_) {}

function updateThemeControl() {
  const dark = root.dataset.theme === 'dark';
  themeToggle.setAttribute('aria-label', language === 'zh'
    ? (dark ? '切换浅色模式' : '切换深色模式')
    : (dark ? 'Switch to light mode' : 'Switch to dark mode'));
  themeMeta.setAttribute('content', dark ? '#192126' : '#f3f0e9');
}

function setLanguage(nextLanguage) {
  language = nextLanguage;
  root.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-zh][data-en]').forEach((element) => {
    element.textContent = element.dataset[language];
  });
  languageLabel.textContent = language === 'zh' ? 'EN' : '中';
  languageToggle.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
  document.title = language === 'zh' ? 'Yuhui — 数据与 AI' : 'Yuhui — Data & AI';
  const description = document.querySelector('meta[name="description"]');
  description.setAttribute('content', language === 'zh'
    ? 'Yuhui 的个人主页：金融数据、AI 与产业链可视化。'
    : 'Yuhui’s personal homepage: financial data, AI and supply-chain visualization.');
  try { localStorage.setItem('yuhui-language', language); } catch (_) {}
  updateThemeControl();
}

languageToggle.addEventListener('click', () => {
  setLanguage(language === 'zh' ? 'en' : 'zh');
});

themeToggle.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  try { localStorage.setItem('yuhui-theme', nextTheme); } catch (_) {}
  updateThemeControl();
});

setLanguage(language);
document.getElementById('year').textContent = new Date().getFullYear();

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const hero = document.querySelector('.hero');
const heroArt = document.getElementById('hero-art');
const parallaxWindows = [...document.querySelectorAll('.window')];
const readingCard = document.querySelector('.reading-card');
const readingItems = [...document.querySelectorAll('.reading-item')];
const speeds = [0.1, -0.075, 0.065, -0.065, 0.075, -0.055, 0.085, -0.06, 0.065, -0.06, 0.05];
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const sceneLayers = [...document.querySelectorAll('.scene-layer')];
const sceneAnchors = [
  { name: 'observatory', element: hero },
  { name: 'policy', element: document.getElementById('experience') },
  { name: 'workshop', element: document.getElementById('projects') },
  { name: 'studio', element: document.getElementById('education') },
  { name: 'library', element: document.getElementById('reading') },
];
const sceneMotion = {
  observatory: { from: [1, 0, 0, 0], to: [1.32, -0.12, -0.08, -1] },
  policy: { from: [1.05, 0.07, 0.02, 1], to: [1.2, -0.06, -0.08, -0.6] },
  workshop: { from: [1.02, -0.04, -0.03, -1], to: [1.2, 0.07, 0.03, 1.2] },
  studio: { from: [1.04, 0.06, 0.02, 0.6], to: [1.18, -0.05, -0.06, -0.8] },
  library: { from: [1.02, -0.03, 0.01, -0.6], to: [1.16, 0.04, -0.06, 0.8] },
};
let scrollFrame = 0;
let sceneFrame = 0;
let targetScrollY = 0;
let currentScrollY = -1;
let lastSceneTime = 0;

function renderLayer(layer, progress, opacity, transitionY) {
  const motion = sceneMotion[layer.dataset.scene];
  const mobile = window.innerWidth <= 760;
  const movement = mobile ? 0.32 : 1;
  const eased = progress * progress * (3 - 2 * progress);
  const values = motion.from.map((value, index) => value + (motion.to[index] - value) * eased);
  const scale = mobile ? 1 + (values[0] - 1) * 0.68 : values[0];
  const x = values[1] * window.innerWidth * movement;
  const y = values[2] * window.innerHeight * movement + transitionY * movement;
  layer.style.opacity = opacity.toFixed(3);
  layer.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
  layer.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${values[3].toFixed(2)}deg)`;
}

function renderScenes(scrollY, staticOnly = false) {
  const viewportHeight = window.innerHeight;
  const position = scrollY + viewportHeight * 0.62;
  let activeIndex = 0;
  sceneAnchors.forEach((anchor, index) => {
    if (position >= anchor.element.offsetTop) activeIndex = index;
  });
  const active = sceneAnchors[activeIndex];
  const next = sceneAnchors[activeIndex + 1];
  const start = active.element === hero ? 0 : active.element.offsetTop - viewportHeight * 0.62;
  const end = next ? next.element.offsetTop - viewportHeight * 0.62 : document.documentElement.scrollHeight;
  const localProgress = clamp((position - start) / Math.max(1, end - start), 0, 1);
  const mix = next && !staticOnly
    ? clamp((position - (next.element.offsetTop - viewportHeight * 0.42)) / (viewportHeight * 0.42), 0, 1)
    : 0;

  sceneLayers.forEach((layer, index) => {
    if (index === activeIndex) {
      renderLayer(layer, localProgress, 1 - mix, -mix * 40);
    } else if (index === activeIndex + 1) {
      renderLayer(layer, 0, mix, (1 - mix) * 50);
    } else {
      layer.style.opacity = '0';
      layer.style.visibility = 'hidden';
    }
  });
}

function animateScene(time) {
  if (currentScrollY < 0) currentScrollY = targetScrollY;
  const deltaTime = lastSceneTime ? Math.min((time - lastSceneTime) / 1000, 0.05) : 1 / 60;
  lastSceneTime = time;
  const difference = targetScrollY - currentScrollY;
  currentScrollY += difference * (1 - Math.exp(-deltaTime * 12));
  renderScenes(currentScrollY);
  if (Math.abs(difference) > 0.5) {
    sceneFrame = requestAnimationFrame(animateScene);
  } else {
    currentScrollY = targetScrollY;
    renderScenes(currentScrollY);
    sceneFrame = 0;
    lastSceneTime = 0;
  }
}

function updateScrollEffects() {
  scrollFrame = 0;
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  header.classList.toggle('is-scrolled', scrollY > 24);
  targetScrollY = scrollY;

  if (reducedMotion.matches) {
    renderScenes(targetScrollY, true);
    return;
  }

  if (!sceneFrame) sceneFrame = requestAnimationFrame(animateScene);
  const heroProgress = clamp(scrollY / (viewportHeight * 0.72), 0, 1);
  const mobileScale = viewportWidth <= 760 ? 0.32 : 1;
  heroArt.style.setProperty('--grid-y', `${(-scrollY * 0.12).toFixed(1)}px`);
  hero.style.setProperty('--hero-opacity', (1 - heroProgress).toFixed(3));
  hero.style.setProperty('--hero-y', `${(-heroProgress * 70 * mobileScale).toFixed(1)}px`);
  hero.style.setProperty('--hero-ui-opacity', (1 - clamp(scrollY / (viewportHeight * 0.4), 0, 1)).toFixed(3));

  parallaxWindows.forEach((element, index) => {
    const previousOffset = Number(element.dataset.parallaxOffset || 0);
    const rect = element.getBoundingClientRect();
    const baseTop = rect.top - previousOffset;
    const centerOffset = baseTop + rect.height / 2 - viewportHeight / 2;
    const speed = (speeds[index] ?? 0.05) * (viewportWidth <= 760 ? 0.3 : 1);
    const limit = viewportWidth <= 760 ? 24 : 90;
    const offset = clamp(-centerOffset * speed, -limit, limit);
    const entry = clamp((viewportHeight - baseTop) / (viewportHeight * 0.85), 0, 1);
    const easedEntry = 1 - Math.pow(1 - entry, 3);
    const direction = index % 2 === 0 ? -1 : 1;
    const entryX = (1 - easedEntry) * direction * (viewportWidth <= 760 ? 36 : 160);
    const entryRotation = (1 - easedEntry) * direction * (viewportWidth <= 760 ? 0.7 : 2.8);
    element.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
    element.style.setProperty('--enter-x', `${entryX.toFixed(1)}px`);
    element.style.setProperty('--enter-scale', (0.9 + easedEntry * 0.1).toFixed(3));
    element.style.setProperty('--enter-rotate', `${entryRotation.toFixed(2)}deg`);
    element.dataset.parallaxOffset = offset;
    element.dataset.entryProgress = entry;
  });

  const readingEntry = Number(readingCard.dataset.entryProgress || 0);
  readingItems.forEach((item, index) => {
    const progress = clamp((readingEntry * 1.6 - index * 0.14) / 0.75, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    item.style.opacity = progress.toFixed(3);
    item.style.transform = `translateX(${((1 - eased) * 36).toFixed(1)}px)`;
  });
}

function requestScrollUpdate() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(updateScrollEffects);
}

updateScrollEffects();
window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);

if (!reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    heroArt.style.setProperty('--px', `${x}px`);
    heroArt.style.setProperty('--py', `${y}px`);
  });
  hero.addEventListener('pointerleave', () => {
    heroArt.style.setProperty('--px', '0px');
    heroArt.style.setProperty('--py', '0px');
  });
}
