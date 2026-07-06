import { useState, useEffect } from 'react'

function DeckEditor({ editorState, navigateTo, reloadDecks }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('green')
  const [cards, setCards] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  const colors = ['purple', 'blue', 'orange', 'pink', 'cyan', 'green', 'red']

  useEffect(() => {
    if (editorState) {
      setName(editorState.name || '')
      setDescription(editorState.description || '')
      setColor(editorState.color || 'green')
      setCards(editorState.cards ? [...editorState.cards] : [])
    } else {
      setName('')
      setDescription('')
      setColor('green')
      setCards([
        { id: Math.random().toString(), front: '', back: '' },
        { id: Math.random().toString(), front: '', back: '' }
      ])
    }
  }, [editorState])

  const handleAddCard = () => {
    setCards([...cards, { id: Math.random().toString(), front: '', back: '' }])
  }

  const handleDeleteCard = (index) => {
    const newCards = [...cards]
    newCards.splice(index, 1)
    setCards(newCards)
  }

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards]
    newCards[index][field] = value
    setCards(newCards)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a deck name.")
      return
    }

    const validCards = cards.filter(c => c.front.trim() && c.back.trim())
    if (validCards.length === 0) {
      alert("Please add at least one complete card (front and back).")
      return
    }

    setIsSaving(true)
    const payload = {
      name: name.trim(),
      description: description.trim(),
      color,
      cards: validCards.map(c => ({ front: c.front.trim(), back: c.back.trim() }))
    }

    try {
      const url = editorState?.id ? `/api/decks/${editorState.id}` : '/api/decks'
      const method = editorState?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        await reloadDecks()
        navigateTo('dashboard')
      } else {
        alert("Failed to save deck")
      }
    } catch (e) {
      console.error(e)
      alert("Failed to save deck")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div id="view-editor" className="view active glass-panel">
      <div className="editor-header">
        <h2>{editorState ? "Edit Study Deck" : "Create Study Deck"}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Customize your deck properties and manage cards.</p>
      </div>

      <div className="form-group">
        <div className="form-row">
          <div className="form-group">
            <label>Deck Name</label>
            <input
              type="text"
              placeholder="e.g. Italian Vocabulary Basics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ maxWidth: '200px' }}>
            <label>Theme Color</label>
            <div className="color-picker">
              {colors.map(c => (
                <div
                  key={c}
                  className={`color-option color-${c} ${color === c ? 'selected' : ''}`}
                  onClick={() => setColor(c)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Description (Optional)</label>
          <input
            type="text"
            placeholder="A brief description of what this deck covers..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="editor-cards-header">
        <h3>Flashcards (<span id="editor-card-count">{cards.length}</span>)</h3>
        <button className="btn btn-secondary" onClick={handleAddCard}>
          <svg style={{ width: '18px', height: '18px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Card
        </button>
      </div>

      <div className="editor-cards-list">
        {cards.map((card, index) => (
          <div key={card.id} className="editor-card-item">
            <div className="card-num">{index + 1}</div>
            <div className="card-fields">
              <div className="form-group">
                <label>Front Term</label>
                <input
                  type="text"
                  className="input-front"
                  placeholder="Question or term..."
                  value={card.front}
                  onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Back Definition</label>
                <input
                  type="text"
                  className="input-back"
                  placeholder="Answer or explanation..."
                  value={card.back}
                  onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-danger btn-icon-only"
              title="Delete Card"
              style={{ flexShrink: 0 }}
              onClick={() => handleDeleteCard(index)}
            >
              <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={() => navigateTo('dashboard')}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          <svg style={{ width: '18px', height: '18px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
          </svg>
          {isSaving ? "Saving..." : "Save Deck"}
        </button>
      </div>
    </div>
  )
}

export default DeckEditor
