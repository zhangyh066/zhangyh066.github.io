const root = document.documentElement;
const menuToggle = document.getElementById('menu-toggle');
const navigation = document.getElementById('main-nav');
const languageToggle = document.getElementById('language-toggle');
const languageLabel = document.getElementById('language-label');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let language = 'en';
try {
  const requested = new URLSearchParams(location.search).get('lang');
  const saved = localStorage.getItem('julian-journal-language');
  language = ['zh', 'en'].includes(requested) ? requested : (saved === 'zh' ? 'zh' : 'en');
} catch (_) {}

function closeMenu() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', language === 'zh' ? '打开导航' : 'Open navigation');
}

menuToggle.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  const label = open
    ? (language === 'zh' ? '关闭导航' : 'Close navigation')
    : (language === 'zh' ? '打开导航' : 'Open navigation');
  menuToggle.setAttribute('aria-label', label);
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});

function setLanguage(nextLanguage, updateUrl = false) {
  language = nextLanguage;
  root.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-zh][data-en]').forEach((element) => {
    element.textContent = element.dataset[language];
  });
  document.querySelectorAll('[data-label-zh][data-label-en]').forEach((element) => {
    element.setAttribute('aria-label', element.dataset[`label${language === 'zh' ? 'Zh' : 'En'}`]);
  });
  document.querySelectorAll('[data-alt-zh][data-alt-en]').forEach((element) => {
    element.setAttribute('alt', element.dataset[`alt${language === 'zh' ? 'Zh' : 'En'}`]);
  });
  languageLabel.textContent = language === 'zh' ? 'EN' : 'ZH';
  languageToggle.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : 'Switch to Chinese');
  document.title = language === 'zh' ? 'Julian Zhang · 个人主页' : 'Julian Zhang · Personal homepage';
  const description = document.querySelector('meta[name="description"]');
  description.setAttribute('content', language === 'zh'
    ? 'Julian Zhang 的个人主页。金融科技方向硕士，关注金融数据、轻量模型与产业链，记录研究、实践和阅读。'
    : 'Julian Zhang’s personal homepage. Financial Technology master’s student exploring financial data, small models and supply chains through research, projects and reading.');
  try { localStorage.setItem('julian-journal-language', language); } catch (_) {}
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(null, '', url);
  }
  closeMenu();
}

languageToggle.addEventListener('click', () => {
  setLanguage(language === 'zh' ? 'en' : 'zh', true);
});

const revealElements = document.querySelectorAll('.reveal, .art');
function revealAll() {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

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
  revealAll();
}
reducedMotion.addEventListener('change', (event) => {
  if (event.matches) revealAll();
});

const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const observedSections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const current = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-current', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -65%', threshold: 0 });
  observedSections.forEach((section) => sectionObserver.observe(section));
}

document.getElementById('year').textContent = new Date().getFullYear();
setLanguage(language);
