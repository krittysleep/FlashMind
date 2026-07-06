import { useState, useEffect, useRef } from 'react'

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const posMap = {
  'v.':       { name: 'verb',             cls: 'verb' },
  'n.':       { name: 'noun',             cls: 'noun' },
  'adj.':     { name: 'adjective',        cls: 'adjective' },
  'adv.':     { name: 'adverb',           cls: 'adverb' },
  'n./adj.':  { name: 'noun / adj',       cls: 'other' },
  'adj./n.':  { name: 'adj / noun',       cls: 'other' },
  'n./v.':    { name: 'noun / verb',      cls: 'other' },
  'v./n.':    { name: 'verb / noun',      cls: 'other' },
  'adj./adv.':{ name: 'adj / adverb',     cls: 'other' },
  'prep.':    { name: 'preposition',      cls: 'other' },
  'conj.':    { name: 'conjunction',      cls: 'other' },
  'pron.':    { name: 'pronoun',          cls: 'other' },
  'interj.':  { name: 'interjection',     cls: 'other' },
}

function StudyMode({ deck, navigateTo, selectedVoice, availableVoices, studyRandomCard }) {
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [correct, setCorrect] = useState([])
  const [incorrect, setIncorrect] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (deck && deck.cards) {
      setCards(shuffleArray([...deck.cards]))
      setCurrentIndex(0)
      setCorrect([])
      setIncorrect([])
      setIsFlipped(false)
      setShowResults(false)
    }
  }, [deck])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleEvaluate = (isCorrect) => {
    if (isCorrect) setCorrect([...correct, cards[currentIndex]])
    else setIncorrect([...incorrect, cards[currentIndex]])

    if (currentIndex < cards.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
        setIsAnimating(false)
      }, 200)
    } else {
      setShowResults(true)
    }
  }

  const handleTTS = () => {
    const card = cards[currentIndex]
    if (!card) return
    const textToSpeak = isFlipped ? card.back : card.front
    
    // clean text from parenthesized pos
    const cleanText = textToSpeak.replace(/\([^)]+\)/g, '').trim()
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const msg = new SpeechSynthesisUtterance(cleanText)
      if (selectedVoice) {
        const voice = availableVoices.find(v => v.name === selectedVoice)
        if (voice) msg.voice = voice
      }
      window.speechSynthesis.speak(msg)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showResults) return
      if (e.code === 'Space') { e.preventDefault(); handleFlip() }
      if (e.code === 'KeyD') { e.preventDefault(); handleEvaluate(true) }
      if (e.code === 'KeyA') { e.preventDefault(); handleEvaluate(false) }
      if (e.code === 'KeyS') { e.preventDefault(); handleTTS() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, currentIndex, cards, showResults])

  if (!deck || cards.length === 0) return null

  if (showResults) {
    const correctNum = correct.length
    const totalNum = cards.length
    const percentage = Math.round((correctNum / totalNum) * 100)

    return (
      <div id="view-results" className="view active glass-panel">
        <div className="results-header">
          <svg style={{width: '64px', height: '64px', fill: 'var(--accent-green)', marginBottom: '1rem'}} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h2 style={{fontSize: '2rem'}}>Session Complete!</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '0.5rem'}}>Deck: {deck.name}</p>
        </div>
        <div className="results-stats">
          <div className="stat-box success">
            <div className="stat-label">Got It</div>
            <div className="stat-value">{correctNum}</div>
          </div>
          <div className="stat-box danger">
            <div className="stat-label">Needs Review</div>
            <div className="stat-value">{incorrect.length}</div>
          </div>
        </div>
        <div className="results-percentage">{percentage}%</div>
        <div style={{display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center'}}>
          <button className="btn btn-secondary" onClick={() => navigateTo('dashboard')}>Back to Decks</button>
          <button className="btn btn-secondary" onClick={studyRandomCard}>
            <svg style={{width: '18px', height: '18px', fill: 'currentColor'}} viewBox="0 0 24 24">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
            Random Flashcard
          </button>
          <button className="btn btn-primary" onClick={() => {
            setCards(shuffleArray([...deck.cards]))
            setCurrentIndex(0)
            setCorrect([])
            setIncorrect([])
            setIsFlipped(false)
            setShowResults(false)
          }}>Study Again</button>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]
  const progressPercent = (currentIndex / cards.length) * 100

  // format front
  let frontContent = currentCard.front
  const frontMatch = currentCard.front.match(/^(.+?)\s+\(([^)]+)\)$/i)
  if (frontMatch) {
    const word = frontMatch[1].trim()
    const posAbbr = frontMatch[2].trim().toLowerCase()
    const posInfo = posMap[posAbbr] || { name: posAbbr, cls: 'other' }
    frontContent = (
      <>
        <div className="word-display">{word}</div>
        <span className={`pos-badge ${posInfo.cls}`}>{posInfo.name}</span>
      </>
    )
  }

  return (
    <div id="view-study" className="view active">
      <div className="study-header">
        <button className="btn btn-secondary" onClick={() => navigateTo('dashboard')}>
          <svg style={{width: '18px', height: '18px', fill: 'currentColor'}} viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Decks
        </button>
        <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '600px'}}>
          <div className="progress-container">
            <div className="progress-bar" style={{width: `${progressPercent}%`}}></div>
          </div>
          <span className="study-counter">Card {currentIndex + 1} / {cards.length}</span>
        </div>
        <button className="btn btn-secondary btn-icon-only" title="Speak Text (S)" onClick={handleTTS}>
          <svg style={{width: '20px', height: '20px', fill: 'currentColor'}} viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
      </div>

      <div 
        className="study-card-wrapper" 
        tabIndex="0" 
        onClick={handleFlip}
        style={{
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? 'translateY(10px)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
          <div className="card-face card-front">
            <div className="flashcard-indicator">Front Term</div>
            <div className="card-content-text">{frontContent}</div>
            <div className="card-flip-prompt">
              <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm-6 8c0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6z"/></svg>
              Click card or press Space to flip
            </div>
          </div>
          <div className="card-face card-back">
            <div className="flashcard-indicator">Back Definition</div>
            <div className="card-content-text">
              {(() => {
                const parts = currentCard.back.split(/\\n\\n|\n\n/);
                if (parts.length > 1) {
                  return (
                    <div className="card-back-split">
                      <div className="card-back-def" dangerouslySetInnerHTML={{ __html: parts[0].replace(/\\n|\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      <div className="card-back-divider"></div>
                      <div className="card-back-example" dangerouslySetInnerHTML={{ __html: parts.slice(1).join('<br><br>').replace(/\\n|\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  );
                }
                return <div dangerouslySetInnerHTML={{ __html: currentCard.back.replace(/\\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
              })()}
            </div>
            <div className="card-flip-prompt">
              <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm-6 8c0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6z"/></svg>
              Click card or press Space to flip
            </div>
          </div>
        </div>
      </div>

      <div className="study-controls">
        <div className="rating-buttons">
          <button className="btn btn-danger" onClick={() => handleEvaluate(false)}>
            <svg style={{width: '18px', height: '18px', fill: 'currentColor'}} viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Needs Review (A)
          </button>
          <button className="btn btn-success" onClick={() => handleEvaluate(true)}>
            <svg style={{width: '18px', height: '18px', fill: 'currentColor'}} viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Got It (D)
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudyMode
