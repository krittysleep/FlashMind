import { useState, useEffect } from 'react'

function GrammarGuide() {
  const [grammarData, setGrammarData] = useState([])
  const [activeItem, setActiveItem] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [challengeFeedback, setChallengeFeedback] = useState({})
  const [typedAnswers, setTypedAnswers] = useState({})

  // Clean up feedback and typed answers when switching categories
  useEffect(() => {
    setChallengeFeedback({})
    setTypedAnswers({})
  }, [activeItem])

  useEffect(() => {
    const fetchGrammar = async () => {
      try {
        const res = await fetch('/api/grammar/full')
        if (!res.ok) throw new Error("Failed to load grammar data")
        const data = await res.json()
        setGrammarData(data)
        if (data.length > 0) setActiveItem(data[0])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGrammar()
  }, [])

  const handleChallengeClick = (token, challenge, chalId = 'default') => {
    if (token.isTarget) {
      setChallengeFeedback(prev => ({ ...prev, [chalId]: { type: 'success', text: challenge.successMsg, tokenId: token.text } }))
    } else {
      const correctWords = challenge.sentence.filter(t => t.isTarget).map(t => t.text).join(' ');
      setChallengeFeedback(prev => ({ ...prev, [chalId]: { type: 'error', text: `${challenge.errorMsg} เฉลย: ${correctWords}`, tokenId: token.text } }))
      setTimeout(() => {
        setChallengeFeedback(prev => ({ ...prev, [chalId]: (prev[chalId]?.tokenId === token.text ? null : prev[chalId]) }))
      }, 3000)
    }
  }

  const checkTypedTranslation = (challenge) => {
    // Basic normalization: lowercase, remove punctuation except spaces
    const normalize = (str) => str.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    const answer = typedAnswers[challenge.id] || '';

    if (normalize(answer) === normalize(challenge.englishSentence)) {
      setChallengeFeedback(prev => ({ ...prev, [challenge.id]: { type: 'success', text: challenge.successMsg } }));
    } else {
      setChallengeFeedback(prev => ({ ...prev, [challenge.id]: { type: 'error', text: `${challenge.errorMsg} เฉลย: ${challenge.englishSentence}` } }));
    }
  }

  const randomizeChallenge = async (indexToReplace) => {
    try {
      let isDifferent = false;
      let attempts = 0;
      let newData;

      const currentSentences = (activeItem.challenges || [activeItem.challenge]).map(c =>
        c.sentenceText || c.englishSentence || c.sentence?.map(s => s.text).join(' ')
      );

      while (!isDifferent && attempts < 10) {
        const res = await fetch(`/api/grammar/${activeItem.id}`);
        if (res.ok) {
          newData = await res.json();
          const newChallenge = newData.challenges ? newData.challenges[indexToReplace] : newData.challenge;
          const newSentence = newChallenge.sentenceText || newChallenge.englishSentence || newChallenge.sentence?.map(s => s.text).join(' ');

          if (!currentSentences.includes(newSentence)) {
            isDifferent = true;
          }
        }
        attempts++;
      }

      if (newData) {
        setActiveItem(prev => {
          const updated = { ...prev };
          if (updated.challenges && newData.challenges) {
            updated.challenges[indexToReplace] = newData.challenges[indexToReplace];
          } else if (newData.challenge) {
            updated.challenge = newData.challenge;
          }
          return updated;
        });

        // Reset feedback and typed answer for this challenge
        const chalId = activeItem.challenges ? activeItem.challenges[indexToReplace].id : activeItem.challenge.id;
        setChallengeFeedback(prev => ({ ...prev, [chalId]: null }));
        setTypedAnswers(prev => ({ ...prev, [chalId]: '' }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (isLoading) return <div id="view-grammar" className="view active"><div style={{ padding: '2rem' }}>Loading grammar...</div></div>
  if (error) return <div id="view-grammar" className="view active"><div style={{ padding: '2rem', color: 'var(--accent-red)' }}>{error}</div></div>

  return (
    <div id="view-grammar" className="view active grammar-layout">
      <div className="grammar-sidebar">
        <h2 style={{ marginBottom: '1.5rem' }}>Grammar Topics</h2>
        <div className="grammar-pos-grid">
          {grammarData.map(item => (
            <div
              key={item.id}
              className={`grammar-item-card ${activeItem?.id === item.id ? 'active' : ''}`}
              onClick={() => { setActiveItem(item); setActiveTab('overview'); setChallengeFeedback(null); }}
            >
              <div>
                <div className="grammar-item-title" style={{ color: item.color }}>{item.name}</div>
                <div className="grammar-item-thai">{item.thai}</div>
              </div>
              <svg style={{ width: '24px', height: '24px', fill: 'var(--text-secondary)' }} viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="grammar-content">
        {activeItem && (
          <div className="grammar-details-panel" style={{ display: 'flex' }}>
            <div className="grammar-detail-header">
              <div>
                <h2>{activeItem.name} ({activeItem.thai})</h2>
                <p className="grammar-detail-desc">{activeItem.description}</p>
              </div>
              <span
                className="grammar-pos-badge"
                style={{
                  color: activeItem.color,
                  borderColor: activeItem.color,
                  background: `${activeItem.color}22`
                }}
              >
                {activeItem.name.toUpperCase()}
              </span>
            </div>

            <div className="grammar-inner-tabs">
              <button
                className={`grammar-inner-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                style={{ borderBottomColor: activeTab === 'overview' ? activeItem.color : 'transparent', color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                Overview & Rules
              </button>
              {activeItem.suffixes && activeItem.suffixes.length > 0 && (
                <button
                  className={`grammar-inner-tab ${activeTab === 'suffixes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('suffixes')}
                  style={{ borderBottomColor: activeTab === 'suffixes' ? activeItem.color : 'transparent', color: activeTab === 'suffixes' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  Suffixes
                </button>
              )}
              {activeItem.words && activeItem.words.length > 0 && (
                <button
                  className={`grammar-inner-tab ${activeTab === 'vocabulary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vocabulary')}
                  style={{ borderBottomColor: activeTab === 'vocabulary' ? activeItem.color : 'transparent', color: activeTab === 'vocabulary' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  Vocabulary
                </button>
              )}
              {activeItem.advancedPatterns && activeItem.advancedPatterns.length > 0 && (
                <button
                  className={`grammar-inner-tab ${activeTab === 'patterns' ? 'active' : ''}`}
                  onClick={() => setActiveTab('patterns')}
                  style={{ borderBottomColor: activeTab === 'patterns' ? activeItem.color : 'transparent', color: activeTab === 'patterns' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  Patterns
                </button>
              )}
              {(activeItem.challenges || activeItem.challenge) && (
                <button
                  className={`grammar-inner-tab ${activeTab === 'challenge' ? 'active' : ''}`}
                  onClick={() => setActiveTab('challenge')}
                  style={{ borderBottomColor: activeTab === 'challenge' ? activeItem.color : 'transparent', color: activeTab === 'challenge' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  Challenge
                </button>
              )}
            </div>

            <div className="grammar-tab-content">
              {activeTab === 'overview' && (
                <div className="grammar-section tab-fade-in">
                  {activeItem.notes && activeItem.notes.length > 0 ? (
                    <>
                      <h3>Key Rules & Types</h3>
                      <div className="grammar-notes-list">
                        {activeItem.notes.map(note => (
                          <div key={note.id} className="grammar-note-item" style={{ borderLeftColor: activeItem.color }}>
                            <strong>{note.title}:</strong> <span dangerouslySetInnerHTML={{ __html: note.description }}></span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-secondary)' }}>No additional rules for this category.</div>
                  )}
                </div>
              )}

              {activeTab === 'suffixes' && activeItem.suffixes && activeItem.suffixes.length > 0 && (
                <div className="grammar-section tab-fade-in">
                  <h3>{activeItem.id === 'verb' ? 'Common Verb Suffixes (ปัจจัยบอกคำกริยา)' : 'Common Noun Suffixes (ปัจจัยบอกคำนาม)'}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {activeItem.id === 'verb' ? 'คำลงท้ายเหล่านี้ทำให้คำอื่นๆ กลายเป็นคำกริยา มักมีความหมายว่า "ทำให้เป็น..."' : 'คำลงท้ายเหล่านี้ช่วยให้รู้ว่าคำนั้นเป็นคำนาม แม้ไม่เคยเห็นมาก่อน!'}
                  </p>
                  <div className="grammar-suffix-grid">
                    {activeItem.suffixes.map(s => (
                      <div key={s.id} className="suffix-card" style={{ borderLeftColor: s.color }}>
                        <div className="suffix-tag" style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}66` }}>{s.suffix}</div>
                        <div className="suffix-meaning">{s.meaning}</div>
                        <div className="suffix-example" dangerouslySetInnerHTML={{ __html: s.example }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'vocabulary' && activeItem.words && activeItem.words.length > 0 && (
                <div className="grammar-section tab-fade-in">
                  <h3>Must-Know {activeItem.name}s for IELTS</h3>
                  <div className="grammar-vocab-list">
                    {activeItem.words.map(wordObj => (
                      <div key={wordObj.id} className="grammar-vocab-item" style={{ borderLeftColor: activeItem.color }}>
                        <div className="grammar-vocab-header">
                          <span className="grammar-vocab-word">{wordObj.word}</span>
                          <span className="grammar-vocab-meaning">{wordObj.meaning}</span>
                        </div>
                        {wordObj.example && <div className="grammar-vocab-example" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: `"${wordObj.example}"` }}></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'patterns' && activeItem.advancedPatterns && activeItem.advancedPatterns.length > 0 && (
                <div className="grammar-section tab-fade-in">
                  <h3>Advanced Patterns</h3>
                  <div className="grammar-notes-list">
                    {activeItem.advancedPatterns.map(pattern => (
                      <div key={pattern.id} className="grammar-note-item" style={{ borderLeftColor: activeItem.color }}>
                        <strong>{pattern.title}:</strong>
                        <div style={{ marginTop: '0.25rem' }} dangerouslySetInnerHTML={{ __html: pattern.description }}></div>
                        <div className="grammar-note-example"><strong>Example:</strong> <span dangerouslySetInnerHTML={{ __html: pattern.example }}></span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'challenge' && (activeItem.challenges || activeItem.challenge) && (
                <div className="grammar-section tab-fade-in">
                  <div className="grammar-challenge-box">
                    {(() => {
                      const challenges = activeItem.challenges || [activeItem.challenge];
                      return challenges.map((challenge, index) => (
                        <div key={challenge.id || index} style={{ marginBottom: index < challenges.length - 1 ? '2.5rem' : '0', paddingBottom: index < challenges.length - 1 ? '2.5rem' : '0', borderBottom: index < challenges.length - 1 ? '1px dashed var(--border-color)' : 'none' }}>
                          <div className="challenge-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <h3 style={{ margin: 0 }}>Interactive Challenge {challenges.length > 1 ? index + 1 : ''}</h3>
                              <span className="challenge-badge">
                                {challenge.type === 'multiple_choice' ? 'Identify the Tense' : challenge.type === 'typed_translation' ? 'Translate to English' : `Identify the ${activeItem.name}`}
                              </span>
                            </div>
                            <button
                              onClick={() => randomizeChallenge(index)}
                              style={{
                                background: 'var(--bg-card-hover)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.9rem'
                              }}
                            >
                              <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                              </svg>
                              Randomize
                            </button>
                          </div>

                          {challenge.type === 'typed_translation' ? (
                            <>
                              <p>Translate this sentence to English:</p>
                              <div className="challenge-sentence" style={{ fontSize: '1.2rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '0.5rem', marginBottom: '1.5rem', borderLeft: `4px solid ${activeItem.color}` }}>
                                "{challenge.thaiSentence}"
                              </div>

                              <input
                                type="text"
                                value={typedAnswers[challenge.id] || ''}
                                onChange={(e) => setTypedAnswers(prev => ({ ...prev, [challenge.id]: e.target.value }))}
                                placeholder="Type the English translation here..."
                                disabled={challengeFeedback[challenge.id]?.type === 'success'}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--text-primary)', marginBottom: '1rem', outline: 'none' }}
                                onKeyDown={(e) => { if (e.key === 'Enter' && typedAnswers[challenge.id]?.trim()) checkTypedTranslation(challenge) }}
                              />

                              <button
                                onClick={() => checkTypedTranslation(challenge)}
                                disabled={challengeFeedback[challenge.id]?.type === 'success' || !typedAnswers[challenge.id]?.trim()}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: (challengeFeedback[challenge.id]?.type === 'success' || !typedAnswers[challenge.id]?.trim()) ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem', opacity: (challengeFeedback[challenge.id]?.type === 'success' || !typedAnswers[challenge.id]?.trim()) ? 0.5 : 1 }}
                              >
                                Check Answer
                              </button>
                            </>
                          ) : challenge.type === 'multiple_choice' ? (
                            <>
                              <p>{challenge.question}</p>
                              <div className="challenge-sentence" style={{ fontSize: '1.2rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '0.5rem', marginBottom: '1.5rem', borderLeft: `4px solid ${activeItem.color}` }}>
                                "{challenge.sentenceText}"
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                {challenge.options.map((option, i) => {
                                  const isSelected = challengeFeedback[challenge.id]?.selectedOption === option;
                                  const isCorrectOption = option === challenge.correctAnswer;

                                  let bg = 'transparent';
                                  let border = '1px solid var(--border-color)';
                                  let color = 'var(--text-primary)';

                                  if (challengeFeedback[challenge.id]) {
                                    if (isSelected && isCorrectOption) {
                                      bg = 'rgba(16, 185, 129, 0.1)';
                                      border = '1px solid var(--accent-green)';
                                      color = 'var(--accent-green)';
                                    } else if (isSelected && !isCorrectOption) {
                                      bg = 'rgba(239, 68, 68, 0.1)';
                                      border = '1px solid var(--accent-red)';
                                      color = 'var(--accent-red)';
                                    } else if (isCorrectOption) {
                                      bg = 'rgba(16, 185, 129, 0.1)';
                                      border = '1px solid var(--accent-green)';
                                      color = 'var(--accent-green)';
                                    }
                                  }

                                  return (
                                    <button
                                      key={i}
                                      style={{
                                        textAlign: 'center',
                                        padding: '0.75rem',
                                        background: bg,
                                        border: border,
                                        color: color,
                                        borderRadius: '0.5rem',
                                        cursor: challengeFeedback[challenge.id]?.type === 'success' ? 'default' : 'pointer',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onClick={() => {
                                        if (challengeFeedback[challenge.id]?.type === 'success') return;
                                        if (option === challenge.correctAnswer) {
                                          setChallengeFeedback(prev => ({ ...prev, [challenge.id]: { type: 'success', text: challenge.successMsg, selectedOption: option } }));
                                        } else {
                                          setChallengeFeedback(prev => ({ ...prev, [challenge.id]: { type: 'error', text: `${challenge.errorMsg} เฉลย: ${challenge.correctAnswer}`, selectedOption: option } }));
                                        }
                                      }}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <>
                              <p>Click on the <strong>{activeItem.name}</strong> in the sentence below:</p>

                              <div className="challenge-sentence">
                                {challenge.sentence?.map((token, i) => {
                                  const chalId = challenge.id || index;
                                  const isError = challengeFeedback[chalId]?.type === 'error' && challengeFeedback[chalId]?.tokenId === token.text;
                                  const isSuccess = challengeFeedback[chalId]?.type === 'success' && token.isTarget;
                                  return (
                                    <span
                                      key={i}
                                      className={`challenge-word ${isSuccess ? 'correct' : ''} ${isError ? 'incorrect' : ''}`}
                                      onClick={() => handleChallengeClick(token, challenge, chalId)}
                                    >
                                      {token.text}
                                    </span>
                                  )
                                })}
                              </div>
                            </>
                          )}

                          <div className={`challenge-feedback ${challengeFeedback[challenge.id || index]?.type === 'success' ? 'feedback-success' : ''} ${challengeFeedback[challenge.id || index]?.type === 'error' ? 'feedback-error' : ''}`} style={{ marginTop: '1rem' }}>
                            {challengeFeedback[challenge.id || index]?.text}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GrammarGuide
