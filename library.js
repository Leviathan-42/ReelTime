import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

let currentUser = null;

// Auth state observer
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (!user) {
    // Redirect to sign in if not authenticated
    alert('Please sign in to view your library');
    window.location.href = 'signin.html';
    return;
  }
  await loadLibrary();
});

async function loadLibrary() {
  if (!currentUser) return;

  const favorites = [];
  const rated = [];

  try {
    // Get all shows from Firestore
    const showsCollection = collection(db, 'users', currentUser.uid, 'shows');
    const showsSnapshot = await getDocs(showsCollection);

    showsSnapshot.forEach((doc) => {
      const showId = doc.id;
      const data = doc.data();

      if (data.favorite) {
        favorites.push(showId);
      }

      if (data.rating && data.rating > 0) {
        rated.push({ showId, rating: data.rating });
      }
    });
  } catch (error) {
    console.error('Error loading library:', error);
    document.getElementById('favorites-container').innerHTML =
      '<p class="empty-message">Error loading library. Please try again.</p>';
    return;
  }

  // Load favorite shows
  if (favorites.length > 0) {
    const favContainer = document.getElementById('favorites-container');
    favContainer.innerHTML = '<p class="loading-text">Loading favorites...</p>';

    const favShows = await Promise.all(
      favorites.map(id => fetchShowById(id))
    );

    renderShows(favShows.filter(s => s), favContainer, true);
  } else {
    document.getElementById('favorites-container').innerHTML =
      '<p class="empty-message">No favorites yet. Click the heart on any show to add it!</p>';
  }

  // Load rated shows
  if (rated.length > 0) {
    const ratedContainer = document.getElementById('rated-container');
    ratedContainer.innerHTML = '<p class="loading-text">Loading rated shows...</p>';

    const ratedShows = await Promise.all(
      rated.map(async ({ showId, rating }) => {
        const show = await fetchShowById(showId);
        return show ? { ...show, userRating: rating } : null;
      })
    );

    renderShows(ratedShows.filter(s => s), ratedContainer, false);
  } else {
    document.getElementById('rated-container').innerHTML =
      '<p class="empty-message">No rated shows yet. Rate any show to see it here!</p>';
  }
}

const API_URL = window.location.origin;

async function fetchShowById(id) {
  try {
    const response = await fetch(`${API_URL}/api/tvshow/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching show:', error);
    return null;
  }
}

function renderShows(shows, container, showFavorites) {
  if (shows.length === 0) {
    container.innerHTML = '<p class="empty-message">No shows found</p>';
    return;
  }

  container.innerHTML = '';
  container.className = 'library-grid';

  shows.forEach(show => {
    const card = document.createElement('div');
    card.className = 'show-card';

    const posterUrl = show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : 'https://via.placeholder.com/250x375?text=No+Image';

    let extraInfo = '';
    if (!showFavorites && show.userRating) {
      extraInfo = `<div class="user-rating-badge">${'★'.repeat(show.userRating)}</div>`;
    }

    card.innerHTML = `
      <img src="${posterUrl}" alt="${show.name}">
      <div class="show-info">
        <h3>${show.name}</h3>
        <div class="show-meta">
          <span class="rating">⭐ ${show.vote_average?.toFixed(1) || 'N/A'}</span>
          <span class="date">${show.first_air_date || 'N/A'}</span>
        </div>
        ${extraInfo}
      </div>
    `;

    card.addEventListener('click', () => {
      window.location.href = `details.html?id=${show.id}`;
    });

    container.appendChild(card);
  });
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    // Update button states
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});
