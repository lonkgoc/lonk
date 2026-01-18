// script.js - Shared UI Madness

let lastScrollY = window.scrollY;
let ticking = false;

// 1. Navbar Visibility (Hide on Scroll Down, Show on Scroll Up)
function updateHeaderVisibility() {
  const header = document.querySelector('.navbar');
  if (!header) return;

  const currentScrollY = window.scrollY;

  // Hide header when scrolling down (past 100px)
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    header.classList.add('hide');
  }
  // Show header when scrolling up OR at top
  else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
    header.classList.remove('hide');
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

// 2. Back to Top Button Logic
function handleBackToTop() {
  const backToTop = document.getElementById("backToTop");
  if (!backToTop) return;

  if (window.scrollY > 500) {
    backToTop.style.display = 'block';
  } else {
    backToTop.style.display = 'none';
  }
}

// 3. Theme Toggle Logic
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  // Check for saved theme
  const savedTheme = localStorage.getItem('thunimani_theme') || 'light';
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.onclick = () => {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';

    document.body.classList.replace(isDark ? 'dark' : 'light', newTheme);
    localStorage.setItem('thunimani_theme', newTheme);
    updateThemeIcon(newTheme);
  };
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

// 4. Scroll Animations (Origin Saga)
function initScrollAnimations() {
  const items = document.querySelectorAll('.timeline-item');
  if (items.length === 0) return;

  const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  items.forEach(item => observer.observe(item));
}

// Shared initialization
function initSharedUI() {
  initTheme();
  initScrollAnimations();

  const badge = document.getElementById('cartBadge');
  if (badge && typeof DataService !== 'undefined') {
    const cart = DataService.getCart();
    badge.innerText = cart.length;
    badge.style.display = cart.length > 0 ? 'inline-block' : 'none';
  }

  // Back to top click
  const bttBtn = document.getElementById("backToTop");
  if (bttBtn) {
    bttBtn.onclick = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  }
}

// Listeners
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateHeaderVisibility();
      handleBackToTop();
      ticking = false;
    });
    ticking = true;
  }
});

document.addEventListener('DOMContentLoaded', initSharedUI);

// Export for pages that might change data dynamically
window.updateCartBadge = () => {
  const badge = document.getElementById('cartBadge');
  if (badge && typeof DataService !== 'undefined') {
    const cart = DataService.getCart();
    badge.innerText = cart.length;
    badge.style.display = cart.length > 0 ? 'inline-block' : 'none';
  }
};
