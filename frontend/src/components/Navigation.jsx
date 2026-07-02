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
        <div className="logo-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        </div>
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
