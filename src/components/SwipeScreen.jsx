import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { pets as ALL_PETS } from '../data/pets'
import SwipeCard from './SwipeCard'

// Session ID lives in localStorage — used only to track which device this is,
// not as the source of truth for votes (votes are always fetched from Supabase).
function getOrCreateSessionId() {
  let id = localStorage.getItem('swipevote_session')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('swipevote_session', id)
  }
  return id
}

const SESSION_ID = getOrCreateSessionId()

export default function SwipeScreen({ onDone, onViewResults }) {
  const [queue, setQueue] = useState([])       // remaining unvoted pets
  const [votedCount, setVotedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cardRef = useRef()

  // On mount: fetch this session's existing votes so we skip already-voted pets
  useEffect(() => {
    async function loadProgress() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('votes')
          .select('item_id')
          .eq('session_id', SESSION_ID)

        if (fetchErr) throw fetchErr

        const votedIds = new Set((data || []).map(v => v.item_id))
        setQueue(ALL_PETS.filter(p => !votedIds.has(p.id)))
        setVotedCount(votedIds.size)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadProgress()
  }, [])

  async function handleVote(choice) {
    const pet = queue[0]
    if (!pet) return

    // Optimistic UI: advance card immediately
    const nextQueue = queue.slice(1)
    setQueue(nextQueue)
    setVotedCount(c => c + 1)

    if (nextQueue.length === 0) onDone()

    // Persist to Supabase — upsert prevents duplicate counting
    const { error: upsertErr } = await supabase
      .from('votes')
      .upsert(
        { session_id: SESSION_ID, item_id: pet.id, choice },
        { onConflict: 'session_id,item_id' }
      )

    if (upsertErr) console.error('Vote save failed:', upsertErr.message)
  }

  function handleButtonVote(choice) {
    cardRef.current?.triggerSwipe(choice)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="text-6xl animate-bounce mb-4">🐾</div>
        <p className="text-gray-400 font-medium">Loading pets…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-purple-50 to-pink-50 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-500 font-bold mb-2">Supabase connection error</p>
        <p className="text-gray-500 text-sm mb-1">{error}</p>
        <p className="text-gray-400 text-xs">Check your .env file has valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</p>
      </div>
    )
  }

  if (queue.length === 0 && !loading) {
    onDone()
    return null
  }

  const currentPet = queue[0]
  const nextPet = queue[1]
  const progress = (votedCount / ALL_PETS.length) * 100

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-pink-50 max-w-sm mx-auto overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-2 shrink-0">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">SwipeVote 🐾</h1>
          <p className="text-xs text-gray-400 mt-0.5">{votedCount} of {ALL_PETS.length} voted</p>
        </div>
        <button
          onClick={onViewResults}
          className="text-sm text-purple-600 font-semibold py-1 px-3 rounded-full bg-purple-100 active:bg-purple-200 transition-colors"
        >
          Results →
        </button>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mt-2 mb-3 h-1.5 bg-gray-200 rounded-full shrink-0 overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card stack */}
      <div className="relative flex-1 mx-4 mb-3">
        {/* Next card visible behind current */}
        {nextPet && (
          <div className="absolute inset-x-4 top-3 bottom-0 bg-white rounded-3xl shadow-md" />
        )}
        {currentPet && (
          <SwipeCard
            key={currentPet.id}
            ref={cardRef}
            pet={currentPet}
            onVote={handleVote}
          />
        )}
      </div>

      {/* YES / NO buttons */}
      <div className="flex items-center justify-center gap-10 pb-10 shrink-0">
        <button
          onClick={() => handleButtonVote('no')}
          className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-rose-200 text-rose-500 text-2xl font-black flex items-center justify-center active:scale-90 transition-transform"
          aria-label="No"
        >
          ✕
        </button>
        <button
          onClick={() => handleButtonVote('yes')}
          className="w-20 h-20 rounded-full bg-white shadow-xl border-2 border-emerald-200 text-emerald-500 text-3xl font-black flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Yes"
        >
          ♥
        </button>
      </div>

      {/* Swipe hint — only shown on first card */}
      {votedCount === 0 && (
        <p className="text-center text-xs text-gray-400 pb-4 -mt-6 shrink-0">
          Swipe right = adopt · Swipe left = pass
        </p>
      )}
    </div>
  )
}
