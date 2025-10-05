import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCcpdmHgPyu_KL123f8rYmiuZQhcwev-1E",
  authDomain: "reeltime-fccfe.firebaseapp.com",
  projectId: "reeltime-fccfe",
  storageBucket: "reeltime-fccfe.firebasestorage.app",
  messagingSenderId: "239464299835",
  appId: "1:239464299835:web:887d7d0e57ca612ec44b1e",
  measurementId: "G-ZC5J3N2L88"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const showId = urlParams.get('id');
const API_URL = window.location.origin;

let userRating = 0;
let isFavorite = false;
let currentUser = null;

// Auth state observer
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user && showId) {
    // Load user data from Firestore
    await loadUserData();
  }
});

async function loadUserData() {
  if (!currentUser || !showId) return;

  try {
    const userDocRef = doc(db, 'users', currentUser.uid, 'shows', showId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      userRating = data.rating || 0;
      isFavorite = data.favorite || false;
      updateStars();
      updateFavoriteButton();
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

async function loadShowDetails() {
  if (!showId) {
    document.getElementById('show-details').innerHTML =
      '<p style="color: white; text-align: center;">No show ID provided</p>';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/tvshow/${showId}`);
    const show = await response.json();

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
      star.addEventListener('click', async (e) => {
        if (!currentUser) {
          alert('Please sign in to rate shows');
          window.location.href = 'signin.html';
          return;
        }

        const rating = parseInt(e.target.dataset.rating);
        userRating = rating;
        await saveUserData();
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
    document.getElementById('favorite-btn').addEventListener('click', async () => {
      if (!currentUser) {
        alert('Please sign in to add favorites');
        window.location.href = 'signin.html';
        return;
      }

      isFavorite = !isFavorite;
      await saveUserData();
      updateFavoriteButton();
    });

  } catch (error) {
    console.error('Error loading show details:', error);
    document.getElementById('show-details').innerHTML =
      '<p style="color: white; text-align: center;">Failed to load show details</p>';
  }
}

async function saveUserData() {
  if (!currentUser || !showId) return;

  try {
    const userDocRef = doc(db, 'users', currentUser.uid, 'shows', showId);
    await setDoc(userDocRef, {
      rating: userRating,
      favorite: isFavorite,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    alert('Failed to save. Please try again.');
  }
}

function updateStars() {
  document.querySelectorAll('.star').forEach(star => {
    const rating = parseInt(star.dataset.rating);
    star.classList.toggle('filled', rating <= userRating);
  });
}

function updateFavoriteButton() {
  const btn = document.getElementById('favorite-btn');
  if (btn) {
    btn.classList.toggle('favorited', isFavorite);
    btn.querySelector('.heart').textContent = isFavorite ? '❤️' : '🤍';
    btn.childNodes[2].textContent = isFavorite ? 'Favorited' : 'Add to Favorites';
  }
}

function highlightStars(rating) {
  document.querySelectorAll('.star').forEach(star => {
    const starRating = parseInt(star.dataset.rating);
    star.classList.toggle('filled', starRating <= rating);
  });
}

loadShowDetails();
