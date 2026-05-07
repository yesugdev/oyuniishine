'use client'

import { motion } from 'framer-motion'
import Avatar from '@/components/ui/Avatar'

const TESTIMONIALS = [
  {
    name: 'Д.Оюунтуяа',
    role: 'Охины ээж',
    text: '"Охиныхоо профайлыг үзэхэд нулимс гарлаа. Багш нь ямар ч үгтэйгээр бичсэн байсан... Үнэхээр баярлалаа!"',
    emoji: '💝',
    color: 'bg-warm-50',
  },
  {
    name: 'Б.Отгонбаяр',
    role: '4-р ангийн багш',
    text: '"Сурагч бүрийг онцгой болгон харуулах боломж надад байсангүй. KidsShine тэр бүхнийг шийдэж өгсөн."',
    emoji: '⭐',
    color: 'bg-sky-50',
  },
  {
    name: 'Г.Болдбаатар',
    role: 'Хүүгийн аав',
    text: '"Хүүгийн timeline-г харахад тэр хир их өсч хөгжснийг мэдлээ. Тэгтэл нь анзаарч чадаагүй юм байна даа."',
    emoji: '🌟',
    color: 'bg-mint-50',
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-warm-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-rose-100 text-rose-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
            💬 Тэдний туршлага
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900">
            Хайрт эцэг эх,{' '}
            <span className="gradient-text">багш нарын дуу хоолой</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`${t.color} rounded-3xl p-8 hover:-translate-y-1 transition-transform duration-300`}
            >
              <div className="text-3xl mb-5">{t.emoji}</div>
              <p className="text-slate-700 leading-relaxed mb-6 text-sm italic">{t.text}</p>
              <div className="flex items-center gap-3">
                <Avatar name={t.name} size="md" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
