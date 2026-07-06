import { useState, useEffect, useRef } from 'react'
import '../game.css'

const generateMask = (word) => {
  if (!word || word.length < 3) return word;
  
  const chars = word.split('');
  let masked = '';
  
  for (let i = 0; i < chars.length; i++) {
    // Always show first, second, and last letter
    if (i === 0 || i === 1 || i === chars.length - 1) {
      masked += chars[i];
    } else if (chars[i] === ' ' || chars[i] === '-') {
      masked += chars[i];
    } else {
      // Show roughly every 3rd character
      if (i % 3 === 0) {
        masked += chars[i];
      } else {
        masked += '_';
      }
    }
  }
  return masked;
}

const VocabGame = ({ decks, navigateTo }) => {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState('start') // start, playing, result
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState(null) // 'correct', 'incorrect'
  
  const inputRef = useRef(null)

  useEffect(() => {
    // Focus input when moving to a new question
    if (gameState === 'playing' && feedback === null && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentIndex, gameState, feedback])

  const startGame = () => {
    // Gather all valid cards (must have an example and a clean word)
    let allValidCards = [];
    
    decks.forEach(deck => {
      if (deck.cards) {
        deck.cards.forEach(card => {
          const cleanWord = card.front.split(' (')[0].trim().split(' / ')[0].trim();
          if (cleanWord.length > 2 && card.back) {
            // Find example
            const backLower = card.back.toLowerCase();
            const hasExample = backLower.includes('example:') || backLower.includes('ielts writing example:');
            if (hasExample) {
              allValidCards.push({ ...card, cleanWord });
            }
          }
        });
      }
    });

    if (allValidCards.length < 5) {
      alert("Not enough vocabulary cards with examples to start the game.");
      return;
    }

    // Shuffle and pick 10
    const shuffled = allValidCards.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    const generatedQuestions = selected.map(card => {
      const cleanWord = card.cleanWord;
      const maskedWord = generateMask(cleanWord);
      
      // Extract example sentence
      let sentence = "No example found.";
      const ieltsMatch = card.back.match(/IELTS Writing Example:\s*(.*)/i);
      const regularMatch = card.back.match(/Example:\s*(.*?)(\n|$)/i);
      
      if (ieltsMatch) {
        sentence = ieltsMatch[1];
      } else if (regularMatch) {
        sentence = regularMatch[1];
      }
      
      // Mask the word in the sentence (case-insensitive)
      const regex = new RegExp(cleanWord, 'gi');
      const blankedSentence = sentence.replace(regex, '________');

      // Extract Thai meaning (usually first line)
      const thaiMeaning = card.back.split('\n')[0].trim();

      return {
        word: cleanWord,
        masked: maskedWord,
        sentence: blankedSentence,
        thai: thaiMeaning
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setGameState('playing');
    setFeedback(null);
    setUserInput('');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || feedback !== null) return;

    const currentQ = questions[currentIndex];
    const isCorrect = userInput.trim().toLowerCase() === currentQ.word.toLowerCase();

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    // Move to next after a delay
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
        setFeedback(null);
        setUserInput('');
      } else {
        setGameState('result');
      }
    }, 2000);
  }

  if (gameState === 'start') {
    return (
      <div className="vocab-game-container">
        <div className="game-card start-card">
          <h1>🎮 Missing Letters Challenge</h1>
          <p>Test your spelling and recall! We will hide some letters from a vocabulary word. Use the Thai meaning and the example sentence to guess the full word.</p>
          <div className="game-stats-preview">
            <div className="stat-pill">10 Questions</div>
            <div className="stat-pill">All Decks</div>
          </div>
          <button className="btn btn-primary start-btn" onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'result') {
    return (
      <div className="vocab-game-container">
        <div className="game-card result-card">
          <h1>Game Over!</h1>
          <div className="final-score-circle">
            <span>{score}</span> / {questions.length}
          </div>
          <p>{score >= 8 ? 'Outstanding! Your vocabulary is top-notch. 🌟' : score >= 5 ? 'Good job! Keep practicing to master these words. 👍' : 'Keep studying! You will get better next time. 💪'}</p>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={startGame}>Play Again</button>
            <button className="btn btn-secondary" onClick={() => navigateTo('dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="vocab-game-container">
      <div className="game-header">
        <span className="question-counter">Question {currentIndex + 1} of {questions.length}</span>
        <span className="score-counter">Score: {score}</span>
      </div>

      <div className={`game-card playing-card ${feedback ? feedback : ''}`}>
        <div className="game-thai-meaning">
          {currentQ.thai}
        </div>
        
        <div className="game-masked-word">
          {feedback === 'incorrect' ? currentQ.word : currentQ.masked}
        </div>

        <div className="game-sentence">
          "{currentQ.sentence}"
        </div>

        <form onSubmit={handleSubmit} className="game-input-form">
          <input 
            type="text" 
            ref={inputRef}
            className="game-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the full word here..."
            disabled={feedback !== null}
            autoComplete="off"
            spellCheck="false"
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!userInput.trim() || feedback !== null}
          >
            Submit
          </button>
        </form>

        {feedback === 'correct' && (
          <div className="feedback-message success-message">
            Correct! 🎉
          </div>
        )}
        
        {feedback === 'incorrect' && (
          <div className="feedback-message error-message">
            Incorrect. The word was <strong>{currentQ.word}</strong>.
          </div>
        )}
      </div>
    </div>
  )
}

export default VocabGame;
