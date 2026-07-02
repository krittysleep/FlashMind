// --- Application State ---
let decks = [];
let currentView = 'dashboard';
let currentDeck = null;

let studySession = {
  cards: [],
  currentIndex: 0,
  correct: [],
  incorrect: [],
  isFlipped: false
};

let editorState = {
  id: null,
  cards: [],
  color: 'purple'
};

let deleteTargetDeckId = null;

// --- DOM Elements ---
const views = {
  dashboard: document.getElementById('view-dashboard'),
  study: document.getElementById('view-study'),
  editor: document.getElementById('view-editor'),
  results: document.getElementById('view-results'),
  grammar: document.getElementById('view-grammar')
};

const navDecks = document.getElementById('nav-decks');
const navGrammar = document.getElementById('nav-grammar');

const decksGrid = document.getElementById('decks-grid');
const logoBtn = document.getElementById('logo-btn');
const btnCreateDeck = document.getElementById('btn-create-deck');

// Study elements
const btnStudyBack = document.getElementById('btn-study-back');
const studyProgressBar = document.getElementById('study-progress-bar');
const studyProgressText = document.getElementById('study-progress-text');
const btnStudyTts = document.getElementById('btn-study-tts');
const studyCardWrapper = document.getElementById('study-card-wrapper');
const flashcardElement = document.getElementById('flashcard');
const cardFrontText = document.getElementById('card-front-text');
const cardBackText = document.getElementById('card-back-text');
const btnNeedsReview = document.getElementById('btn-needs-review');
const btnGotIt = document.getElementById('btn-got-it');
const voiceSelect = document.getElementById('voice-select');

// Editor elements
const editorViewTitle = document.getElementById('editor-view-title');
const editorViewSubtitle = document.getElementById('editor-view-subtitle');
const deckTitleInput = document.getElementById('deck-title-input');
const deckDescInput = document.getElementById('deck-desc-input');
const deckColorPicker = document.getElementById('deck-color-picker');
const editorCardCount = document.getElementById('editor-card-count');
const editorCardsList = document.getElementById('editor-cards-list');
const btnAddEditorCard = document.getElementById('btn-add-editor-card');
const btnCancelDeck = document.getElementById('btn-cancel-deck');
const btnSaveDeck = document.getElementById('btn-save-deck');

// Results elements
const resultsDeckName = document.getElementById('results-deck-name');
const statCorrectCount = document.getElementById('stat-correct-count');
const statIncorrectCount = document.getElementById('stat-incorrect-count');
const resultsPercentage = document.getElementById('results-percentage');
const btnRestartStudy = document.getElementById('btn-restart-study');
const btnRandomDeck = document.getElementById('btn-random-deck');
const btnResultsDashboard = document.getElementById('btn-results-dashboard');

// Modals
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteDeckTitle = document.getElementById('delete-deck-title');
const btnDeleteCancel = document.getElementById('btn-delete-cancel');
const btnDeleteConfirm = document.getElementById('btn-delete-confirm');

const shortcutsHelperModal = document.getElementById('shortcuts-helper-modal');
const btnGlobalShortcuts = document.getElementById('btn-global-shortcuts');
const btnShortcutsClose = document.getElementById('btn-shortcuts-close');

// --- Speech Synthesis (Text to Speech) Setup ---
let synth = window.speechSynthesis;
let availableVoices = [];

function populateVoiceList() {
  if (!synth) return;
  availableVoices = synth.getVoices();

  // Clear options except default
  voiceSelect.innerHTML = '<option value="">Default Voice</option>';

  availableVoices.forEach(voice => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;

    // Auto select English or Spanish system voice as standard if possible
    if (voice.default) {
      option.selected = true;
    }
    voiceSelect.appendChild(option);
  });
}

// Speak logic
function speakText(text) {
  if (!synth) return;
  if (synth.speaking) {
    synth.cancel(); // Stop current speech immediately
  }

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoiceName = voiceSelect.value;

  if (selectedVoiceName) {
    const selectedVoice = availableVoices.find(v => v.name === selectedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  // Set slight voice rate parameters for extra clarity
  utterance.rate = 0.95;
  synth.speak(utterance);
}

// Voices load asynchronously
if (synth) {
  populateVoiceList();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoiceList;
  }
}

// --- Local Storage Operations ---
function loadDecks() {
  const storedDecks = localStorage.getItem('flashmind_decks');
  if (storedDecks) {
    try {
      decks = JSON.parse(storedDecks);
      // Automatic Migration: If the user has old default decks stored, replace them with IELTS decks
      const hasOldDecks = decks.some(d => d.id === 'deck-spanish' || d.id === 'deck-astronomy' || d.id === 'deck-web-dev');
      if (hasOldDecks) {
        decks = [...defaultDecks];
        saveDecks();
      } else {
        // Dynamic Sync: Check for any newly added default decks or cards, and merge them
        let needsSave = false;
        defaultDecks.forEach(defaultDeck => {
          const existingDeck = decks.find(d => d.id === defaultDeck.id);
          if (!existingDeck) {
            decks.push({ ...defaultDeck });
            needsSave = true;
          } else {
            // Check for missing cards in the deck
            defaultDeck.cards.forEach(defaultCard => {
              const hasCard = existingDeck.cards.some(c => c.id === defaultCard.id);
              if (!hasCard) {
                existingDeck.cards.push({ ...defaultCard });
                needsSave = true;
              }
            });
          }
        });
        if (needsSave) {
          saveDecks();
        }
      }
    } catch (e) {
      console.error("Failed to parse stored decks, loading defaults", e);
      decks = [...defaultDecks];
      saveDecks();
    }
  } else {
    decks = [...defaultDecks];
    saveDecks();
  }
}

function saveDecks() {
  localStorage.setItem('flashmind_decks', JSON.stringify(decks));
}

// --- Navigation / View Routing ---
function switchView(viewName) {
  currentView = viewName;

  // Cancel speech synthesis when changing views
  if (synth && synth.speaking) {
    synth.cancel();
  }

  Object.keys(views).forEach(key => {
    if (key === viewName) {
      views[key].classList.add('active');
    } else {
      views[key].classList.remove('active');
    }
  });

  // Perform view specific initializations
  if (viewName === 'dashboard') {
    renderDashboard();
  }
}

// --- Dashboard View Rendering ---
function renderDashboard() {
  decksGrid.innerHTML = '';

  if (decks.length === 0) {
    decksGrid.innerHTML = `
      <div class="glass-panel" style="grid-column: 1 / -1; text-align: center; padding: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
        <svg style="width: 48px; height: 48px; fill: var(--text-secondary);" viewBox="0 0 24 24">
          <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
        <h3>No Decks Found</h3>
        <p style="color: var(--text-secondary);">Create your very first study deck to kickstart your learning!</p>
      </div>
    `;
    return;
  }

  decks.forEach(deck => {
    const cardEl = document.createElement('div');
    cardEl.className = `deck-card color-${deck.color || 'purple'}`;

    const cardCount = deck.cards ? deck.cards.length : 0;
    const cardsLabel = cardCount === 1 ? '1 card' : `${cardCount} cards`;

    cardEl.innerHTML = `
      <div class="deck-info">
        <div class="deck-card-title">${escapeHTML(deck.name)}</div>
        <div class="deck-card-desc">${escapeHTML(deck.description || 'No description provided.')}</div>
      </div>
      <div class="deck-meta">
        <span class="deck-badge">${cardsLabel}</span>
      </div>
      <div class="deck-card-actions">
        <button class="btn btn-primary btn-study" data-id="${deck.id}" ${cardCount === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;" title="Add cards to study"' : ''}>
          Study
        </button>
        <button class="btn btn-secondary btn-edit" data-id="${deck.id}" title="Edit Deck">
          <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="btn btn-secondary btn-delete" data-id="${deck.id}" title="Delete Deck" style="color: var(--accent-red);">
          <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    `;

    // Bind actions
    cardEl.querySelector('.btn-study').addEventListener('click', (e) => {
      if (cardCount > 0) startStudySession(deck);
    });

    cardEl.querySelector('.btn-edit').addEventListener('click', () => {
      openDeckEditor(deck);
    });

    cardEl.querySelector('.btn-delete').addEventListener('click', () => {
      openDeleteConfirmModal(deck);
    });

    decksGrid.appendChild(cardEl);
  });
}

// --- Study Session View Logic ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startStudySession(deck, cardSubset = null) {
  currentDeck = deck;
  studySession.cards = cardSubset ? [...cardSubset] : [...deck.cards];
  studySession.cards = shuffleArray(studySession.cards);
  studySession.currentIndex = 0;
  studySession.correct = [];
  studySession.incorrect = [];
  studySession.isFlipped = false;

  flashcardElement.classList.remove('flipped');
  updateStudyCardUI();
  switchView('study');
}

function updateStudyCardUI() {
  const currentCard = studySession.cards[studySession.currentIndex];
  if (!currentCard) return;

  // Text setup with Part of Speech parser
  const frontMatch = currentCard.front.match(/^(.+)\s+\((v\.|n\.|adj\.|adv\.|n\.\/adj\.|n\.\/v\.)\)$/i);
  if (frontMatch) {
    const word = frontMatch[1].trim();
    const posAbbr = frontMatch[2].trim().toLowerCase();

    let posFullName = 'other';
    let posClass = 'other';

    if (posAbbr === 'v.') { posFullName = 'verb'; posClass = 'verb'; }
    else if (posAbbr === 'n.') { posFullName = 'noun'; posClass = 'noun'; }
    else if (posAbbr === 'adj.') { posFullName = 'adjective'; posClass = 'adjective'; }
    else if (posAbbr === 'adv.') { posFullName = 'adverb'; posClass = 'adverb'; }
    else if (posAbbr === 'n./adj.') { posFullName = 'noun / adj'; posClass = 'other'; }
    else if (posAbbr === 'n./v.') { posFullName = 'noun / verb'; posClass = 'other'; }

    cardFrontText.innerHTML = `
      <div class="word-display">${escapeHTML(word)}</div>
      <span class="pos-badge ${posClass}">${posFullName}</span>
    `;
  } else {
    cardFrontText.textContent = currentCard.front;
  }

  // Format the back to render linebreaks (\n) nicely as HTML line breaks
  cardBackText.innerHTML = escapeHTML(currentCard.back).replace(/\n/g, '<br>');

  // Progress Bar & Counter
  const total = studySession.cards.length;
  const progressPercent = ((studySession.currentIndex) / total) * 100;
  studyProgressBar.style.width = `${progressPercent}%`;

  studyProgressText.textContent = `Card ${studySession.currentIndex + 1} / ${total}`;

  // Flip animation state management
  studySession.isFlipped = false;
  flashcardElement.classList.remove('flipped');
}

function flipCard() {
  studySession.isFlipped = !studySession.isFlipped;
  if (flashcardElement) {
    flashcardElement.classList.toggle('flipped');
    console.log("flipCard executed. isFlipped:", studySession.isFlipped, "Classes on element:", flashcardElement.className);
  } else {
    console.error("flipCard failed: flashcardElement is null!");
  }
}

function handleCardEvaluation(isCorrect) {
  const card = studySession.cards[studySession.currentIndex];

  if (isCorrect) {
    studySession.correct.push(card);
  } else {
    studySession.incorrect.push(card);
  }

  // Advance or Complete
  if (studySession.currentIndex < studySession.cards.length - 1) {
    studySession.currentIndex++;

    // Card slide-out slide-in transition simulation
    flashcardElement.style.opacity = '0';
    flashcardElement.style.transform = 'translateY(10px) rotateY(0)';
    setTimeout(() => {
      updateStudyCardUI();
      flashcardElement.style.opacity = '1';
      flashcardElement.style.transform = '';
    }, 200);

  } else {
    // Session completed! Update final progress bar
    studyProgressBar.style.width = '100%';
    setTimeout(() => {
      showStudyResults();
    }, 350);
  }
}

function showStudyResults() {
  resultsDeckName.textContent = currentDeck.name;

  const correctNum = studySession.correct.length;
  const incorrectNum = studySession.incorrect.length;
  const total = studySession.cards.length;

  statCorrectCount.textContent = correctNum;
  statIncorrectCount.textContent = incorrectNum;

  const percentage = Math.round((correctNum / total) * 100);
  resultsPercentage.textContent = `Success Rate: ${percentage}%`;



  switchView('results');
}

// --- Deck Editor View Logic ---
function openDeckEditor(deck = null) {
  if (deck) {
    // Editing an existing deck
    editorViewTitle.textContent = "Edit Study Deck";
    editorViewSubtitle.textContent = "Edit properties and manage cards in this deck.";
    editorState.id = deck.id;
    editorState.color = deck.color || 'purple';
    deckTitleInput.value = deck.name;
    deckDescInput.value = deck.description || '';
    editorState.cards = deck.cards.map(c => ({ ...c })); // deep clone
  } else {
    // Creating a new deck
    editorViewTitle.textContent = "Create Study Deck";
    editorViewSubtitle.textContent = "Customize your deck properties and manage cards.";
    editorState.id = null;
    editorState.color = 'purple';
    deckTitleInput.value = '';
    deckDescInput.value = '';
    // Seed with two empty cards initially for easier UI layout
    editorState.cards = [
      { id: generateId(), front: '', back: '' },
      { id: generateId(), front: '', back: '' }
    ];
  }

  updateColorPickerUI();
  renderEditorCards();
  switchView('editor');
}

function updateColorPickerUI() {
  const options = deckColorPicker.querySelectorAll('.color-option');
  options.forEach(opt => {
    if (opt.getAttribute('data-color') === editorState.color) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });
}

function syncEditorInputs() {
  // Read all inputs currently in the DOM to avoid losing user typed values
  const items = editorCardsList.querySelectorAll('.editor-card-item');
  items.forEach((item, index) => {
    if (editorState.cards[index]) {
      editorState.cards[index].front = item.querySelector('.input-front').value.trim();
      editorState.cards[index].back = item.querySelector('.input-back').value.trim();
    }
  });
}

function renderEditorCards() {
  editorCardsList.innerHTML = '';
  editorCardCount.textContent = editorState.cards.length;

  editorState.cards.forEach((card, index) => {
    const cardItem = document.createElement('div');
    cardItem.className = 'editor-card-item';
    cardItem.innerHTML = `
      <div class="card-num">${index + 1}</div>
      <div class="card-fields">
        <div class="form-group">
          <label>Front Term</label>
          <input type="text" class="input-front" placeholder="Question or term..." value="${escapeHTML(card.front)}">
        </div>
        <div class="form-group">
          <label>Back Definition</label>
          <input type="text" class="input-back" placeholder="Answer or explanation..." value="${escapeHTML(card.back)}">
        </div>
      </div>
      <button class="btn btn-danger btn-icon-only btn-delete-card" title="Delete Card" style="flex-shrink:0;">
        <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </button>
    `;

    // Bind individual delete button
    cardItem.querySelector('.btn-delete-card').addEventListener('click', () => {
      syncEditorInputs();
      editorState.cards.splice(index, 1);
      renderEditorCards();
    });

    editorCardsList.appendChild(cardItem);
  });
}

function saveActiveDeck() {
  const name = deckTitleInput.value.trim();
  const description = deckDescInput.value.trim();

  if (!name) {
    alert("Please enter a deck name.");
    deckTitleInput.focus();
    return;
  }

  syncEditorInputs();

  // Validate that cards are populated and don't contain empty values
  const validCards = editorState.cards.filter(c => c.front.trim() || c.back.trim());
  if (validCards.length === 0) {
    alert("Please add at least one card with front or back content before saving.");
    return;
  }

  // Format cards (ensure no blank values remain, assign IDs if needed)
  const finalCards = validCards.map(c => ({
    id: c.id || generateId(),
    front: c.front.trim() || "Empty Term",
    back: c.back.trim() || "Empty Definition"
  }));

  if (editorState.id) {
    // Edit existing
    const idx = decks.findIndex(d => d.id === editorState.id);
    if (idx !== -1) {
      decks[idx].name = name;
      decks[idx].description = description;
      decks[idx].color = editorState.color;
      decks[idx].cards = finalCards;
    }
  } else {
    // Create new
    const newDeck = {
      id: 'deck-' + generateId(),
      name,
      description,
      color: editorState.color,
      cards: finalCards
    };
    decks.push(newDeck);
  }

  saveDecks();
  switchView('dashboard');
}

// --- Delete Deck Modals Logic ---
function openDeleteConfirmModal(deck) {
  deleteTargetDeckId = deck.id;
  deleteDeckTitle.textContent = deck.name;
  deleteConfirmModal.classList.add('active');
}

function closeDeleteConfirmModal() {
  deleteTargetDeckId = null;
  deleteConfirmModal.classList.remove('active');
}

function executeDeleteDeck() {
  if (deleteTargetDeckId) {
    decks = decks.filter(d => d.id !== deleteTargetDeckId);
    saveDecks();
    renderDashboard();
  }
  closeDeleteConfirmModal();
}

// --- Helper Functions ---
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Global Event Binding ---

// Logo home trigger
logoBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (navDecks && navGrammar) {
    navDecks.classList.add('active');
    navGrammar.classList.remove('active');
  }
  switchView('dashboard');
});

// Nav tabs
if (navDecks && navGrammar) {
  navDecks.addEventListener('click', () => {
    navDecks.classList.add('active');
    navGrammar.classList.remove('active');
    switchView('dashboard');
  });

  navGrammar.addEventListener('click', () => {
    navGrammar.classList.add('active');
    navDecks.classList.remove('active');
    switchView('grammar');
    if (typeof renderGrammarView === 'function') renderGrammarView();
  });
}

// Create Deck Button click
btnCreateDeck.addEventListener('click', () => {
  openDeckEditor(null);
});

// Study view event listeners
btnStudyBack.addEventListener('click', () => {
  switchView('dashboard');
});

// Global document-level click handler for study card flips to ensure compatibility across all browsers
document.addEventListener('click', (e) => {
  if (currentView !== 'study') return;

  // If clicked element or its parent is the card or wrapper
  const isCardClick = e.target.closest('#flashcard') || e.target.closest('#study-card-wrapper');
  if (isCardClick) {
    // Ignore clicks if they occurred on action buttons (like TTS) or dropdowns
    if (e.target.closest('.btn') || e.target.closest('select')) return;

    console.log("Global document handler captured card click. Target:", e.target);
    flipCard();
  }
});

btnStudyTts.addEventListener('click', () => {
  const currentCard = studySession.cards[studySession.currentIndex];
  if (!currentCard) return;

  let textToRead = '';
  if (studySession.isFlipped) {
    // If card is flipped to the back, read the Example sentence if available, otherwise read the clean word
    const exampleMatch = currentCard.back.match(/Example:\s*(.+)$/i);
    if (exampleMatch) {
      textToRead = exampleMatch[1];
    } else {
      textToRead = currentCard.front.replace(/\s*\(.+\)\s*$/, '');
    }
  } else {
    // If front, read only the clean word without the part of speech suffix
    textToRead = currentCard.front.replace(/\s*\(.+\)\s*$/, '');
  }
  speakText(textToRead);
});

btnNeedsReview.addEventListener('click', () => {
  handleCardEvaluation(false);
});

btnGotIt.addEventListener('click', () => {
  handleCardEvaluation(true);
});

// Editor View Event Listeners
deckColorPicker.addEventListener('click', (e) => {
  if (e.target.classList.contains('color-option')) {
    editorState.color = e.target.getAttribute('data-color');
    updateColorPickerUI();
  }
});

btnAddEditorCard.addEventListener('click', () => {
  syncEditorInputs();
  editorState.cards.push({ id: generateId(), front: '', back: '' });
  renderEditorCards();

  // Auto scroll to the newly added row
  setTimeout(() => {
    editorCardsList.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
    editorCardsList.lastElementChild?.querySelector('.input-front')?.focus();
  }, 50);
});

btnCancelDeck.addEventListener('click', () => {
  switchView('dashboard');
});

btnSaveDeck.addEventListener('click', saveActiveDeck);

// Results view buttons
btnRestartStudy.addEventListener('click', () => {
  startStudySession(currentDeck);
});

btnRandomDeck.addEventListener('click', () => {
  if (decks.length > 0) {
    const randomDeck = decks[Math.floor(Math.random() * decks.length)];
    startStudySession(randomDeck);
  }
});

btnResultsDashboard.addEventListener('click', () => {
  switchView('dashboard');
});

// Modal Actions
btnDeleteCancel.addEventListener('click', closeDeleteConfirmModal);
btnDeleteConfirm.addEventListener('click', executeDeleteDeck);

// Shortcuts Modal Actions
btnGlobalShortcuts.addEventListener('click', () => {
  shortcutsHelperModal.classList.add('active');
});

btnShortcutsClose.addEventListener('click', () => {
  shortcutsHelperModal.classList.remove('active');
});

// Click outside modal overlays to close them
window.addEventListener('click', (e) => {
  if (e.target === deleteConfirmModal) {
    closeDeleteConfirmModal();
  }
  if (e.target === shortcutsHelperModal) {
    shortcutsHelperModal.classList.remove('active');
  }
});

// --- Keyboard Shortcuts Listeners ---
window.addEventListener('keydown', (e) => {
  // Check if user is typing in a form input or textarea. If so, ignore global hotkeys.
  const activeTagName = document.activeElement.tagName.toLowerCase();
  if (activeTagName === 'input' || activeTagName === 'textarea' || activeTagName === 'select') {
    // Exceptions: Esc to cancel/blur
    if (e.key === 'Escape') {
      document.activeElement.blur();
    }
    return;
  }

  // Escape key actions globally
  if (e.key === 'Escape') {
    if (deleteConfirmModal.classList.contains('active')) {
      closeDeleteConfirmModal();
    } else if (shortcutsHelperModal.classList.contains('active')) {
      shortcutsHelperModal.classList.remove('active');
    } else if (currentView === 'study') {
      switchView('dashboard');
    } else if (currentView === 'editor') {
      switchView('dashboard');
    } else if (currentView === 'results') {
      switchView('dashboard');
    }
    return;
  }

  // Study View specific key shortcuts
  if (currentView === 'study') {
    if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault(); // Prevent default page scrolling
      flipCard();
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'a': // Needs review
        handleCardEvaluation(false);
        break;
      case 'd': // Got It
        handleCardEvaluation(true);
        break;
      case 's': // Speak / TTS
        btnStudyTts.click();
        break;
    }
  }
});

// --- App Initialization ---
function initApp() {
  console.log("Initializing FlashMind App...");
  loadDecks();
  switchView('dashboard');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// --- Grammar & Parts of Speech Module ---

const grammarData = [
  {
    id: 'noun',
    name: 'Noun',
    thai: 'คำนาม',
    color: '#3b82f6', // blue
    desc: 'ใช้เรียกชื่อคน สัตว์ สิ่งของ สถานที่ หรือแนวคิดนามธรรม (เช่น idea, knowledge) เป็นส่วนสำคัญมากในการจับใจความหลักของประโยค',
    words: [
      { word: 'Acquisition', meaning: 'การได้รับมา, การเข้าถือสิทธิ์', example: 'The <span class="grammar-highlight">acquisition</span> of new vocabulary takes time and practice.' },
      { word: 'Analysis', meaning: 'การวิเคราะห์, การแยกแยะ', example: 'The data <span class="grammar-highlight">analysis</span> revealed a significant trend.' },
      { word: 'Hypothesis', meaning: 'สมมติฐาน, ข้อสันนิษฐาน', example: 'Scientists proposed a new <span class="grammar-highlight">hypothesis</span> regarding climate change.' },
      { word: 'Environment', meaning: 'สิ่งแวดล้อม', example: 'The <span class="grammar-highlight">environment</span> must be protected from pollution.' },
      { word: 'Approach', meaning: 'วิธีการ, แนวทาง', example: 'We need a new <span class="grammar-highlight">approach</span> to solve this problem.' },
      { word: 'Consequence', meaning: 'ผลที่ตามมา', example: 'Every action has a <span class="grammar-highlight">consequence</span>.' },
      { word: 'Proportion', meaning: 'สัดส่วน', example: 'A large <span class="grammar-highlight">proportion</span> of the budget was spent on education.' }
    ],
    challenge: {
      type: 'Noun',
      sentence: [
        { text: 'The', isTarget: false },
        { text: 'analysis', isTarget: true },
        { text: 'showed', isTarget: false },
        { text: 'promising', isTarget: false },
        { text: 'results.', isTarget: true }
      ],
      successMsg: 'ถูกต้อง! analysis และ results เป็นคำนามในประโยคนี้',
      errorMsg: 'ลองอีกครั้ง! คำนามคือสิ่งที่แสดงถึงสิ่งของหรือแนวคิดหลัก (เช่น analysis)'
    }
  },
  {
    id: 'verb',
    name: 'Verb',
    thai: 'คำกริยา',
    color: '#ef4444', // red
    desc: 'ใช้แสดงการกระทำหรือสภาพ (เช่น analyze, occur) เป็นหัวใจของประโยค ถ้าขาดคำกริยา ประโยคจะไม่สมบูรณ์',
    words: [
      { word: 'Analyze', meaning: 'วิเคราะห์', example: 'We must <span class="grammar-highlight">analyze</span> the results before drawing conclusions.' },
      { word: 'Demonstrate', meaning: 'สาธิต, แสดงให้เห็น', example: 'The experiment will <span class="grammar-highlight">demonstrate</span> how the process works.' },
      { word: 'Fluctuate', meaning: 'ผันผวน, เปลี่ยนแปลงขึ้นลง', example: 'Stock prices <span class="grammar-highlight">fluctuate</span> based on market conditions.' },
      { word: 'Establish', meaning: 'ก่อตั้ง, สร้าง', example: 'The company plans to <span class="grammar-highlight">establish</span> a new branch.' },
      { word: 'Evaluate', meaning: 'ประเมิน', example: 'Teachers will <span class="grammar-highlight">evaluate</span> the students\' progress.' },
      { word: 'Maintain', meaning: 'รักษาไว้', example: 'It is hard to <span class="grammar-highlight">maintain</span> a healthy lifestyle.' },
      { word: 'Indicate', meaning: 'บ่งชี้, แสดงให้เห็น', example: 'The chart will <span class="grammar-highlight">indicate</span> the sales growth.' }
    ],
    challenge: {
      type: 'Verb',
      sentence: [
        { text: 'Prices', isTarget: false },
        { text: 'fluctuate', isTarget: true },
        { text: 'frequently', isTarget: false },
        { text: 'during', isTarget: false },
        { text: 'the', isTarget: false },
        { text: 'winter.', isTarget: false }
      ],
      successMsg: 'เก่งมาก! fluctuate เป็นกริยาแปลว่าผันผวน',
      errorMsg: 'ยังไม่ใช่! คำกริยาคือการกระทำหรืออาการในประโยค'
    }
  },
  {
    id: 'adjective',
    name: 'Adjective',
    thai: 'คำคุณศัพท์',
    color: '#eab308', // yellow
    desc: 'ใช้ขยายคำนามเพื่อบอกลักษณะ (เช่น significant, accurate) ในข้อสอบ IELTS มักเจอในการอธิบายกราฟหรือลักษณะเฉพาะ',
    words: [
      { word: 'Significant', meaning: 'สำคัญ, มีนัยสำคัญ', example: 'There was a <span class="grammar-highlight">significant</span> increase in sales this quarter.' },
      { word: 'Accurate', meaning: 'ถูกต้อง, แม่นยำ', example: 'It is important to provide <span class="grammar-highlight">accurate</span> information on the form.' },
      { word: 'Sustainable', meaning: 'ยั่งยืน', example: 'The company is looking for <span class="grammar-highlight">sustainable</span> energy solutions.' },
      { word: 'Crucial', meaning: 'สำคัญมาก', example: 'Sleep is <span class="grammar-highlight">crucial</span> for good health.' },
      { word: 'Obvious', meaning: 'ชัดเจน', example: 'It is <span class="grammar-highlight">obvious</span> that he is lying.' },
      { word: 'Sufficient', meaning: 'เพียงพอ', example: 'We have <span class="grammar-highlight">sufficient</span> resources for the project.' },
      { word: 'Complex', meaning: 'ซับซ้อน', example: 'The human brain is a <span class="grammar-highlight">complex</span> organ.' }
    ],
    challenge: {
      type: 'Adjective',
      sentence: [
        { text: 'We', isTarget: false },
        { text: 'must', isTarget: false },
        { text: 'find', isTarget: false },
        { text: 'a', isTarget: false },
        { text: 'sustainable', isTarget: true },
        { text: 'solution.', isTarget: false }
      ],
      successMsg: 'ถูกต้อง! sustainable ขยายคำนาม solution (ทางออกที่ยั่งยืน)',
      errorMsg: 'ลองใหม่! คำคุณศัพท์มักอยู่หน้าคำนามเพื่อบอกลักษณะ'
    }
  },
  {
    id: 'adverb',
    name: 'Adverb',
    thai: 'คำกริยาวิเศษณ์',
    color: '#10b981', // green
    desc: 'ใช้ขยายกริยา คุณศัพท์ หรือกริยาวิเศษณ์ด้วยกันเอง (เช่น significantly, rapidly) มักลงท้ายด้วย -ly ใช้เยอะมากใน Task 1',
    words: [
      { word: 'Significantly', meaning: 'อย่างสำคัญ, อย่างมาก', example: 'The number of tourists dropped <span class="grammar-highlight">significantly</span> in winter.' },
      { word: 'Rapidly', meaning: 'อย่างรวดเร็ว', example: 'Technology is advancing <span class="grammar-highlight">rapidly</span> in the modern era.' },
      { word: 'Consistently', meaning: 'อย่างสม่ำเสมอ', example: 'She has <span class="grammar-highlight">consistently</span> achieved high scores in her exams.' },
      { word: 'Increasingly', meaning: 'มากขึ้นเรื่อยๆ', example: 'The weather is becoming <span class="grammar-highlight">increasingly</span> hot.' },
      { word: 'Approximately', meaning: 'โดยประมาณ', example: 'The journey takes <span class="grammar-highlight">approximately</span> two hours.' },
      { word: 'Initially', meaning: 'ในตอนแรก', example: '<span class="grammar-highlight">Initially</span>, I thought the exam was easy.' },
      { word: 'Virtually', meaning: 'เกือบจะ, แทบจะ', example: 'The city was <span class="grammar-highlight">virtually</span> empty during the holiday.' }
    ],
    challenge: {
      type: 'Adverb',
      sentence: [
        { text: 'The', isTarget: false },
        { text: 'population', isTarget: false },
        { text: 'grew', isTarget: false },
        { text: 'rapidly', isTarget: true },
        { text: 'in', isTarget: false },
        { text: '2010.', isTarget: false }
      ],
      successMsg: 'เยี่ยมมาก! rapidly ขยายกริยา grew (เติบโตอย่างรวดเร็ว)',
      errorMsg: 'ยังไม่ใช่! ลองหาคำที่ลงท้ายด้วย -ly ที่ขยายการกระทำดูนะ'
    }
  },
  {
    id: 'pronoun',
    name: 'Pronoun',
    thai: 'คำสรรพนาม',
    color: '#a855f7', // purple
    desc: 'ใช้แทนคำนาม (เช่น it, they, this, which) เพื่อลดการใช้คำซ้ำซ้อน ช่วยให้ประโยคใน Reading และ Writing สละสลวยขึ้น',
    words: [
      { word: 'They / Them', meaning: 'พวกเขา / พวกมัน', example: 'Students should review their notes if <span class="grammar-highlight">they</span> want to pass.' },
      { word: 'Which', meaning: 'ซึ่ง, อันที่', example: 'He bought a new laptop, <span class="grammar-highlight">which</span> was very expensive.' },
      { word: 'Those', meaning: 'เหล่านั้น', example: '<span class="grammar-highlight">Those</span> who study daily tend to perform better.' },
      { word: 'Anyone', meaning: 'ใครก็ได้', example: '<span class="grammar-highlight">Anyone</span> can join the competition.' },
      { word: 'Whatever', meaning: 'อะไรก็ตาม', example: 'You can eat <span class="grammar-highlight">whatever</span> you want.' },
      { word: 'Themselves', meaning: 'พวกเขากันเอง/ด้วยตัวเอง', example: 'The students organized the event <span class="grammar-highlight">themselves</span>.' },
      { word: 'Neither', meaning: 'ไม่ทั้งสองอย่าง', example: '<span class="grammar-highlight">Neither</span> of the answers is correct.' }
    ],
    challenge: {
      type: 'Pronoun',
      sentence: [
        { text: 'Many', isTarget: false },
        { text: 'students', isTarget: false },
        { text: 'struggle,', isTarget: false },
        { text: 'but', isTarget: false },
        { text: 'they', isTarget: true },
        { text: 'can', isTarget: false },
        { text: 'improve.', isTarget: false }
      ],
      successMsg: 'ถูกต้อง! they แทนคำว่า students ในประโยคก่อนหน้า',
      errorMsg: 'ลองอีกครั้ง! หาคำที่ใช้แทนคำนามที่กล่าวมาแล้ว'
    }
  },
  {
    id: 'preposition',
    name: 'Preposition',
    thai: 'คำบุพบท',
    color: '#ec4899', // pink
    desc: 'ใช้เชื่อมคำนามหรือสรรพนามกับคำอื่นๆ เพื่อบอกสถานที่ เวลา หรือทิศทาง (เช่น in, at, on, by, through)',
    words: [
      { word: 'Throughout', meaning: 'ตลอด(ช่วงเวลา/พื้นที่)', example: 'It rained continuously <span class="grammar-highlight">throughout</span> the entire weekend.' },
      { word: 'Despite', meaning: 'ทั้งๆที่, แม้ว่า', example: '<span class="grammar-highlight">Despite</span> the heavy traffic, we arrived on time.' },
      { word: 'Via', meaning: 'โดยทาง, ผ่านทาง', example: 'You can submit your application <span class="grammar-highlight">via</span> email.' },
      { word: 'Regarding', meaning: 'เกี่ยวกับ', example: 'I have a question <span class="grammar-highlight">regarding</span> your recent email.' },
      { word: 'Beyond', meaning: 'เหนือกว่า, ไกลออกไป', example: 'The results were <span class="grammar-highlight">beyond</span> our expectations.' },
      { word: 'Beneath', meaning: 'อยู่ข้างใต้', example: 'The subway runs <span class="grammar-highlight">beneath</span> the city streets.' },
      { word: 'Within', meaning: 'ภายใน', example: 'Please complete the task <span class="grammar-highlight">within</span> two days.' }
    ],
    challenge: {
      type: 'Preposition',
      sentence: [
        { text: 'The', isTarget: false },
        { text: 'factory', isTarget: false },
        { text: 'was', isTarget: false },
        { text: 'open', isTarget: false },
        { text: 'throughout', isTarget: true },
        { text: 'the', isTarget: false },
        { text: 'night.', isTarget: false }
      ],
      successMsg: 'เก่งมาก! throughout บอกช่วงเวลา',
      errorMsg: 'ผิดจุด! หาคำที่บอกความสัมพันธ์เรื่องเวลาหรือสถานที่'
    }
  },
  {
    id: 'conjunction',
    name: 'Conjunction',
    thai: 'คำสันธาน',
    color: '#f97316', // orange
    desc: 'ใช้เชื่อมคำ วลี หรือประโยคเข้าด้วยกัน (เช่น however, therefore, furthermore) สำคัญสุดๆ ในการสอบ Writing เพื่อบอกความเชื่อมโยง',
    words: [
      { word: 'Furthermore', meaning: 'นอกจากนี้, ยิ่งไปกว่านั้น', example: 'Reading improves vocabulary; <span class="grammar-highlight">furthermore</span>, it enhances writing skills.' },
      { word: 'However', meaning: 'อย่างไรก็ตาม', example: 'The test was difficult; <span class="grammar-highlight">however</span>, most students passed.' },
      { word: 'Consequently', meaning: 'ดังนั้น, ผลก็คือ', example: 'He missed the train and, <span class="grammar-highlight">consequently</span>, was late for work.' },
      { word: 'Moreover', meaning: 'นอกจากนี้', example: 'It is a beautiful city; <span class="grammar-highlight">moreover</span>, it is very safe.' },
      { word: 'Unless', meaning: 'เว้นแต่ว่า', example: 'You cannot enter <span class="grammar-highlight">unless</span> you have a ticket.' },
      { word: 'Whereas', meaning: 'ในขณะที่', example: 'He likes coffee, <span class="grammar-highlight">whereas</span> his sister prefers tea.' },
      { word: 'Therefore', meaning: 'ดังนั้น', example: 'She studied hard; <span class="grammar-highlight">therefore</span>, she passed the test.' }
    ],
    challenge: {
      type: 'Conjunction',
      sentence: [
        { text: 'It', isTarget: false },
        { text: 'rained', isTarget: false },
        { text: 'heavily;', isTarget: false },
        { text: 'however,', isTarget: true },
        { text: 'we', isTarget: false },
        { text: 'went', isTarget: false },
        { text: 'out.', isTarget: false }
      ],
      successMsg: 'ถูกต้อง! however เชื่อมประโยคที่ขัดแย้งกัน',
      errorMsg: 'ลองอีกที! หาคำที่ทำหน้าที่เชื่อมไอเดียของสองประโยค'
    }
  },
  {
    id: 'interjection',
    name: 'Interjection',
    thai: 'คำอุทาน',
    color: '#64748b', // slate
    desc: 'ใช้แสดงอารมณ์ความรู้สึก ไม่ค่อยพบใน Academic IELTS แต่อาจเจอใน Listening (เช่น Oh!, Well, ...)',
    words: [
      { word: 'Well', meaning: 'เอ่อ, อืม (ใช้เริ่มประโยคหรือคิดคำตอบ)', example: '<span class="grammar-highlight">Well</span>, let me think about the best way to explain this.' },
      { word: 'Oh', meaning: 'โอ้ (แสดงความประหลาดใจ)', example: '<span class="grammar-highlight">Oh</span>, I didn\'t realize the deadline was today!' },
      { word: 'Wow', meaning: 'ว้าว (แสดงความชื่นชม/ตกใจ)', example: '<span class="grammar-highlight">Wow</span>! Your presentation was incredibly impressive.' },
      { word: 'Alas', meaning: 'อนิจจา', example: '<span class="grammar-highlight">Alas</span>, the project was cancelled.' },
      { word: 'Indeed', meaning: 'จริงๆแล้ว, อย่างแท้จริง', example: '<span class="grammar-highlight">Indeed</span>, it was a memorable experience!' },
      { word: 'Ah', meaning: 'อ้า, เข้าใจแล้ว', example: '<span class="grammar-highlight">Ah</span>, now I see what you mean.' },
      { word: 'Oops', meaning: 'อุ๊ย (ใช้เมื่อทำผิดพลาด)', example: '<span class="grammar-highlight">Oops</span>, I dropped my pen.' }
    ],
    challenge: {
      type: 'Interjection',
      sentence: [
        { text: 'Wow!', isTarget: true },
        { text: 'That', isTarget: false },
        { text: 'is', isTarget: false },
        { text: 'an', isTarget: false },
        { text: 'excellent', isTarget: false },
        { text: 'score.', isTarget: false }
      ],
      successMsg: 'เยี่ยมเลย! Wow! เป็นคำอุทานแสดงความชื่นชม',
      errorMsg: 'ยังไม่ถูก! หาคำที่แสดงอารมณ์หรือตกใจดูสิ'
    }
  }
];

let hasRenderedGrammar = false;

function renderGrammarView() {
  if (hasRenderedGrammar) return; // Render only once
  hasRenderedGrammar = true;

  const posGrid = document.getElementById('grammar-pos-grid');
  if (!posGrid) return;
  posGrid.innerHTML = '';

  grammarData.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'grammar-item-card';
    if (index === 0) card.classList.add('active'); // default to first

    card.innerHTML = `
      <div>
        <div class="grammar-item-title" style="color: ${item.color}">${item.name}</div>
        <div class="grammar-item-thai">${item.thai}</div>
      </div>
      <svg style="width: 24px; height: 24px; fill: var(--text-secondary);" viewBox="0 0 24 24">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
      </svg>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.grammar-item-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      renderGrammarDetails(item);
    });

    posGrid.appendChild(card);
  });

  // Render details for the first item by default
  renderGrammarDetails(grammarData[0]);
  document.getElementById('grammar-details-panel').style.display = 'flex';
}

function renderGrammarDetails(data) {
  document.getElementById('grammar-detail-title').textContent = `${data.name} (${data.thai})`;

  const badge = document.getElementById('grammar-detail-badge');
  badge.textContent = data.name.toUpperCase();
  badge.style.color = data.color;
  badge.style.borderColor = data.color;
  badge.style.background = `${data.color}22`; // 22 is hex alpha for ~13%

  document.getElementById('grammar-detail-desc').textContent = data.desc;

  const vocabList = document.getElementById('grammar-vocab-list');
  vocabList.innerHTML = '';
  data.words.forEach(wordObj => {
    const el = document.createElement('div');
    el.className = 'grammar-vocab-item';
    el.style.borderLeftColor = data.color;
    el.innerHTML = `
      <div class="grammar-vocab-header">
        <span class="grammar-vocab-word">${wordObj.word}</span>
        <span class="grammar-vocab-meaning">${wordObj.meaning}</span>
      </div>
      ${wordObj.example ? `<div class="grammar-vocab-example">" ${wordObj.example} "</div>` : ''}
    `;
    vocabList.appendChild(el);
  });

  document.getElementById('grammar-challenge-type').textContent = data.name;
  initGrammarChallenge(data.challenge);
}

function initGrammarChallenge(challenge) {
  const container = document.getElementById('grammar-challenge-sentence');
  const feedbackBox = document.getElementById('grammar-challenge-feedback');
  container.innerHTML = '';
  feedbackBox.textContent = '';
  feedbackBox.className = 'challenge-feedback';

  challenge.sentence.forEach(token => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'challenge-word';
    wordSpan.textContent = token.text;

    wordSpan.addEventListener('click', () => {
      // Remove previous feedback classes
      document.querySelectorAll('.challenge-word').forEach(w => {
        w.classList.remove('correct', 'incorrect');
      });

      if (token.isTarget) {
        wordSpan.classList.add('correct');
        feedbackBox.textContent = challenge.successMsg;
        feedbackBox.className = 'challenge-feedback feedback-success';
      } else {
        wordSpan.classList.add('incorrect');
        feedbackBox.textContent = challenge.errorMsg;
        feedbackBox.className = 'challenge-feedback feedback-error';
        setTimeout(() => {
          wordSpan.classList.remove('incorrect');
        }, 1000); // clear after animation
      }
    });

    container.appendChild(wordSpan);
  });
}
