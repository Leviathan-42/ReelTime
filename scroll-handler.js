// Hide/show theme toggle and auth icon on scroll
let lastScrollTop = 0;
const themeToggle = document.getElementById('theme-toggle');
const authLink = document.getElementById('auth-link');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scrolling down
    themeToggle.classList.add('hidden');
    authLink.classList.add('hidden');
  } else {
    // Scrolling up
    themeToggle.classList.remove('hidden');
    authLink.classList.remove('hidden');
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);
