function Dashboard({ decks, navigateTo, openDeleteModal }) {
  return (
    <div id="view-dashboard" className="view active">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h2>My Study Decks</h2>
          <p>Select a deck to begin, or create your own custom study deck.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigateTo('editor', null)}>
          <svg style={{width: '18px', height: '18px', fill: 'currentColor'}} viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Create New Deck
        </button>
      </div>

      <div className="decks-grid">
        {decks.length === 0 ? (
          <div className="glass-panel" style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
            <svg style={{width: '48px', height: '48px', fill: 'var(--text-secondary)'}} viewBox="0 0 24 24">
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            <h3>No Decks Found</h3>
            <p style={{color: 'var(--text-secondary)'}}>Create your very first study deck to kickstart your learning!</p>
          </div>
        ) : (
          decks.map(deck => {
            const cardCount = deck.cards ? deck.cards.length : 0;
            const cardsLabel = cardCount === 1 ? '1 card' : `${cardCount} cards`;
            
            return (
              <div key={deck.id} className={`deck-card color-${deck.color || 'green'}`}>
                <div className="deck-info">
                  <div className="deck-card-title">{deck.name}</div>
                  <div className="deck-card-desc">{deck.description || 'No description provided.'}</div>
                </div>
                <div className="deck-meta">
                  <span className="deck-badge">{cardsLabel}</span>
                </div>
                <div className="deck-card-actions">
                  <button 
                    className="btn btn-primary btn-study" 
                    disabled={cardCount === 0}
                    style={cardCount === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    title={cardCount === 0 ? 'Add cards to study' : ''}
                    onClick={() => navigateTo('study', deck)}
                  >
                    Study
                  </button>
                  <button 
                    className="btn btn-secondary btn-edit" 
                    title="Edit Deck"
                    onClick={() => navigateTo('editor', deck)}
                  >
                    <svg style={{width: '16px', height: '16px', fill: 'currentColor'}} viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button 
                    className="btn btn-secondary btn-delete" 
                    title="Delete Deck" 
                    style={{color: 'var(--accent-red)'}}
                    onClick={() => openDeleteModal(deck)}
                  >
                    <svg style={{width: '16px', height: '16px', fill: 'currentColor'}} viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Dashboard
