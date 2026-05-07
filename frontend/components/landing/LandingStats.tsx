'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / 60
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 20)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const STATS = [
  { icon: '👦', value: 500, suffix: '+', label: 'Сурагч', color: 'from-warm-400 to-warm-600' },
  { icon: '👩‍🏫', value: 48, suffix: '+', label: 'Багш', color: 'from-sky-400 to-sky-600' },
  { icon: '🏫', value: 12, suffix: '', label: 'Анги', color: 'from-mint-400 to-mint-600' },
  { icon: '🏆', value: 1200, suffix: '+', label: 'Амжилт', color: 'from-lavender-400 to-lavender-600' },
]

export default function LandingStats() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 text-center group hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
              <div className="text-4xl font-black text-slate-900 mb-1">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-slate-500 font-semibold text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
