const urlParams = new URLSearchParams(window.location.search);
const showId = urlParams.get('id');
const API_URL = window.location.origin;

let userRating = 0;
let isFavorite = false;

async function loadShowDetails() {
  if (!showId) {
    document.getElementById('show-details').innerHTML =
      '<p style="color: white; text-align: center;">No show ID provided</p>';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/tvshow/${showId}`);
    const show = await response.json();

    // Load saved ratings from localStorage
    const savedRating = localStorage.getItem(`rating_${showId}`);
    const savedFavorite = localStorage.getItem(`favorite_${showId}`);

    if (savedRating) userRating = parseInt(savedRating);
    if (savedFavorite) isFavorite = savedFavorite === 'true';

    const posterUrl = show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Image';

    const backdropUrl = show.backdrop_path
      ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
      : '';

    document.getElementById('show-details').innerHTML = `
      ${backdropUrl ? `<div class="backdrop" style="background-image: url('${backdropUrl}')"></div>` : ''}
      <div class="details-content">
        <img src="${posterUrl}" alt="${show.name}" class="detail-poster">
        <div class="detail-info">
          <h2>${show.name}</h2>
          <div class="detail-meta">
            <span>⭐ ${show.vote_average?.toFixed(1) || 'N/A'} / 10</span>
            <span>${show.first_air_date || 'N/A'}</span>
            <span>${show.number_of_seasons || 0} Season${show.number_of_seasons !== 1 ? 's' : ''}</span>
            <span>${show.number_of_episodes || 0} Episodes</span>
          </div>

          <div class="genres">
            ${show.genres?.map(g => `<span class="genre-tag">${g.name}</span>`).join('') || ''}
          </div>

          <p class="overview">${show.overview || 'No description available.'}</p>

          <div class="user-interaction">
            <div class="rating-section">
              <h3>Your Rating:</h3>
              <div class="stars" id="star-rating">
                ${[1, 2, 3, 4, 5].map(star => `
                  <span class="star ${star <= userRating ? 'filled' : ''}" data-rating="${star}">★</span>
                `).join('')}
              </div>
            </div>

            <div class="favorite-section">
              <button id="favorite-btn" class="favorite-btn ${isFavorite ? 'favorited' : ''}">
                <span class="heart">${isFavorite ? '❤️' : '🤍'}</span>
                ${isFavorite ? 'Favorited' : 'Add to Favorites'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add star rating functionality
    document.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', (e) => {
        const rating = parseInt(e.target.dataset.rating);
        userRating = rating;
        localStorage.setItem(`rating_${showId}`, rating);
        updateStars();
      });

      star.addEventListener('mouseenter', (e) => {
        const rating = parseInt(e.target.dataset.rating);
        highlightStars(rating);
      });
    });

    document.getElementById('star-rating').addEventListener('mouseleave', () => {
      highlightStars(userRating);
    });

    // Add favorite functionality
    document.getElementById('favorite-btn').addEventListener('click', () => {
      isFavorite = !isFavorite;
      localStorage.setItem(`favorite_${showId}`, isFavorite);
      const btn = document.getElementById('favorite-btn');
      btn.classList.toggle('favorited');
      btn.querySelector('.heart').textContent = isFavorite ? '❤️' : '🤍';
      btn.childNodes[2].textContent = isFavorite ? 'Favorited' : 'Add to Favorites';
    });

  } catch (error) {
    console.error('Error loading show details:', error);
    document.getElementById('show-details').innerHTML =
      '<p style="color: white; text-align: center;">Failed to load show details</p>';
  }
}

function updateStars() {
  document.querySelectorAll('.star').forEach(star => {
    const rating = parseInt(star.dataset.rating);
    star.classList.toggle('filled', rating <= userRating);
  });
}

function highlightStars(rating) {
  document.querySelectorAll('.star').forEach(star => {
    const starRating = parseInt(star.dataset.rating);
    star.classList.toggle('filled', starRating <= rating);
  });
}

loadShowDetails();
