import { useState } from 'react'
import SwipeScreen from './components/SwipeScreen'
import ResultsScreen from './components/ResultsScreen'

export default function App() {
  const [screen, setScreen] = useState('swipe') // 'swipe' | 'done' | 'results'

  if (screen === 'results') {
    return <ResultsScreen onBack={() => setScreen('swipe')} />
  }

  if (screen === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-8 text-center">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-3xl font-black text-gray-800 mb-3">
          You voted on all 100 pets!
        </h1>
        <p className="text-gray-500 mb-10 text-base leading-relaxed">
          Thank you for helping find these animals a forever home.
          Your votes are saved — check out the results!
        </p>
        <button
          onClick={() => setScreen('results')}
          className="bg-purple-600 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          See Results →
        </button>
      </div>
    )
  }

  return (
    <SwipeScreen
      onDone={() => setScreen('done')}
      onViewResults={() => setScreen('results')}
    />
  )
}
