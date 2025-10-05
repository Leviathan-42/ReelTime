// Migration script to move localStorage data to Firestore
// This will run once when you visit the page and migrate your existing data

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

async function migrateLocalStorageToFirestore(user) {
  if (!user) {
    console.log('Not signed in, skipping migration');
    return;
  }

  // Check if migration already happened
  const migrationKey = `migrated_to_firestore_${user.uid}`;
  if (localStorage.getItem(migrationKey) === 'true') {
    console.log('Already migrated for this user');
    return;
  }

  console.log('Starting migration from localStorage to Firestore...');

  const showsToMigrate = {};

  // Scan localStorage for ratings and favorites
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith('rating_')) {
      const showId = key.replace('rating_', '');
      const rating = parseInt(localStorage.getItem(key));

      if (!showsToMigrate[showId]) {
        showsToMigrate[showId] = {};
      }
      showsToMigrate[showId].rating = rating;
    }

    if (key.startsWith('favorite_')) {
      const showId = key.replace('favorite_', '');
      const isFavorite = localStorage.getItem(key) === 'true';

      if (!showsToMigrate[showId]) {
        showsToMigrate[showId] = {};
      }
      showsToMigrate[showId].favorite = isFavorite;
    }
  }

  // Migrate each show to Firestore
  const showIds = Object.keys(showsToMigrate);
  console.log(`Found ${showIds.length} shows to migrate`);

  if (showIds.length === 0) {
    console.log('No data to migrate');
    localStorage.setItem(migrationKey, 'true');
    return;
  }

  let migratedCount = 0;
  for (const showId of showIds) {
    try {
      const data = showsToMigrate[showId];
      const userDocRef = doc(db, 'users', user.uid, 'shows', showId);

      await setDoc(userDocRef, {
        rating: data.rating || 0,
        favorite: data.favorite || false,
        updatedAt: new Date().toISOString(),
        migratedFromLocalStorage: true
      });

      migratedCount++;
      console.log(`Migrated show ${showId}:`, data);
    } catch (error) {
      console.error(`Failed to migrate show ${showId}:`, error);
    }
  }

  console.log(`✅ Migration complete! Migrated ${migratedCount} shows to Firestore`);

  // Mark migration as complete
  localStorage.setItem(migrationKey, 'true');

  // Show success message
  alert(`Successfully migrated ${migratedCount} shows to your cloud library! Your data is now synced across devices.`);
}

// Wait for auth state and run migration
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await migrateLocalStorageToFirestore(user);
  }
});
