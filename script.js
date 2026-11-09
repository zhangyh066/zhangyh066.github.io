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
const speeds = [0.1, -0.075, 0.075, -0.055, 0.085, -0.06];
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
let scrollFrame = 0;

function updateScrollEffects() {
  scrollFrame = 0;
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  header.classList.toggle('is-scrolled', scrollY > 24);

  if (reducedMotion.matches) return;

  const nearProgress = clamp(scrollY / (viewportHeight * 2), 0, 1);
  const farProgress = clamp(scrollY / (viewportHeight * 4), 0, 1);
  const heroProgress = clamp(scrollY / (viewportHeight * 0.72), 0, 1);
  const mobileScale = viewportWidth <= 760 ? 0.32 : 1;

  heroArt.style.setProperty('--scene-scale', (1 + nearProgress * 0.65 + farProgress * 0.15).toFixed(3));
  heroArt.style.setProperty('--scene-x', `${(-nearProgress * viewportWidth * 0.18 * mobileScale).toFixed(1)}px`);
  heroArt.style.setProperty('--scene-y', `${(-farProgress * viewportHeight * 0.24 * mobileScale).toFixed(1)}px`);
  heroArt.style.setProperty('--scene-rotate', `${(-nearProgress * 2 * mobileScale).toFixed(2)}deg`);
  heroArt.style.setProperty('--grid-y', `${(-scrollY * 0.12).toFixed(1)}px`);
  hero.style.setProperty('--hero-opacity', (1 - heroProgress).toFixed(3));
  hero.style.setProperty('--hero-y', `${(-heroProgress * 70 * mobileScale).toFixed(1)}px`);
  hero.style.setProperty('--hero-ui-opacity', (1 - clamp(scrollY / (viewportHeight * 0.4), 0, 1)).toFixed(3));

  parallaxWindows.forEach((element, index) => {
    const previousOffset = Number(element.dataset.parallaxOffset || 0);
    const rect = element.getBoundingClientRect();
    const centerOffset = rect.top - previousOffset + rect.height / 2 - viewportHeight / 2;
    const speed = speeds[index] * (viewportWidth <= 760 ? 0.3 : 1);
    const limit = viewportWidth <= 760 ? 24 : 90;
    const offset = clamp(-centerOffset * speed, -limit, limit);
    element.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
    element.dataset.parallaxOffset = offset;
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
