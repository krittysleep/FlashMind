import { useState, useEffect } from 'react'

function GrammarGuide() {
  const [grammarData, setGrammarData] = useState([])
  const [activeItem, setActiveItem] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [challengeFeedback, setChallengeFeedback] = useState(null)

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

  const handleChallengeClick = (token, challenge) => {
    if (token.isTarget) {
      setChallengeFeedback({ type: 'success', text: challenge.successMsg, tokenId: token.text })
    } else {
      setChallengeFeedback({ type: 'error', text: challenge.errorMsg, tokenId: token.text })
      setTimeout(() => {
        setChallengeFeedback(prev => (prev?.tokenId === token.text ? null : prev))
      }, 1000)
    }
  }

  if (isLoading) return <div id="view-grammar" className="view active"><div style={{padding:'2rem'}}>Loading grammar...</div></div>
  if (error) return <div id="view-grammar" className="view active"><div style={{padding:'2rem', color:'var(--accent-red)'}}>{error}</div></div>

  return (
    <div id="view-grammar" className="view active grammar-layout">
      <div className="grammar-sidebar">
        <h2 style={{marginBottom: '1.5rem'}}>Parts of Speech</h2>
        <div className="grammar-pos-grid">
          {grammarData.map(item => (
            <div 
              key={item.id} 
              className={`grammar-item-card ${activeItem?.id === item.id ? 'active' : ''}`}
              onClick={() => { setActiveItem(item); setActiveTab('overview'); setChallengeFeedback(null); }}
            >
              <div>
                <div className="grammar-item-title" style={{color: item.color}}>{item.name}</div>
                <div className="grammar-item-thai">{item.thai}</div>
              </div>
              <svg style={{width: '24px', height: '24px', fill: 'var(--text-secondary)'}} viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="grammar-content">
        {activeItem && (
          <div className="grammar-details-panel" style={{display: 'flex'}}>
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
              {activeItem.challenge && (
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
                          <div key={note.id} className="grammar-note-item" style={{borderLeftColor: activeItem.color}}>
                            <strong>{note.title}:</strong> <span dangerouslySetInnerHTML={{ __html: note.description }}></span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{color: 'var(--text-secondary)'}}>No additional rules for this category.</div>
                  )}
                </div>
              )}

              {activeTab === 'suffixes' && activeItem.suffixes && activeItem.suffixes.length > 0 && (
                <div className="grammar-section tab-fade-in">
                  <h3>{activeItem.id === 'verb' ? 'Common Verb Suffixes (ปัจจัยบอกคำกริยา)' : 'Common Noun Suffixes (ปัจจัยบอกคำนาม)'}</h3>
                  <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                    {activeItem.id === 'verb' ? 'คำลงท้ายเหล่านี้ทำให้คำอื่นๆ กลายเป็นคำกริยา มักมีความหมายว่า "ทำให้เป็น..."' : 'คำลงท้ายเหล่านี้ช่วยให้รู้ว่าคำนั้นเป็นคำนาม แม้ไม่เคยเห็นมาก่อน!'}
                  </p>
                  <div className="grammar-suffix-grid">
                    {activeItem.suffixes.map(s => (
                      <div key={s.id} className="suffix-card" style={{borderLeftColor: s.color}}>
                        <div className="suffix-tag" style={{background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}66`}}>{s.suffix}</div>
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
                      <div key={wordObj.id} className="grammar-vocab-item" style={{borderLeftColor: activeItem.color}}>
                        <div className="grammar-vocab-header">
                          <span className="grammar-vocab-word">{wordObj.word}</span>
                          <span className="grammar-vocab-meaning">{wordObj.meaning}</span>
                        </div>
                        {wordObj.example && <div className="grammar-vocab-example" dangerouslySetInnerHTML={{ __html: `" ${wordObj.example} "` }}></div>}
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
                      <div key={pattern.id} className="grammar-note-item" style={{borderLeftColor: activeItem.color}}>
                        <strong>{pattern.title}:</strong> 
                        <div style={{marginTop: '0.25rem'}} dangerouslySetInnerHTML={{ __html: pattern.description }}></div>
                        <div className="grammar-note-example"><strong>Example:</strong> <span dangerouslySetInnerHTML={{ __html: pattern.example }}></span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'challenge' && activeItem.challenge && (
                <div className="grammar-section tab-fade-in">
                  <div className="grammar-challenge-box">
                    <div className="challenge-header">
                      <h3>Interactive Challenge</h3>
                      <span className="challenge-badge">Identify the {activeItem.name}</span>
                    </div>
                    <p>Click on the <strong>{activeItem.name}</strong> in the sentence below:</p>
                    
                    <div className="challenge-sentence">
                      {activeItem.challenge.sentence.map((token, i) => {
                        const isError = challengeFeedback?.type === 'error' && challengeFeedback?.tokenId === token.text
                        const isSuccess = challengeFeedback?.type === 'success' && token.isTarget
                        return (
                          <span 
                            key={i} 
                            className={`challenge-word ${isSuccess ? 'correct' : ''} ${isError ? 'incorrect' : ''}`}
                            onClick={() => handleChallengeClick(token, activeItem.challenge)}
                          >
                            {token.text}
                          </span>
                        )
                      })}
                    </div>
                    
                    <div className={`challenge-feedback ${challengeFeedback?.type === 'success' ? 'feedback-success' : ''} ${challengeFeedback?.type === 'error' ? 'feedback-error' : ''}`}>
                      {challengeFeedback?.text}
                    </div>
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
