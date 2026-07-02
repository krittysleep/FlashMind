function Modals({ 
  isDeleteModalOpen, 
  closeDeleteModal, 
  deckToDelete, 
  handleDeleteDeck,
  isShortcutsModalOpen,
  closeShortcutsModal
}) {
  return (
    <>
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content glass-panel" style={{maxWidth: '400px', textAlign: 'center'}}>
            <svg style={{width: '48px', height: '48px', fill: 'var(--accent-red)', margin: '0 auto 1rem'}} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <h3 style={{marginBottom: '1rem'}}>Delete Deck?</h3>
            <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>
              Are you sure you want to delete <strong>{deckToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
              <button className="btn btn-secondary" onClick={closeDeleteModal}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDeleteDeck(deckToDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {isShortcutsModalOpen && (
        <div className="modal-overlay active" onClick={closeShortcutsModal}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <svg style={{width: '24px', height: '24px', fill: 'currentColor'}} viewBox="0 0 24 24">
                  <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-3 0h2v2H5v-2zm0-3h2v2H5V8zm3 6h8v2H8v-2zm11-3h-2v-2h2v2zm0-3h-2V8h2v2z"/>
                </svg>
                Keyboard Shortcuts
              </h3>
              <button 
                className="btn btn-secondary btn-icon-only" 
                onClick={closeShortcutsModal}
                style={{background: 'transparent', border: 'none'}}
              >
                <svg style={{width: '24px', height: '24px', fill: 'currentColor'}} viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="shortcut-list">
              <div className="shortcut-item">
                <span className="shortcut-desc">Flip Card</span>
                <span className="shortcut-key">Space</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Mark as "Got It"</span>
                <span className="shortcut-key">D</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Mark as "Needs Review"</span>
                <span className="shortcut-key">A</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-desc">Speak text on current side</span>
                <span className="shortcut-key">S</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Modals
