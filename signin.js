// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcpdmHgPyu_KL123f8rYmiuZQhcwev-1E",
  authDomain: "reeltime-fccfe.firebaseapp.com",
  projectId: "reeltime-fccfe",
  storageBucket: "reeltime-fccfe.firebasestorage.app",
  messagingSenderId: "239464299835",
  appId: "1:239464299835:web:887d7d0e57ca612ec44b1e",
  measurementId: "G-ZC5J3N2L88"
};

// Initialize Firebase
let app, auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  document.getElementById('auth-status').innerHTML =
    '<p class="error-message">Firebase not configured. Please set up your Firebase project.</p>';
}

const provider = new GoogleAuthProvider();

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    document.getElementById('sign-in-form').style.display = 'none';
    document.getElementById('user-profile').style.display = 'block';
    document.getElementById('user-email').textContent = user.email;

    // Update all auth links across the site
    updateAuthLinks(user);
  } else {
    // User is signed out
    document.getElementById('sign-in-form').style.display = 'block';
    document.getElementById('user-profile').style.display = 'none';
    updateAuthLinks(null);
  }
});

function updateAuthLinks(user) {
  const authLink = document.getElementById('auth-link');
  if (authLink) {
    if (user) {
      authLink.textContent = '👤';
      authLink.href = 'signin.html';
      authLink.title = user.email;
      authLink.style.opacity = '1';
    } else {
      authLink.textContent = '👤';
      authLink.href = 'signin.html';
      authLink.title = 'Sign In';
      authLink.style.opacity = '0.7';
    }
  }
}

// Sign in with email/password
document.getElementById('sign-in-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('auth-status').innerHTML =
      '<p class="success-message">Signed in successfully!</p>';
    setTimeout(() => window.location.href = 'index.html', 1500);
  } catch (error) {
    document.getElementById('auth-status').innerHTML =
      `<p class="error-message">Error: ${error.message}</p>`;
  }
});

// Sign up with email/password
document.getElementById('sign-up-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (password.length < 6) {
    document.getElementById('auth-status').innerHTML =
      '<p class="error-message">Password must be at least 6 characters</p>';
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    document.getElementById('auth-status').innerHTML =
      '<p class="success-message">Account created successfully!</p>';
    setTimeout(() => window.location.href = 'index.html', 1500);
  } catch (error) {
    document.getElementById('auth-status').innerHTML =
      `<p class="error-message">Error: ${error.message}</p>`;
  }
});

// Sign in with Google
document.getElementById('google-sign-in-btn')?.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
    document.getElementById('auth-status').innerHTML =
      '<p class="success-message">Signed in with Google!</p>';
    setTimeout(() => window.location.href = 'index.html', 1500);
  } catch (error) {
    document.getElementById('auth-status').innerHTML =
      `<p class="error-message">Error: ${error.message}</p>`;
  }
});

// Sign out
document.getElementById('sign-out-btn')?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    document.getElementById('auth-status').innerHTML =
      '<p class="success-message">Signed out successfully!</p>';
    setTimeout(() => window.location.href = 'index.html', 1500);
  } catch (error) {
    document.getElementById('auth-status').innerHTML =
      `<p class="error-message">Error: ${error.message}</p>`;
  }
});
