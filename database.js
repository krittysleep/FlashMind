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
      definition TEXT,
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

  cat.words = db.prepare('SELECT * FROM grammar_words WHERE category_id = ? ORDER BY RANDOM() LIMIT 8').all(id);
  cat.suffixes = db.prepare('SELECT * FROM grammar_suffixes WHERE category_id = ?').all(id);
  cat.notes = db.prepare('SELECT * FROM grammar_notes WHERE category_id = ? ORDER BY sort_order').all(id);
  cat.advancedPatterns = db.prepare('SELECT * FROM grammar_patterns WHERE category_id = ? ORDER BY sort_order').all(id);

  // Dynamic Challenge Generation from Random Vocab
  if (cat.words && cat.words.length > 0) {
    const randomWordRow = cat.words[Math.floor(Math.random() * cat.words.length)];
    
    if (cat.id === 'tenses') {
      cat.challenges = [];
      
      let shuffledWords = [...cat.words].sort(() => 0.5 - Math.random());
      const wordForMC = shuffledWords[0];
      const wordForType = shuffledWords.length > 1 ? shuffledWords[1] : shuffledWords[0];
      
      // Challenge 1: Multiple Choice
      const plainSentenceMC = wordForMC.example.replace(/<[^>]+>/g, '');
      const tenseMatch = wordForMC.meaning.match(/\((.*?)\)/);
      const correctTense = tenseMatch ? tenseMatch[1] : 'Present Simple';
      
      const allTenses = [
        'Present Simple', 'Present Continuous', 'Present Perfect', 'Present Perfect Continuous',
        'Past Simple', 'Past Continuous', 'Past Perfect', 'Past Perfect Continuous',
        'Future Simple', 'Future Continuous', 'Future Perfect', 'Future Perfect Continuous'
      ];
      
      const wrongTenses = allTenses.filter(t => t !== correctTense).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [correctTense, ...wrongTenses].sort(() => 0.5 - Math.random());
      
      cat.challenges.push({
        id: 'mc_1',
        type: 'multiple_choice',
        question: `Which tense is used in this sentence?`,
        sentenceText: plainSentenceMC,
        options: options,
        correctAnswer: correctTense,
        successMsg: `ถูกต้อง! ประโยคนี้คือ ${correctTense}`,
        errorMsg: `ยังไม่ใช่! ลองพิจารณาโครงสร้างประโยคดูใหม่นะ`
      });
      
      // Challenge 2: Typed Translation
      if (wordForType.thai_example) {
        const plainSentenceType = wordForType.example.replace(/<[^>]+>/g, '');
        cat.challenges.push({
          id: 'type_1',
          type: 'typed_translation',
          thaiSentence: wordForType.thai_example,
          englishSentence: plainSentenceType,
          successMsg: 'ถูกต้อง! คุณแต่งประโยคได้สมบูรณ์แบบ',
          errorMsg: 'ยังไม่ใช่! ลองตรวจสอบตัวสะกดและโครงสร้างอีกครั้ง'
        });
      }
    } else {
      // Interactive Token Challenge for other parts of speech
      cat.challenge = {
        type: 'identify_word',
        successMsg: `ถูกต้อง! "${randomWordRow.word}" คือคำศัพท์หมวด ${cat.name}`,
        errorMsg: `ยังไม่ใช่! ลองหาคำที่มีความหมายว่า "${randomWordRow.meaning}" ดูนะ`
      };
      
      const rawExample = randomWordRow.example || '';
      let modifiedEx = rawExample.replace(/<span class="grammar-highlight">/g, '[[[').replace(/<\/span>/g, ']]]');
      let chunks = modifiedEx.split(' ');
      let inTargetPhase = false;
      
      cat.challenge.sentence = chunks.map((chunk, index) => {
        if (chunk.includes('[[[')) inTargetPhase = true;
        let targetFlag = inTargetPhase ? 1 : 0;
        if (chunk.includes(']]]')) inTargetPhase = false;
        
        return {
          id: index,
          text: chunk.replace(/\[\[\[/g, '').replace(/\]\]\]/g, '').replace(/<[^>]+>/g, ''),
          isTarget: targetFlag
        };
      });
    }
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
