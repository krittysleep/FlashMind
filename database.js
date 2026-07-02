const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'flashmind.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    -- Flashcard decks
    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT 'purple'
    );

    -- Flashcard cards
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );

    -- Grammar categories
    CREATE TABLE IF NOT EXISTS grammar_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      thai TEXT,
      color TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    -- Grammar vocabulary words
    CREATE TABLE IF NOT EXISTS grammar_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      word TEXT NOT NULL,
      meaning TEXT,
      example TEXT,
      FOREIGN KEY (category_id) REFERENCES grammar_categories(id) ON DELETE CASCADE
    );

    -- Grammar suffixes
    CREATE TABLE IF NOT EXISTS grammar_suffixes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      suffix TEXT NOT NULL,
      meaning TEXT,
      example TEXT,
      color TEXT,
      FOREIGN KEY (category_id) REFERENCES grammar_categories(id) ON DELETE CASCADE
    );

    -- Grammar notes (Key Rules & Types)
    CREATE TABLE IF NOT EXISTS grammar_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES grammar_categories(id) ON DELETE CASCADE
    );

    -- Grammar advanced patterns (verb to-infinitive, etc.)
    CREATE TABLE IF NOT EXISTS grammar_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      example TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES grammar_categories(id) ON DELETE CASCADE
    );

    -- Grammar challenges
    CREATE TABLE IF NOT EXISTS grammar_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id TEXT NOT NULL UNIQUE,
      type TEXT,
      success_msg TEXT,
      error_msg TEXT,
      FOREIGN KEY (category_id) REFERENCES grammar_categories(id) ON DELETE CASCADE
    );

    -- Challenge sentence tokens
    CREATE TABLE IF NOT EXISTS challenge_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      is_target INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (challenge_id) REFERENCES grammar_challenges(id) ON DELETE CASCADE
    );
  `);
}

// ============ DECK HELPERS ============

function getAllDecks() {
  const db = getDb();
  const decks = db.prepare('SELECT * FROM decks').all();
  const stmtCards = db.prepare('SELECT * FROM cards WHERE deck_id = ?');
  return decks.map(deck => ({
    ...deck,
    cards: stmtCards.all(deck.id)
  }));
}

function getDeckById(id) {
  const db = getDb();
  const deck = db.prepare('SELECT * FROM decks WHERE id = ?').get(id);
  if (!deck) return null;
  deck.cards = db.prepare('SELECT * FROM cards WHERE deck_id = ?').all(id);
  return deck;
}

function createDeck(deck) {
  const db = getDb();
  const insertDeck = db.prepare('INSERT OR REPLACE INTO decks (id, name, description, color) VALUES (?, ?, ?, ?)');
  const insertCard = db.prepare('INSERT OR REPLACE INTO cards (id, deck_id, front, back) VALUES (?, ?, ?, ?)');

  const transaction = db.transaction((d) => {
    insertDeck.run(d.id, d.name, d.description || '', d.color || 'purple');
    if (d.cards && d.cards.length > 0) {
      for (const card of d.cards) {
        insertCard.run(card.id, d.id, card.front, card.back);
      }
    }
  });
  transaction(deck);
  return getDeckById(deck.id);
}

function updateDeck(id, data) {
  const db = getDb();
  const updateStmt = db.prepare('UPDATE decks SET name = ?, description = ?, color = ? WHERE id = ?');
  const deleteCards = db.prepare('DELETE FROM cards WHERE deck_id = ?');
  const insertCard = db.prepare('INSERT OR REPLACE INTO cards (id, deck_id, front, back) VALUES (?, ?, ?, ?)');

  const transaction = db.transaction((d) => {
    updateStmt.run(d.name, d.description || '', d.color || 'purple', id);
    deleteCards.run(id);
    if (d.cards && d.cards.length > 0) {
      for (const card of d.cards) {
        insertCard.run(card.id, id, card.front, card.back);
      }
    }
  });
  transaction(data);
  return getDeckById(id);
}

function deleteDeck(id) {
  const db = getDb();
  db.prepare('DELETE FROM decks WHERE id = ?').run(id);
}

function addCardToDeck(deckId, card) {
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO cards (id, deck_id, front, back) VALUES (?, ?, ?, ?)').run(card.id, deckId, card.front, card.back);
  return card;
}

// ============ GRAMMAR HELPERS ============

function getAllGrammarCategories() {
  const db = getDb();
  return db.prepare('SELECT * FROM grammar_categories ORDER BY sort_order').all();
}

function getGrammarCategoryById(id) {
  const db = getDb();
  const cat = db.prepare('SELECT * FROM grammar_categories WHERE id = ?').get(id);
  if (!cat) return null;

  cat.words = db.prepare('SELECT * FROM grammar_words WHERE category_id = ?').all(id);
  cat.suffixes = db.prepare('SELECT * FROM grammar_suffixes WHERE category_id = ?').all(id);
  cat.notes = db.prepare('SELECT * FROM grammar_notes WHERE category_id = ? ORDER BY sort_order').all(id);
  cat.advancedPatterns = db.prepare('SELECT * FROM grammar_patterns WHERE category_id = ? ORDER BY sort_order').all(id);

  // Challenge
  const challenge = db.prepare('SELECT * FROM grammar_challenges WHERE category_id = ?').get(id);
  if (challenge) {
    challenge.sentence = db.prepare('SELECT * FROM challenge_tokens WHERE challenge_id = ? ORDER BY sort_order').all(challenge.id);
    // Map is_target from int to boolean
    challenge.sentence = challenge.sentence.map(t => ({
      text: t.text,
      isTarget: t.is_target === 1
    }));
    cat.challenge = {
      type: challenge.type,
      successMsg: challenge.success_msg,
      errorMsg: challenge.error_msg,
      sentence: challenge.sentence
    };
  }

  return cat;
}

function getFullGrammarData() {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM grammar_categories ORDER BY sort_order').all();
  return categories.map(cat => getGrammarCategoryById(cat.id));
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDb,
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
};
