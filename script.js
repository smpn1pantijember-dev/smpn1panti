
const splashScreen = document.getElementById('splashScreen');
const splashEnter = document.getElementById('splashEnter');

const closeSplash = () => {
  if (!splashScreen || splashScreen.classList.contains('is-hidden')) return;
  splashScreen.classList.add('is-hidden');
  document.body.classList.remove('splash-active');
  window.setTimeout(() => splashScreen.remove(), 700);
};

if (splashScreen && splashEnter) {
  document.body.classList.add('splash-active');
  splashEnter.focus();

  splashEnter.addEventListener('click', closeSplash);

  splashScreen.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === 'Escape') closeSplash();
  });
}

const navToggle = document.getElementById('navtoggle');
const navLinks = document.getElementById('siteNav');
const toTopButton = document.getElementById('toTop');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.slider').forEach((slider) => {
  const track = slider.querySelector('.slider-track');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  if (!track || slides.length < 2) return;

  let activeIndex = 0;
  const useCounter = slider.dataset.indicator === 'counter';
  const dots = document.createElement('div');
  const counter = document.createElement('div');
  let dotButtons = [];

  if (useCounter) {
    counter.className = 'slider-counter';
    counter.setAttribute('aria-hidden', 'true');
  } else {
    dots.className = 'slider-dots';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', 'Pilih foto');

    dotButtons = slides.map((_, slideIndex) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Tampilkan foto ${slideIndex + 1}`);
      dot.addEventListener('click', () => updateSlider(slideIndex));
      dots.append(dot);
      return dot;
    });
  }

  const updateSlider = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.setAttribute('aria-hidden', String(!isActive));
      if (!useCounter) {
        dotButtons[slideIndex].classList.toggle('is-active', isActive);
        dotButtons[slideIndex].setAttribute('aria-current', String(isActive));
      }
    });
    if (useCounter) counter.textContent = `${activeIndex + 1} / ${slides.length}`;
  };

  const createArrow = (direction, label, symbol) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `slider-btn ${direction}`;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => {
      updateSlider(activeIndex + (direction === 'next' ? 1 : -1));
    });
    slider.append(button);
    button.textContent = symbol;
  };

  createArrow('prev', 'Foto sebelumnya', '‹');
  createArrow('next', 'Foto berikutnya', '›');
  slider.append(useCounter ? counter : dots);
  updateSlider(0);

  const autoplay = Number(slider.dataset.autoplay);
  if (prefersReducedMotion || !Number.isFinite(autoplay) || autoplay <= 0) return;

  window.setInterval(() => {
    if (!document.hidden && slider.getClientRects().length > 0 &&
        !slider.matches(':hover') && !slider.contains(document.activeElement)) {
      updateSlider(activeIndex + 1);
    }
  }, autoplay);
});

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('is-open'));
  });
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const counters = document.querySelectorAll('.stat-number');
const animateCounter = (element) => {
  const target = Number(element.dataset.target || 0);
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 40));

  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    element.textContent = current;
  }, 18);
};

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach((counter) => {
    counter.textContent = counter.dataset.target || '0';
  });
}

window.addEventListener('scroll', () => {
  if (window.scrollY > 360) {
    toTopButton?.classList.add('is-visible');
  } else {
    toTopButton?.classList.remove('is-visible');
  }
});

toTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- Halaman terpisah (Beranda, Profil, Potensi, Kontak) ---------- */
const PAGES = ['beranda', 'profil', 'potensi', 'kontak', 'guru-mapel'];
// Halaman yang menumpang pada menu halaman lain (menu tetap menyala di induknya)
const NAV_PARENT = { 'guru-mapel': 'profil' };
const kontakSection = document.getElementById('kontak');
let kontakTimeout = null;

const playKontakAnimation = () => {
  if (!kontakSection) return;
  kontakSection.classList.remove('kontak-active');
  void kontakSection.offsetWidth;
  kontakSection.classList.add('kontak-active');

  clearTimeout(kontakTimeout);
  kontakTimeout = setTimeout(() => {
    kontakSection.classList.remove('kontak-active');
  }, 2600);
};

const resolveRoute = (hash) => {
  if (!hash || hash === '#') return { page: 'beranda', target: null, isPageTop: true };

  const id = decodeURIComponent(hash.slice(1));
  const target = document.getElementById(id);
  const section = target ? target.closest('section[data-page]') : null;
  if (!section) return null;

  return { id, target, page: section.dataset.page, isPageTop: PAGES.includes(id) };
};

const syncNavActive = (page, id) => {
  const navPage = NAV_PARENT[page] || page;
  document.querySelectorAll('#siteNav a, .sidebar-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === `#${navPage}` || href === `#${id}`);
  });
};

const showPage = () => {
  const route = resolveRoute(location.hash);
  if (!route) return;

  const previous = document.body.dataset.page;
  document.body.dataset.page = route.page;
  syncNavActive(route.page, route.id);

  if (route.page === 'kontak' && previous !== 'kontak') playKontakAnimation();

  if (route.page === previous) return;

  if (route.target && !route.isPageTop) {
    route.target.scrollIntoView({ behavior: 'instant' });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
};

window.addEventListener('hashchange', showPage);
showPage();

/* ---------- Tautan WhatsApp ---------- */
const WA_NUMBER = '6285211339993'; 
const WA_MESSAGE = 'Halo SMPN 1 Panti, saya ingin bertanya mengenai sekolah.';

document.querySelectorAll('a[data-wa]').forEach((link) => {
  link.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;
});