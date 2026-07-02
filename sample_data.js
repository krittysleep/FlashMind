const defaultDecks = [
  {
    id: "deck-ielts-academic",
    name: "IELTS Academic & Education",
    description: "B1-B2 vocabulary commonly used in IELTS Academic Reading, Writing, and Speaking.",
    color: "purple",
    cards: [
      { id: "ia1", front: "Acquire (v.)", back: "ได้รับมา, เข้าถือสิทธิ์\n\nDefinition: To obtain or buy something.\nExample: She acquired a new language skill through consistent daily practice." },
      { id: "ia2", front: "Analyze (v.)", back: "วิเคราะห์\n\nDefinition: To examine something in detail to discover its meaning or structure.\nExample: We need to analyze the IELTS essay guidelines carefully." },
      { id: "ia3", front: "Evaluate (v.)", back: "ประเมินค่า\n\nDefinition: To judge or calculate the quality, importance, or value of something.\nExample: The examiner will evaluate your speaking test based on pronunciation." },
      { id: "ia4", front: "Alternative (n./adj.)", back: "ทางเลือก, แทนที่\n\nDefinition: Something that you can choose instead of another thing.\nExample: Solar energy is a cleaner alternative to fossil fuels." },
      { id: "ia5", front: "Significant (adj.)", back: "สำคัญ, มีนัยสำคัญ\n\nDefinition: Important, large, or noticeable.\nExample: There has been a significant increase in online learning worldwide." },
      { id: "ia6", front: "Concept (n.)", back: "แนวคิด, หลักการ\n\nDefinition: An abstract idea or general understanding of something.\nExample: The basic concept of democracy is equality for all citizens." },
      { id: "ia7", front: "Critique (n./v.)", back: "วิจารณ์, ประเมินบทความ\n\nDefinition: A detailed analysis and assessment of something, especially a literary or artistic work.\nExample: We were asked to write a critique of the scientific article." },
      { id: "ia8", front: "Synthesize (v.)", back: "สังเคราะห์, ผสมผสาน\n\nDefinition: To combine different ideas or facts into a single system or concept.\nExample: You must synthesize facts from multiple paragraphs to answer." },
      { id: "ia9", front: "Collaborate (v.)", back: "ร่วมมือ, ทำงานร่วมกัน\n\nDefinition: To work jointly on an activity or project.\nExample: Students are encouraged to collaborate on group presentations." },
      { id: "ia10", front: "Interpret (v.)", back: "ตีความ, แปลความ\n\nDefinition: To explain the meaning of information or actions.\nExample: It can be difficult to interpret the results of the survey." }
    ]
  },
  {
    id: "deck-ielts-environment",
    name: "IELTS Environment & Science",
    description: "Essential terms regarding conservation, climate change, and ecosystems.",
    color: "green",
    cards: [
      { id: "ie1", front: "Sustainable (adj.)", back: "ยั่งยืน\n\nDefinition: Able to continue over a period of time without damaging the environment.\nExample: Using bamboo products is a sustainable option for green living." },
      { id: "ie2", front: "Conservation (n.)", back: "การอนุรักษ์\n\nDefinition: The protection of natural resources, wildlife, and plants.\nExample: Wildlife conservation protects endangered species from extinction." },
      { id: "ie3", front: "Depletion (n.)", back: "การลดลงอย่างมาก, การหมดไป\n\nDefinition: A reduction in the quantity or resource reserves of something.\nExample: The depletion of the ozone layer is a serious global crisis." },
      { id: "ie4", front: "Consequence (n.)", back: "ผลที่ตามมา\n\nDefinition: A result or effect of an action, typically one that is unwelcome.\nExample: Extreme weather is a direct consequence of global warming." },
      { id: "ie5", front: "Ecosystem (n.)", back: "ระบบนิเวศ\n\nDefinition: All the living things and their physical environment in a specific area.\nExample: Oil spills cause major damage to the marine ecosystem." },
      { id: "ie6", front: "Inhabitant (n.)", back: "ผู้อยู่อาศัย, สิ่งมีชีวิตที่อยู่อาศัย\n\nDefinition: A person or animal that lives in a particular place.\nExample: The forest is home to millions of small inhabitants." },
      { id: "ie7", front: "Toxic (adj.)", back: "เป็นพิษ\n\nDefinition: Poisonous or very harmful to life.\nExample: Toxic waste must be disposed of safely away from water sources." },
      { id: "ie8", front: "Biodiversity (n.)", back: "ความหลากหลายทางชีวภาพ\n\nDefinition: The number and variety of plant and animal species in an area.\nExample: Rainforests are critical because of their rich biodiversity." },
      { id: "ie9", front: "Contaminate (v.)", back: "ปนเปื้อน\n\nDefinition: To make something impure by exposure to a poisonous substance.\nExample: Industrial waste can contaminate local drinking water." },
      { id: "ie10", front: "Habitat (n.)", back: "ถิ่นที่อยู่อาศัย\n\nDefinition: The natural home or environment of an animal, plant, or other organism.\nExample: Deforestation destroys the natural habitats of wild animals." }
    ]
  },
  {
    id: "deck-ielts-tech",
    name: "IELTS Technology & Society",
    description: "B1-B2 vocabulary relating to technological advancements and social trends.",
    color: "blue",
    cards: [
      { id: "it1", front: "Breakthrough (n.)", back: "การค้นพบที่สำคัญ, การก้าวหน้าครั้งสำคัญ\n\nDefinition: An important development or discovery that helps solve a problem.\nExample: Making a breakthrough in artificial intelligence will change industry." },
      { id: "it2", front: "Obsolete (adj.)", back: "ล้าสมัย\n\nDefinition: No longer used or useful because something newer exists.\nExample: CD players have become obsolete due to music streaming apps." },
      { id: "it3", front: "Access (n./v.)", back: "การเข้าถึง, เข้าใช้\n\nDefinition: The right or opportunity to use, enter, or see something.\nExample: Many rural communities lack access to high-speed internet." },
      { id: "it4", front: "Revolutionize (v.)", back: "ปฏิวัติ\n\nDefinition: To completely change the way something is done.\nExample: The internet revolutionized the way people research information." },
      { id: "it5", front: "Influence (n./v.)", back: "อิทธิพล, ส่งผลกระทบ\n\nDefinition: The capacity to affect the character, development, or behavior of someone.\nExample: Advertising has a powerful influence on consumer choices." },
      { id: "it6", front: "Interaction (n.)", back: "การปฏิสัมพันธ์, การสื่อสาร\n\nDefinition: Communication or direct involvement between people or things.\nExample: Video conferencing allows real-time interaction for remote workers." },
      { id: "it7", front: "Privacy (n.)", back: "ความเป็นส่วนตัว\n\nDefinition: The state of being free from public attention or monitoring.\nExample: Internet users are increasingly concerned about data privacy." },
      { id: "it8", front: "Virtual (adj.)", back: "เสมือนจริง, ผ่านอินเทอร์เน็ต\n\nDefinition: Created by computer software to look or feel like real life.\nExample: During the pandemic, virtual classrooms replaced physical ones." },
      { id: "it9", front: "Innovation (n.)", back: "นวัตกรรม\n\nDefinition: A new method, idea, or product.\nExample: Technological innovation drives economic growth." }
    ]
  },
  {
    id: "deck-ielts-work",
    name: "IELTS Work & Economy",
    description: "Words concerning employment, businesses, markets, and monetary systems.",
    color: "orange",
    cards: [
      { id: "iw1", front: "Compensation (n.)", back: "ค่าตอบแทน, การชดเชย\n\nDefinition: Money paid to someone for their work or to make up for loss/injury.\nExample: Employees receive financial compensation and medical benefits." },
      { id: "iw2", front: "Entrepreneur (n.)", back: "ผู้ประกอบการ\n\nDefinition: A person who starts a business, taking financial risks in hope of profit.\nExample: The young entrepreneur opened a local organic coffee shop." },
      { id: "iw3", front: "Fluctuate (v.)", back: "ผันผวน, ขึ้นๆ ลงๆ\n\nDefinition: To change continuously in price, amount, or level.\nExample: Tourism rates fluctuate throughout the seasons in Thailand." },
      { id: "iw4", front: "Productivity (n.)", back: "ผลิตภัณฑ์, ประสิทธิภาพในการทำงาน\n\nDefinition: The rate at which a worker or company produces goods or services.\nExample: Regular breaks can help maintain worker productivity." },
      { id: "iw5", front: "Efficient (adj.)", back: "มีประสิทธิภาพ\n\nDefinition: Working well and quickly without wasting time, energy, or money.\nExample: An efficient public transport system reduces city traffic." },
      { id: "iw6", front: "Revenue (n.)", back: "รายได้\n\nDefinition: Income received by a business or government.\nExample: The company's revenue increased due to strong online sales." },
      { id: "iw7", front: "Consumer (n.)", back: "ผู้บริโภค\n\nDefinition: A person who purchases goods and services for personal use.\nExample: Smart consumers compare prices before buying expensive items." },
      { id: "iw8", front: "Colleague (n.)", back: "เพื่อนร่วมงาน\n\nDefinition: A person whom one works with, especially in a profession.\nExample: I asked my colleague for help preparing the presentation." },
      { id: "iw9", front: "Globalization (n.)", back: "โลกาภิวัตน์\n\nDefinition: The process by which businesses or influences start operating on an international scale.\nExample: Globalization has connected markets around the world." }
    ]
  },
  {
    id: "deck-ielts-health",
    name: "IELTS Health & Lifestyle",
    description: "B1-B2 terms regarding diet, exercise, well-being, and healthcare.",
    color: "red",
    cards: [
      { id: "ih1", front: "Nutrient (n.)", back: "สารอาหาร\n\nDefinition: A substance that provides nourishment essential for growth and life.\nExample: Vegetables are packed with essential nutrients." },
      { id: "ih2", front: "Sedentary (adj.)", back: "ที่ต้องนั่งนานๆ, ไม่ค่อยเคลื่อนไหว\n\nDefinition: Involving little exercise or physical activity.\nExample: A sedentary lifestyle can lead to health problems." },
      { id: "ih3", front: "Preventative (adj.)", back: "ที่ป้องกันไว้ก่อน\n\nDefinition: Intended to stop something before it happens.\nExample: Regular exercise is a great preventative measure against illnesses." },
      { id: "ih4", front: "Obesity (n.)", back: "โรคอ้วน\n\nDefinition: The state of being extremely fat or overweight.\nExample: Obesity is a growing health issue in many developed nations." },
      { id: "ih5", front: "Consume (v.)", back: "บริโภค, กิน/ใช้\n\nDefinition: To eat, drink, or ingest.\nExample: People should consume less sugar to stay fit." },
      { id: "ih6", front: "Cognitive (adj.)", back: "เกี่ยวกับกระบวนการรับรู้และคิด\n\nDefinition: Relating to mental processes of understanding and learning.\nExample: Reading books supports cognitive development in children." },
      { id: "ih7", front: "Well-being (n.)", back: "ความเป็นอยู่ที่ดี, สุขภาวะ\n\nDefinition: The state of being comfortable, healthy, or happy.\nExample: Yoga helps improve both physical and mental well-being." },
      { id: "ih8", front: "Therapy (n.)", back: "การบำบัดรักษา\n\nDefinition: Treatment intended to relieve or heal a disorder.\nExample: Physical therapy is necessary after a serious joint injury." }
    ]
  },
  {
    id: "deck-ielts-culture",
    name: "IELTS Culture & Society",
    description: "Vocabulary relating to heritage, arts, entertainment, and social customs.",
    color: "purple",
    cards: [
      { id: "ic1", front: "Heritage (n.)", back: "มรดก, ประเพณีที่สืบทอดมา\n\nDefinition: Valued objects and qualities such as historic buildings and cultural traditions.\nExample: Ayutthaya is part of Thailand's rich cultural heritage." },
      { id: "ic2", front: "Authentic (adj.)", back: "แท้จริง, ดั้งเดิม\n\nDefinition: Genuine, original, or traditional.\nExample: Tourists love tasting authentic Thai street food." },
      { id: "ic3", front: "Diverse (adj.)", back: "หลากหลาย\n\nDefinition: Showing a great deal of variety; very different.\nExample: London is known for its highly diverse population." },
      { id: "ic4", front: "Leisure (n.)", back: "เวลาว่าง, การพักผ่อนหย่อนใจ\n\nDefinition: Free time for enjoyment or relaxation.\nExample: She spends her leisure time gardening and painting." },
      { id: "ic5", front: "Preserve (v.)", back: "อนุรักษ์, รักษาไว้\n\nDefinition: To keep something in its original state or in good condition.\nExample: Museums help preserve ancient artifacts for future generations." },
      { id: "ic6", front: "Exhibition (n.)", back: "นิทรรศการ\n\nDefinition: A public display of works of art or items of interest.\nExample: We visited a fascinating photography exhibition yesterday." },
      { id: "ic7", front: "Local (adj./n.)", back: "ท้องถิ่น, คนท้องถิ่น\n\nDefinition: Relating to a particular area or neighborhood.\nExample: Supporting local businesses helps the community thrive." },
      { id: "ic8", front: "Custom (n.)", back: "ขนบธรรมเนียม, ประเพณี\n\nDefinition: A traditional and widely accepted way of behaving.\nExample: It is a local custom to remove shoes before entering a home." }
    ]
  },
  {
    id: "deck-ielts-travel",
    name: "IELTS Travel & Transport",
    description: "Key terms for urbanization, transportation networks, and journeys.",
    color: "blue",
    cards: [
      { id: "itrav1", front: "Infrastructure (n.)", back: "โครงสร้างพื้นฐาน\n\nDefinition: The basic physical systems of a country, like roads and power grids.\nExample: The city is investing in public transport infrastructure." },
      { id: "itrav2", front: "Commute (v./n.)", back: "การเดินทางไปกลับระหว่างบ้านและที่ทำงาน\n\nDefinition: To travel some distance between one's home and place of work on a regular basis.\nExample: He commutes to work by train every morning." },
      { id: "itrav3", front: "Congestion (n.)", back: "ความแออัด (เช่น การจราจร)\n\nDefinition: The state of being overcrowded or blocked.\nExample: Traffic congestion is a major problem in Bangkok." },
      { id: "itrav4", front: "Destination (n.)", back: "จุดหมายปลายทาง\n\nDefinition: The place to which someone or something is going.\nExample: Phuket remains a popular holiday destination for international travelers." },
      { id: "itrav5", front: "Urban (adj.)", back: "ในเมือง, เกี่ยวกับเมือง\n\nDefinition: Relating to a town or city.\nExample: More people are moving to urban areas in search of jobs." },
      { id: "itrav6", front: "Accommodate (v.)", back: "รองรับ, ให้ความสะดวก\n\nDefinition: To provide lodging or sufficient space for.\nExample: The new hotel can accommodate up to five hundred guests." },
      { id: "itrav7", front: "Remote (adj.)", back: "ห่างไกล, ทุรกันดาร\n\nDefinition: Situated far from the main centers of population; distant.\nExample: The tribe lives in a remote village in the mountains." },
      { id: "itrav8", front: "Route (n.)", back: "เส้นทาง\n\nDefinition: A way or course taken in getting from a starting point to a destination.\nExample: GPS helped us find the quickest route to the airport." }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = defaultDecks;
}
