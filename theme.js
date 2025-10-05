// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';

// Apply the saved theme on page load
if (currentTheme === 'dark') {
  body.classList.add('dark-mode');
  themeIcon.textContent = '🌙';
}

// Toggle theme when button is clicked
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');

  // Update icon and save preference
  if (body.classList.contains('dark-mode')) {
    themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  } else {
    themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  }
});
