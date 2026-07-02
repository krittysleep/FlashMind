const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'flashmind.db');
const db = new Database(dbPath);

const vocabList = [
  // Deck 1: IELTS Academic & Education
  { deckName: 'IELTS Academic & Education', front: 'Significant (adj)', back: 'large or important enough to have an effect or to be noticed.\\n\\n"There has been a **significant** increase in the number of women students."' },
  { deckName: 'IELTS Academic & Education', front: 'Evidence (noun)', back: 'the facts, signs or objects that make you believe that something is true.\\n\\n"Researchers have found clear scientific **evidence** of climate change."' },
  { deckName: 'IELTS Academic & Education', front: 'Analyze (verb)', back: 'to examine the nature or structure of something, especially by separating it into its parts.\\n\\n"The job involves collecting and **analyzing** data."' },
  { deckName: 'IELTS Academic & Education', front: 'Approach (noun)', back: 'a way of dealing with somebody/something; a way of doing or thinking about something.\\n\\n"We need to adopt a new **approach** to the problem."' },
  { deckName: 'IELTS Academic & Education', front: 'Evaluate (verb)', back: 'to form an opinion of the amount, value or quality of something after thinking about it carefully.\\n\\n"Our research attempts to **evaluate** the effectiveness of the different drugs."' },
  { deckName: 'IELTS Academic & Education', front: 'Concept (noun)', back: 'an idea or a principle that is connected with something abstract.\\n\\n"He can\'t grasp the basic **concepts** of mathematics."' },
  
  // Deck 2: IELTS Environment & Science
  { deckName: 'IELTS Environment & Science', front: 'Sustainable (adj)', back: 'involving the use of natural products and energy in a way that does not harm the environment.\\n\\n"We need to create a **sustainable** society."' },
  { deckName: 'IELTS Environment & Science', front: 'Conservation (noun)', back: 'the protection of the natural environment.\\n\\n"Wildlife **conservation** is essential to prevent species extinction."' },
  { deckName: 'IELTS Environment & Science', front: 'Pollution (noun)', back: 'the process of making air, water, soil, etc. dirty; the state of being dirty.\\n\\n"The new legislation will help to reduce environmental **pollution**."' },
  { deckName: 'IELTS Environment & Science', front: 'Habitat (noun)', back: 'the place where a particular type of animal or plant is normally found.\\n\\n"The panda\'s natural **habitat** is the bamboo forest."' },
  { deckName: 'IELTS Environment & Science', front: 'Impact (noun)', back: 'the powerful effect that something has on somebody/something.\\n\\n"The environmental **impact** of this project will be enormous."' },
  { deckName: 'IELTS Environment & Science', front: 'Species (noun)', back: 'a group into which animals, plants, etc. that are able to breed with each other are divided.\\n\\n"Many plant and animal **species** are threatened with extinction."' },
  
  // Deck 3: IELTS Technology & Society
  { deckName: 'IELTS Technology & Society', front: 'Innovation (noun)', back: 'the introduction of new things, ideas or ways of doing something.\\n\\n"The company is very interested in product **innovation**."' },
  { deckName: 'IELTS Technology & Society', front: 'Network (noun)', back: 'a closely connected group of people, companies, etc. that exchange information.\\n\\n"The company has a global **network** of distributors."' },
  { deckName: 'IELTS Technology & Society', front: 'Virtual (adj)', back: 'made to appear to exist by the use of computer software.\\n\\n"Players can explore a **virtual** world."' },
  { deckName: 'IELTS Technology & Society', front: 'Access (noun)', back: 'the opportunity or right to use something or to see somebody/something.\\n\\n"Students must have **access** to a good library."' },
  { deckName: 'IELTS Technology & Society', front: 'Communicate (verb)', back: 'to share or exchange information, news, ideas, feelings, etc.\\n\\n"They **communicated** mostly by email."' },
  { deckName: 'IELTS Technology & Society', front: 'Trend (noun)', back: 'a general direction in which a situation is changing or developing.\\n\\n"There is a growing **trend** towards earlier retirement."' },
  
  // Deck 4: IELTS Work & Economy
  { deckName: 'IELTS Work & Economy', front: 'Economy (noun)', back: 'the relationship between production, trade and the supply of money in a particular country or region.\\n\\n"The national **economy** is growing slowly."' },
  { deckName: 'IELTS Work & Economy', front: 'Employment (noun)', back: 'work, especially when it is done to earn money.\\n\\n"Graduates are finding it increasingly difficult to find **employment**."' },
  { deckName: 'IELTS Work & Economy', front: 'Investment (noun)', back: 'the act of investing money in something.\\n\\n"This country needs investment in education."' },
  { deckName: 'IELTS Work & Economy', front: 'Income (noun)', back: 'the money that a person, a region, a country, etc. earns from work, from investing money, from business, etc.\\n\\n"People on higher **incomes** should pay more tax."' },
  { deckName: 'IELTS Work & Economy', front: 'Benefit (noun)', back: 'an advantage that something gives you; a helpful and useful effect that something has.\\n\\n"The new regulations will be of great **benefit** to everyone concerned."' },
  { deckName: 'IELTS Work & Economy', front: 'Consumer (noun)', back: 'a person who buys goods or uses services.\\n\\n"We need to educate **consumers** about this issue."' },
  
  // Deck 5: IELTS Health & Lifestyle
  { deckName: 'IELTS Health & Lifestyle', front: 'Nutrient (noun)', back: 'a substance that is needed to keep a living thing alive and to help it to grow.\\n\\n"Children need a diet rich in essential **nutrients**."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Physical (adj)', back: 'connected with a person\'s body rather than their mind.\\n\\n"You should ensure you get enough **physical** exercise."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Mental (adj)', back: 'connected with or happening in the mind; involving the process of thinking.\\n\\n"Stress can affect both your physical and **mental** health."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Disease (noun)', back: 'an illness affecting humans, animals or plants, often caused by infection.\\n\\n"Smoking increases the risk of heart **disease**."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Diet (noun)', back: 'the food and drink that you eat and drink regularly.\\n\\n"I loved the Japanese **diet** of rice, vegetables and fish."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Obesity (noun)', back: 'the quality or fact of being very fat, in a way that is not healthy.\\n\\n"**Obesity** can increase the risk of heart disease."' }
];

console.log("Inserting 30 IELTS B1-B2 vocabulary words...");

const insertCard = db.prepare('INSERT INTO cards (id, deck_id, front, back) VALUES (?, ?, ?, ?)');

let count = 0;
for (const vocab of vocabList) {
  // Find deck by name
  const deckRow = db.prepare('SELECT id FROM decks WHERE name = ?').get(vocab.deckName);
  
  if (deckRow) {
    const deckId = deckRow.id;
    // Check if card already exists (by front text and deck_id)
    const existing = db.prepare('SELECT id FROM cards WHERE deck_id = ? AND front = ?').get(deckId, vocab.front);
    if (!existing) {
      insertCard.run(crypto.randomUUID(), deckId, vocab.front, vocab.back);
      count++;
    }
  } else {
    console.error(`Deck not found: ${vocab.deckName}`);
  }
}

console.log(`Successfully added ${count} new cards.`);
