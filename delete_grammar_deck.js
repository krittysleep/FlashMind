const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flashmind.db');
const db = new Database(dbPath);

console.log("Deleting 'IELTS Core Grammar Vocabulary' deck and its cards...");

const deckId = 'deck-ielts-grammar';

// Delete the cards associated with the deck
const deletedCards = db.prepare('DELETE FROM cards WHERE deck_id = ?').run(deckId);
console.log(`Deleted ${deletedCards.changes} cards.`);

// Delete the deck itself
const deletedDeck = db.prepare('DELETE FROM decks WHERE id = ?').run(deckId);
console.log(`Deleted deck. Changes: ${deletedDeck.changes}`);

console.log("Deletion complete.");
