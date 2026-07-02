const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  getAllDecks,
  getDeckById,
  createDeck,
  updateDeck,
  deleteDeck,
  addCardToDeck,
  getAllGrammarCategories,
  getGrammarCategoryById,
  getFullGrammarData,
  closeDb
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ============ DECK API ============

// GET /api/decks - Get all decks with their cards
app.get('/api/decks', (req, res) => {
  try {
    const decks = getAllDecks();
    res.json(decks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/decks/:id - Get a single deck
app.get('/api/decks/:id', (req, res) => {
  try {
    const deck = getDeckById(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/decks - Create a new deck
app.post('/api/decks', (req, res) => {
  try {
    const deck = createDeck(req.body);
    res.status(201).json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/decks/:id - Update a deck (full replace)
app.put('/api/decks/:id', (req, res) => {
  try {
    const existing = getDeckById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Deck not found' });
    const deck = updateDeck(req.params.id, req.body);
    res.json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/decks/:id - Delete a deck
app.delete('/api/decks/:id', (req, res) => {
  try {
    deleteDeck(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/decks/:id/cards - Add a card to a deck
app.post('/api/decks/:id/cards', (req, res) => {
  try {
    const deck = getDeckById(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    const card = addCardToDeck(req.params.id, req.body);
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ GRAMMAR API ============

// GET /api/grammar - Get all grammar categories (list only, no details)
app.get('/api/grammar', (req, res) => {
  try {
    const categories = getAllGrammarCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grammar/full - Get ALL grammar data (all categories with full details)
app.get('/api/grammar/full', (req, res) => {
  try {
    const data = getFullGrammarData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grammar/:id - Get a single grammar category with full details
app.get('/api/grammar/:id', (req, res) => {
  try {
    const cat = getGrammarCategoryById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Grammar category not found' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ FALLBACK ============

// SPA fallback: serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ START ============

app.listen(PORT, () => {
  console.log(`\n🚀 FlashMind server running at http://localhost:${PORT}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});
