// Hide/show theme toggle and auth icon on scroll
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const authLinkBtn = document.getElementById('auth-link');

  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scrolling down
    themeToggleBtn.classList.add('hidden');
    authLinkBtn.classList.add('hidden');
  } else {
    // Scrolling up
    themeToggleBtn.classList.remove('hidden');
    authLinkBtn.classList.remove('hidden');
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);
