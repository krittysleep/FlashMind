const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flashmind.db');
const db = new Database(dbPath);

console.log("--- GRAMMAR CATEGORIES ---");
const categories = db.prepare('SELECT id, name FROM grammar_categories').all();
console.log(categories);

console.log("\n--- GRAMMAR WORDS ---");
const words = db.prepare('SELECT category_id, word FROM grammar_words').all();
console.log(words);

console.log("\n--- IELTS CARDS ---");
const cards = db.prepare('SELECT front FROM cards').all();
console.log(cards.slice(0, 5)); // print first 5 to keep it short
