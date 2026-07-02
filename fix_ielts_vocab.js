const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flashmind.db');
const db = new Database(dbPath);

const vocabList = [
  // Deck 1: IELTS Academic & Education
  { deckName: 'IELTS Academic & Education', front: 'Significant (adj)', back: 'สำคัญ, มีนัยสำคัญ\\n\\n"There has been a **significant** increase in the number of women students."' },
  { deckName: 'IELTS Academic & Education', front: 'Evidence (noun)', back: 'หลักฐาน, ข้อพิสูจน์\\n\\n"Researchers have found clear scientific **evidence** of climate change."' },
  { deckName: 'IELTS Academic & Education', front: 'Analyze (verb)', back: 'วิเคราะห์\\n\\n"The job involves collecting and **analyzing** data."' },
  { deckName: 'IELTS Academic & Education', front: 'Approach (noun)', back: 'วิธีการ, แนวทาง\\n\\n"We need to adopt a new **approach** to the problem."' },
  { deckName: 'IELTS Academic & Education', front: 'Evaluate (verb)', back: 'ประเมินผล\\n\\n"Our research attempts to **evaluate** the effectiveness of the different drugs."' },
  { deckName: 'IELTS Academic & Education', front: 'Concept (noun)', back: 'แนวคิด, ความคิด\\n\\n"He can\'t grasp the basic **concepts** of mathematics."' },
  
  // Deck 2: IELTS Environment & Science
  { deckName: 'IELTS Environment & Science', front: 'Sustainable (adj)', back: 'ยั่งยืน, ถาวร\\n\\n"We need to create a **sustainable** society."' },
  { deckName: 'IELTS Environment & Science', front: 'Conservation (noun)', back: 'การอนุรักษ์\\n\\n"Wildlife **conservation** is essential to prevent species extinction."' },
  { deckName: 'IELTS Environment & Science', front: 'Pollution (noun)', back: 'มลภาวะ, มลพิษ\\n\\n"The new legislation will help to reduce environmental **pollution**."' },
  { deckName: 'IELTS Environment & Science', front: 'Habitat (noun)', back: 'ถิ่นที่อยู่อาศัย\\n\\n"The panda\'s natural **habitat** is the bamboo forest."' },
  { deckName: 'IELTS Environment & Science', front: 'Impact (noun)', back: 'ผลกระทบ\\n\\n"The environmental **impact** of this project will be enormous."' },
  { deckName: 'IELTS Environment & Science', front: 'Species (noun)', back: 'สายพันธุ์, ชนิด\\n\\n"Many plant and animal **species** are threatened with extinction."' },
  
  // Deck 3: IELTS Technology & Society
  { deckName: 'IELTS Technology & Society', front: 'Innovation (noun)', back: 'นวัตกรรม\\n\\n"The company is very interested in product **innovation**."' },
  { deckName: 'IELTS Technology & Society', front: 'Network (noun)', back: 'เครือข่าย\\n\\n"The company has a global **network** of distributors."' },
  { deckName: 'IELTS Technology & Society', front: 'Virtual (adj)', back: 'เสมือนจริง\\n\\n"Players can explore a **virtual** world."' },
  { deckName: 'IELTS Technology & Society', front: 'Access (noun)', back: 'การเข้าถึง\\n\\n"Students must have **access** to a good library."' },
  { deckName: 'IELTS Technology & Society', front: 'Communicate (verb)', back: 'สื่อสาร\\n\\n"They **communicated** mostly by email."' },
  { deckName: 'IELTS Technology & Society', front: 'Trend (noun)', back: 'แนวโน้ม, กระแส\\n\\n"There is a growing **trend** towards earlier retirement."' },
  
  // Deck 4: IELTS Work & Economy
  { deckName: 'IELTS Work & Economy', front: 'Economy (noun)', back: 'เศรษฐกิจ\\n\\n"The national **economy** is growing slowly."' },
  { deckName: 'IELTS Work & Economy', front: 'Employment (noun)', back: 'การจ้างงาน, การว่าจ้าง\\n\\n"Graduates are finding it increasingly difficult to find **employment**."' },
  { deckName: 'IELTS Work & Economy', front: 'Investment (noun)', back: 'การลงทุน\\n\\n"This country needs investment in education."' },
  { deckName: 'IELTS Work & Economy', front: 'Income (noun)', back: 'รายได้\\n\\n"People on higher **incomes** should pay more tax."' },
  { deckName: 'IELTS Work & Economy', front: 'Benefit (noun)', back: 'ประโยชน์, ผลประโยชน์\\n\\n"The new regulations will be of great **benefit** to everyone concerned."' },
  { deckName: 'IELTS Work & Economy', front: 'Consumer (noun)', back: 'ผู้บริโภค\\n\\n"We need to educate **consumers** about this issue."' },
  
  // Deck 5: IELTS Health & Lifestyle
  { deckName: 'IELTS Health & Lifestyle', front: 'Nutrient (noun)', back: 'สารอาหาร\\n\\n"Children need a diet rich in essential **nutrients**."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Physical (adj)', back: 'ทางร่างกาย, ทางกายภาพ\\n\\n"You should ensure you get enough **physical** exercise."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Mental (adj)', back: 'ทางจิตใจ\\n\\n"Stress can affect both your physical and **mental** health."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Disease (noun)', back: 'โรค, เชื้อโรค\\n\\n"Smoking increases the risk of heart **disease**."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Diet (noun)', back: 'อาหาร, อาหารการกิน\\n\\n"I loved the Japanese **diet** of rice, vegetables and fish."' },
  { deckName: 'IELTS Health & Lifestyle', front: 'Obesity (noun)', back: 'โรคอ้วน\\n\\n"**Obesity** can increase the risk of heart disease."' }
];

console.log("Fixing meanings for 30 IELTS B1-B2 vocabulary words...");

const updateCard = db.prepare('UPDATE cards SET back = ? WHERE deck_id = ? AND front = ?');

let count = 0;
for (const vocab of vocabList) {
  const deckRow = db.prepare('SELECT id FROM decks WHERE name = ?').get(vocab.deckName);
  
  if (deckRow) {
    const deckId = deckRow.id;
    const info = updateCard.run(vocab.back, deckId, vocab.front);
    if (info.changes > 0) {
      count += info.changes;
    }
  } else {
    console.error(`Deck not found: ${vocab.deckName}`);
  }
}

console.log(`Successfully updated ${count} cards with correct Thai meanings.`);
