const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

const TMDB_API_KEY = '1330fb5d167bfc239614afd096e1fff2';

app.get('/api/tvshows', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    const page = req.query.page || 1;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search' });
  }
});

app.get('/api/tvshow/:id', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${req.params.id}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch show details' });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/details.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'details.html'));
});

app.get('/library.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'library.html'));
});

app.get('/signin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'signin.html'));
});

// Fallback for any other routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));