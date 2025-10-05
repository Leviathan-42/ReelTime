let currentPage = 1;
let currentSearch = '';
const API_URL = window.location.origin;

async function loadShows(page = 1, searchQuery = '') {
  try {
    const container = document.getElementById('shows-container');
    container.innerHTML = '<p style="color: white; text-align: center;">Loading...</p>';

    let url = `${API_URL}/api/tvshows?page=${page}`;
    if (searchQuery) {
      url = `${API_URL}/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    const shows = data.results;

    container.innerHTML = '';

    if (shows.length === 0) {
      container.innerHTML = '<p style="color: white; text-align: center;">No shows found</p>';
      return;
    }

    shows.forEach(show => {
      const card = document.createElement('div');
      card.className = 'show-card';

      const posterUrl = show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : 'https://via.placeholder.com/250x375?text=No+Image';

      card.innerHTML = `
        <img src="${posterUrl}" alt="${show.name}">
        <div class="show-info">
          <h3>${show.name}</h3>
          <div class="show-meta">
            <span class="rating">⭐ ${show.vote_average.toFixed(1)}</span>
            <span class="date">${show.first_air_date || 'N/A'}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `details.html?id=${show.id}`;
      });

      container.appendChild(card);
    });

    document.getElementById('page-info').textContent = `Page ${page}`;
    document.getElementById('prev-btn').disabled = page === 1;
    document.getElementById('next-btn').disabled = page >= data.total_pages;
  } catch (error) {
    console.error('Error loading shows:', error);
    document.getElementById('shows-container').innerHTML =
      '<p style="color: white; text-align: center;">Failed to load shows</p>';
  }
}

document.getElementById('search-btn').addEventListener('click', () => {
  currentSearch = document.getElementById('search-input').value;
  currentPage = 1;
  loadShows(currentPage, currentSearch);
});

document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    currentSearch = document.getElementById('search-input').value;
    currentPage = 1;
    loadShows(currentPage, currentSearch);
  }
});

document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadShows(currentPage, currentSearch);
  }
});

document.getElementById('next-btn').addEventListener('click', () => {
  currentPage++;
  loadShows(currentPage, currentSearch);
});

loadShows(currentPage);
