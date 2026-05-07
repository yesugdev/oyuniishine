'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    step: '01',
    icon: '👩‍🏫',
    title: 'Багш бүртгэнэ',
    desc: 'Багш нар сурагчийн мэдээлэл, зураг, амжилтыг платформд оруулна.',
    color: 'from-warm-400 to-warm-600',
    bg: 'bg-warm-50',
  },
  {
    step: '02',
    icon: '✨',
    title: 'Профайл бий болно',
    desc: 'Хүүхэд бүрт өөрийн гэсэн гайхалтай профайл хуудас автоматаар үүснэ.',
    color: 'from-lavender-400 to-lavender-600',
    bg: 'bg-lavender-50',
  },
  {
    step: '03',
    icon: '👨‍👩‍👧',
    title: 'Эцэг эх үзнэ',
    desc: 'Эцэг эхчүүд хүүхдийнхээ өсөлт, амжилт, хөгжлийг дурсамжтайгаар харна.',
    color: 'from-mint-400 to-mint-600',
    bg: 'bg-mint-50',
  },
  {
    step: '04',
    icon: '💖',
    title: 'Хайр дүүрэн уулзалт',
    desc: '"Миний хүүхэд үнэхээр онцгой!" гэсэн мэдрэмж эцэг эхэд бий болно.',
    color: 'from-sky-400 to-sky-600',
    bg: 'bg-sky-50',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            🚀 Хэрхэн ажилладаг вэ?
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900">
            4 алхамаар<span className="gradient-text-sky"> эхлэнэ</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`${step.bg} rounded-3xl p-7 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}
            >
              {/* Step number bg */}
              <div className="absolute -top-3 -right-3 text-8xl font-black text-white/30 select-none">
                {step.step}
              </div>

              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform`}
              >
                {step.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
