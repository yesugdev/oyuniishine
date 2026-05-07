'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import FloatingParticles from '@/components/ui/FloatingParticles'

export default function LandingCTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-warm-500 via-warm-400 to-lavender-500" />
      <FloatingParticles count={15} useEmoji />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="text-6xl mb-6">🌈</div>
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
            Таны хүүхдийн{' '}
            <span className="text-yellow-300">гайхамшигийг</span>
            <br />
            харуулах цаг болжээ!
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
            Өнөөдөр эхлэх хэрэгтэй. Хүүхдийн амжилт, мөрөөдөл хэзээ ч хоцрогдохгүй.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-warm-600 font-black px-10 py-4 rounded-2xl text-lg hover:bg-warm-50 transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              🚀 Үнэгүй эхлэх
            </Link>
            <Link
              href="/showcase"
              className="border-2 border-white text-white font-bold px-10 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all"
            >
              👀 Жишээ харах
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
