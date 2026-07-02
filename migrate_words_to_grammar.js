const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flashmind.db');
const db = new Database(dbPath);

console.log("Removing basic interjections...");
db.prepare("DELETE FROM grammar_words WHERE category_id = 'interjection'").run();

console.log("Reading flashcards from database...");
const cards = db.prepare('SELECT front, back FROM cards').all();

const posMapping = {
  'noun': 'noun',
  'n.': 'noun',
  'verb': 'verb',
  'v.': 'verb',
  'adj': 'adjective',
  'adj.': 'adjective',
  'adv': 'adverb',
  'adv.': 'adverb',
  'prep': 'preposition',
  'prep.': 'preposition',
  'conj': 'conjunction',
  'conj.': 'conjunction'
};

let added = 0;

for (const card of cards) {
  // Parse front: e.g. "Significant (adj)" or "Evidence (noun)"
  const match = card.front.match(/^(.*?)\s*\((.*?)\)$/);
  if (!match) continue;
  
  const word = match[1].trim();
  let posRaw = match[2].trim().toLowerCase();
  
  // handle multiple pos like "n./adj." by just taking the first one
  if (posRaw.includes('/')) {
    posRaw = posRaw.split('/')[0];
  }
  
  const categoryId = posMapping[posRaw] || posRaw;
  
  // check if category exists
  let cat = db.prepare('SELECT id FROM grammar_categories WHERE id = ?').get(categoryId);
  if (!cat) {
    console.log(`Creating new category: ${categoryId}`);
    // Capitalize first letter
    const name = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    db.prepare('INSERT INTO grammar_categories (id, name, description, color, thai, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(
      categoryId, name, `A newly created category for ${name}s`, '#94a3b8', name, 99
    );
  }
  
  // Parse back: e.g. "สำคัญ, มีนัยสำคัญ\n\n\"There has been a **significant** increase...\""
  const parts = card.back.split(/\n\n|\\n\\n/);
  const meaning = parts[0].trim();
  let example = '';
  if (parts.length > 1) {
    example = parts.slice(1).join(' ').replace(/^"|"$/g, '').replace(/\\"/g, '"');
  }
  
  // Check if word already exists in this category
  const exists = db.prepare('SELECT id FROM grammar_words WHERE category_id = ? AND word = ?').get(categoryId, word);
  if (!exists) {
    db.prepare('INSERT INTO grammar_words (category_id, word, meaning, example) VALUES (?, ?, ?, ?)').run(categoryId, word, meaning, example);
    added++;
  }
}

console.log(`Successfully migrated ${added} vocabulary words into the Grammar Guide!`);
