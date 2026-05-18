import { forwardRef, useImperativeHandle } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'

const SWIPE_THRESHOLD = 80

const SwipeCard = forwardRef(function SwipeCard({ pet, onVote }, ref) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-20, 20])
  const yesOpacity = useTransform(x, [20, 100], [0, 1])
  const noOpacity = useTransform(x, [-100, -20], [1, 0])
  const controls = useAnimation()

  // Called by the YES / NO buttons in SwipeScreen via ref
  useImperativeHandle(ref, () => ({
    async triggerSwipe(direction) {
      const targetX = direction === 'yes' ? 700 : -700
      await controls.start({ x: targetX, opacity: 0, transition: { duration: 0.28 } })
      onVote(direction)
    },
  }))

  async function handleDragEnd(_, info) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      await controls.start({ x: 700, opacity: 0, transition: { duration: 0.25 } })
      onVote('yes')
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      await controls.start({ x: -700, opacity: 0, transition: { duration: 0.25 } })
      onVote('no')
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } })
    }
  }

  function handleImgError(e) {
    e.target.onerror = null
    e.target.src = `https://placehold.co/400x500/f3e8ff/7c3aed?text=${encodeURIComponent('🐾')}`
  }

  return (
    <motion.div
      animate={controls}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing touch-none"
    >
      {/* YES badge — appears on right swipe */}
      <motion.div
        style={{ opacity: yesOpacity }}
        className="absolute top-8 left-6 z-20 border-[5px] border-emerald-400 text-emerald-400 font-black text-3xl px-3 py-1 rounded-xl -rotate-12 pointer-events-none select-none"
      >
        ADOPT ✓
      </motion.div>

      {/* NO badge — appears on left swipe */}
      <motion.div
        style={{ opacity: noOpacity }}
        className="absolute top-8 right-6 z-20 border-[5px] border-rose-400 text-rose-400 font-black text-3xl px-3 py-1 rounded-xl rotate-12 pointer-events-none select-none"
      >
        PASS ✕
      </motion.div>

      <img
        src={pet.image_url}
        alt={pet.name}
        className="w-full h-[68%] object-cover"
        draggable={false}
        onError={handleImgError}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4">
        <h2 className="text-2xl font-black text-gray-900 leading-tight">{pet.name}</h2>
        <p className="text-gray-500 text-sm mt-1 leading-snug line-clamp-2">{pet.description}</p>
      </div>
    </motion.div>
  )
})

export default SwipeCard
