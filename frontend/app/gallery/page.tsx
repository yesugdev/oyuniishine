'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/lib/api'
import type { Student, Photo } from '@/types'

interface GalleryItem extends Photo {
  studentName: string
  grade: string
}

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)
  const [activeGrade, setActiveGrade] = useState('Бүгд')

  const { data: students, isLoading } = useQuery({
    queryKey: ['gallery-students'],
    queryFn: () => studentsApi.list({ limit: 100 }).then((r) => r.data.students as Student[]),
  })

  // Бүх сурагчдын зургийг нэг жагсаалт болгох
  const allPhotos: GalleryItem[] = (students ?? []).flatMap((s) =>
    (s.photos ?? []).map((p) => ({ ...p, studentName: s.fullName, grade: `${s.grade}-р анги` }))
  )

  const grades = ['Бүгд', ...Array.from(new Set((students ?? []).map((s) => `${s.grade}-р анги`))).sort()]

  const filtered = activeGrade === 'Бүгд'
    ? allPhotos
    : allPhotos.filter((p) => p.grade === activeGrade)

  return (
    <div className="min-h-screen pt-24" style={{ background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: '#ede9fe', color: '#6d28d9' }}>
            📸 Дурсамжийн галерей
          </span>
          <h1 className="text-4xl lg:text-5xl font-black mb-3" style={{ color: '#0f172a' }}>
            Гайхалтай <span style={{
              background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>мөчүүд</span>
          </h1>
          <p style={{ color: '#64748b' }}>Ангийн амьдрал, тэмцээн, дурсамжит үйл явдлууд</p>
        </motion.div>

        {/* Grade filter */}
        {grades.length > 1 && (
          <div className="flex gap-2 flex-wrap justify-center mb-10">
            {grades.map((g) => (
              <button key={g} onClick={() => setActiveGrade(g)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={activeGrade === g
                  ? { background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', boxShadow: '0 4px 14px rgba(139,92,246,0.35)' }
                  : { background: 'white', color: '#475569', border: '2px solid #e2e8f0' }
                }>
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ aspectRatio: '1/1', background: '#e2e8f0' }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-xl font-bold" style={{ color: '#64748b' }}>
              {allPhotos.length === 0 ? 'Зураг байхгүй байна' : 'Энэ ангид зураг байхгүй'}
            </p>
            <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>
              Багш нар сурагчдын зурагийг оруулсны дараа энд харагдана
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((photo, i) => (
                <motion.div key={photo._id} layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setLightbox(photo)}
                  className="relative overflow-hidden rounded-2xl cursor-pointer group"
                  style={{ aspectRatio: i % 5 === 0 ? '1/1.7' : '1/1' }}
                >
                  <Image src={photo.url} alt={photo.caption || photo.studentName} fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {photo.caption && <p className="text-white text-xs font-bold">{photo.caption}</p>}
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{photo.studentName} · {photo.grade}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full">
              <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <Image src={lightbox.url} alt={lightbox.caption || ''} fill className="object-cover" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl p-4"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                {lightbox.caption && <p className="text-white font-bold">{lightbox.caption}</p>}
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {lightbox.studentName} · {lightbox.grade}
                </p>
              </div>
              <button onClick={() => setLightbox(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
