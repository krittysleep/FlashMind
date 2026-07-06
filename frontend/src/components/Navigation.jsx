function Navigation({ 
  currentView, 
  navigateTo, 
  availableVoices, 
  selectedVoice, 
  setSelectedVoice, 
  openShortcuts 
}) {
  return (
    <header>
      <a 
        href="#" 
        className="logo" 
        onClick={(e) => { e.preventDefault(); navigateTo('dashboard'); }}
      >
        <span className="logo-text">FlashMind</span>
      </a>
      
      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${['dashboard', 'study', 'editor', 'results'].includes(currentView) ? 'active' : ''}`} 
          onClick={() => navigateTo('dashboard')}
        >
          Decks Library
        </button>
        <button 
          className={`nav-tab ${currentView === 'grammar' ? 'active' : ''}`} 
          onClick={() => navigateTo('grammar')}
        >
          Grammar Guide
        </button>
        <button 
          className={`nav-tab ${currentView === 'game' ? 'active' : ''}`} 
          onClick={() => navigateTo('game')}
        >
          <svg style={{width: '18px', height: '18px', fill: 'currentColor'}} viewBox="0 0 24 24">
            <path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.79-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
          </svg>
          Games
        </button>
      </nav>
      
      <div className="header-actions">
        <div className="tts-panel">
          <label htmlFor="voice-select" style={{fontSize: '0.75rem'}}>Voice:</label>
          <select 
            id="voice-select" 
            value={selectedVoice} 
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            <option value="">Default Voice</option>
            {availableVoices.map(v => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang}) {v.default && '[Default]'}
              </option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-secondary btn-icon-only" 
          title="Keyboard Shortcuts"
          onClick={openShortcuts}
        >
          <svg style={{width: '20px', height: '20px', fill: 'currentColor'}} viewBox="0 0 24 24">
            <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-3 0h2v2H5v-2zm0-3h2v2H5V8zm3 6h8v2H8v-2zm11-3h-2v-2h2v2zm0-3h-2V8h2v2z"/>
          </svg>
        </button>
      </div>
    </header>
  )
}

export default Navigation
