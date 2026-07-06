import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import StudyMode from './components/StudyMode'
import DeckEditor from './components/DeckEditor'
import GrammarGuide from './components/GrammarGuide'
import Modals from './components/Modals'
import VocabGame from './components/VocabGame'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [decks, setDecks] = useState([])
  const [currentDeck, setCurrentDeck] = useState(null)
  const [editorState, setEditorState] = useState(null)

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deckToDelete, setDeckToDelete] = useState(null)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)

  // Voices for TTS
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')

  useEffect(() => {
    loadDecks()

    // Setup TTS voices
    const synth = window.speechSynthesis
    if (synth) {
      const loadVoices = () => {
        setAvailableVoices(synth.getVoices())
      }
      loadVoices()
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices
      }
    }
  }, [])

  const loadDecks = async () => {
    try {
      const res = await fetch('/api/decks')
      if (res.ok) {
        const data = await res.json()
        setDecks(data)
      } else {
        setDecks([])
      }
    } catch (e) {
      console.error(e)
      setDecks([])
    }
  }

  const handleDeleteDeck = async (id) => {
    try {
      await fetch(`/api/decks/${id}`, { method: 'DELETE' })
      await loadDecks()
      setIsDeleteModalOpen(false)
      setCurrentView('dashboard')
    } catch (e) {
      console.error(e)
    }
  }

  const studyRandomCard = () => {
    const allCards = decks.flatMap(d => d.cards || [])
    if (allCards.length === 0) return

    // Shuffle and pick up to 20 random cards
    const shuffled = [...allCards].sort(() => 0.5 - Math.random())
    const selectedCards = shuffled.slice(0, 20)

    const virtualDeck = {
      id: 'random',
      name: `Random Mix (${selectedCards.length} Cards)`,
      cards: selectedCards,
      color: '#ec4899'
    }

    navigateTo('study', virtualDeck)
  }

  const navigateTo = (view, data = null) => {
    // cancel speech if playing
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    if (view === 'study') {
      setCurrentDeck(data)
    } else if (view === 'editor') {
      setEditorState(data) // null for new deck, deck object for editing
    }
    setCurrentView(view)
  }

  return (
    <>
      <div className="background-glow">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        <div className="glow-orb glow-orb-3"></div>
      </div>

      <Navigation
        currentView={currentView}
        navigateTo={navigateTo}
        availableVoices={availableVoices}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        openShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      <main>
        {currentView === 'dashboard' && (
          <Dashboard
            decks={decks}
            navigateTo={navigateTo}
            openDeleteModal={(deck) => { setDeckToDelete(deck); setIsDeleteModalOpen(true); }}
          />
        )}

        {currentView === 'study' && (
          <StudyMode
            deck={currentDeck}
            navigateTo={navigateTo}
            selectedVoice={selectedVoice}
            availableVoices={availableVoices}
            studyRandomCard={studyRandomCard}
          />
        )}

        {currentView === 'editor' && (
          <DeckEditor
            editorState={editorState}
            navigateTo={navigateTo}
            reloadDecks={loadDecks}
          />
        )}

        {currentView === 'grammar' && (
          <GrammarGuide />
        )}

        {currentView === 'game' && (
          <VocabGame
            decks={decks}
            navigateTo={navigateTo}
          />
        )}
      </main>

      <Modals
        isDeleteModalOpen={isDeleteModalOpen}
        closeDeleteModal={() => setIsDeleteModalOpen(false)}
        deckToDelete={deckToDelete}
        handleDeleteDeck={handleDeleteDeck}
        isShortcutsModalOpen={isShortcutsModalOpen}
        closeShortcutsModal={() => setIsShortcutsModalOpen(false)}
      />
    </>
  )
}

export default App
