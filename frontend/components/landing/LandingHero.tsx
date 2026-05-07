'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import FloatingParticles from '@/components/ui/FloatingParticles'

const FLOATING_CARDS = [
  { emoji: '🏆', label: 'Тэмцээний ялагч', color: 'from-warm-400 to-warm-600', delay: 0 },
  { emoji: '🎨', label: 'Урлагийн авьяастан', color: 'from-lavender-400 to-lavender-600', delay: 0.2 },
  { emoji: '⚽', label: 'Спортын одод', color: 'from-mint-400 to-mint-600', delay: 0.4 },
  { emoji: '📚', label: 'Суралцах дуртай', color: 'from-sky-400 to-sky-600', delay: 0.1 },
]

export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-warm-50 via-white to-lavender-50">
      <FloatingParticles count={20} useEmoji />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-warm-100 text-warm-700 px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              ✨ Монголын шилдэг хүүхдийн платформ
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black text-slate-900 leading-tight mb-6"
            >
              Таны хүүхэд{' '}
              <span className="gradient-text block">онцгой юм!</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-600 leading-relaxed mb-8 max-w-lg"
            >
              Хүүхэд бүрийн авьяас, амжилт, мөрөөдлийг гайхалтай байдлаар харуулах орчин үеийн платформ.
              Багш болон эцэг эхийн хоорондын гүүр.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/showcase" className="btn-primary text-base py-4 px-8">
                🌟 Сурагчдыг үзэх
              </Link>
              <Link href="/register" className="btn-secondary text-base py-4 px-8">
                📝 Бүртгүүлэх
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 mt-10"
            >
              <div className="flex -space-x-2">
                {['🧒', '👧', '👦', '🧒‍♀️', '👶'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-200 to-warm-400 border-2 border-white flex items-center justify-center text-lg"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-slate-800">500+ сурагч</p>
                <p className="text-sm text-slate-500">аль хэдийн нэгдсэн</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Floating cards */}
          <div className="relative hidden lg:block h-96">
            {/* Central circle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-2 border-dashed border-warm-200"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border-2 border-dashed border-lavender-200"
            />

            {/* Center avatar */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-warm-400 to-lavender-500 flex items-center justify-center text-5xl shadow-warm-lg z-10">
              ⭐
            </div>

            {/* Floating achievement cards */}
            {FLOATING_CARDS.map((card, i) => {
              const angles = [0, 90, 180, 270]
              const angle = (angles[i] * Math.PI) / 180
              const r = 155
              const x = Math.cos(angle) * r
              const y = Math.sin(angle) * r

              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                  transition={{
                    opacity: { delay: card.delay + 0.5, duration: 0.4 },
                    scale: { delay: card.delay + 0.5, type: 'spring' },
                    y: { delay: card.delay + 0.5, duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="absolute"
                  style={{
                    top: `calc(50% + ${y}px - 32px)`,
                    left: `calc(50% + ${x}px - 64px)`,
                  }}
                >
                  <div className="card-glass p-3 flex items-center gap-2 whitespace-nowrap shadow-card">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-lg`}>
                      {card.emoji}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{card.label}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 20C1200 60 720 0 0 40L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
