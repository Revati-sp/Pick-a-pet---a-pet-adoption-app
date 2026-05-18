import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { pets } from '../data/pets'

const SORTS = [
  { key: 'loved',    label: '❤️ Most Loved' },
  { key: 'disliked', label: '💔 Most Disliked' },
  { key: 'divisive', label: '⚖️ Most Divisive' },
]

function sortResults(results, sort) {
  return [...results].sort((a, b) => {
    if (sort === 'loved')    return b.yes - a.yes
    if (sort === 'disliked') return b.no - a.no
    if (sort === 'divisive') {
      // Closest to a 50/50 split is most divisive
      const diffA = Math.abs(a.yes - a.no)
      const diffB = Math.abs(b.yes - b.no)
      if (diffA !== diffB) return diffA - diffB
      return b.total - a.total  // tiebreak: more votes = more divisive
    }
    return 0
  })
}

export default function ResultsScreen({ onBack }) {
  const [results, setResults] = useState([])
  const [sort, setSort] = useState('loved')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchVotes() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('votes')
          .select('item_id, choice')

        if (fetchErr) throw fetchErr

        // Tally yes/no per item
        const counts = {}
        for (const { item_id, choice } of data || []) {
          if (!counts[item_id]) counts[item_id] = { yes: 0, no: 0 }
          counts[item_id][choice]++
        }

        const enriched = pets.map(pet => {
          const c = counts[pet.id] || { yes: 0, no: 0 }
          return { ...pet, yes: c.yes, no: c.no, total: c.yes + c.no }
        })

        setResults(enriched)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchVotes()
  }, [])

  const sorted = sortResults(results, sort)

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">

      {/* Sticky header */}
      <div className="sticky top-0 bg-white shadow-sm z-10 px-5 pt-8 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="text-purple-600 font-bold text-sm py-1 px-3 rounded-full bg-purple-50 active:bg-purple-100"
          >
            ← Back
          </button>
          <h1 className="text-xl font-black text-gray-800">Results 🗳️</h1>
        </div>

        {/* Sort buttons */}
        <div className="flex gap-2">
          {SORTS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                sort === opt.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-24">
          <div className="text-5xl animate-bounce">🐾</div>
        </div>
      )}

      {error && (
        <div className="p-8 text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <ul className="px-4 py-4 space-y-3 pb-10">
          {sorted.map((pet, rank) => {
            const yesPercent = pet.total > 0 ? Math.round((pet.yes / pet.total) * 100) : 0
            const noPercent  = 100 - yesPercent

            return (
              <li key={pet.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-gray-300 w-6 shrink-0">
                    #{rank + 1}
                  </span>
                  <img
                    src={pet.image_url}
                    alt={pet.name}
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/44/f3e8ff/7c3aed?text=🐾' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-sm">{pet.name}</p>
                    <p className="text-xs text-gray-400">{pet.total} vote{pet.total !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-emerald-600 font-bold text-sm">{pet.yes} ❤️</p>
                    <p className="text-rose-500 font-bold text-sm">{pet.no} 💔</p>
                  </div>
                </div>

                {/* Yes/No bar */}
                {pet.total > 0 ? (
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="bg-emerald-400 transition-all duration-500"
                      style={{ width: `${yesPercent}%` }}
                    />
                    <div
                      className="bg-rose-400 transition-all duration-500"
                      style={{ width: `${noPercent}%` }}
                    />
                  </div>
                ) : (
                  <div className="h-2 rounded-full bg-gray-100" />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
