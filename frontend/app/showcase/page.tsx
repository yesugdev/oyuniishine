'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/lib/api'
import StudentCard from '@/components/student/StudentCard'
import type { Student } from '@/types'

const GRADES = ['Бүгд', '1', '2', '3', '4', '5', '6', '7', '8']

export default function ShowcasePage() {
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState('Бүгд')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, grade, page],
    queryFn: () =>
      studentsApi.list({
        ...(search && { search }),
        ...(grade !== 'Бүгд' && { grade }),
        page,
        limit: 9,
      }),
    select: (res) => res.data,
  })

  const students: Student[] = data?.students ?? []
  const total: number = data?.total ?? 0

  return (
    <div className="min-h-screen pt-24" style={{ background: 'linear-gradient(160deg, #fafafa 0%, #f8faff 50%, #fff7ed 100%)' }}>

      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: 80, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: 100, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 99, marginBottom: 16, background: 'linear-gradient(135deg, #fff7ed, #fef3c7)', border: '1.5px solid #fed7aa' }}
          >
            <span>✨</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#ea580c' }}>Манай гайхалтай хүүхдүүд</span>
          </motion.div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1.15, marginBottom: 12 }}>
            Хүүхэд бүр{' '}
            <span style={{ background: 'linear-gradient(135deg, #f97316, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              онцгой
            </span>
          </h1>

          {total > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 16, color: '#64748b', fontWeight: 600 }}
            >
              {total} сурагч — тус бүр өөрийн гэсэн гайхамшигтай
            </motion.p>
          )}
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}
        >
          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#cbd5e1', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              placeholder="Нэрээр хайх..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input-field"
              style={{ paddingLeft: 48, paddingRight: 16, borderRadius: 16, fontSize: 15 }}
            />
          </div>

          {/* Grade filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {GRADES.map((g) => {
              const active = grade === g
              return (
                <motion.button
                  key={g}
                  onClick={() => { setGrade(g); setPage(1) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '8px 18px', borderRadius: 14, fontSize: 13, fontWeight: 800,
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: active ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'white',
                    color: active ? 'white' : '#475569',
                    boxShadow: active ? '0 4px 14px rgba(249,115,22,0.35)' : '0 1px 4px rgba(0,0,0,0.07)',
                    outline: active ? 'none' : '1.5px solid #e2e8f0',
                  }}
                >
                  {g === 'Бүгд' ? '✦ Бүгд' : `${g}-р анги`}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Loading skeleton */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 24, overflow: 'hidden', background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ height: 220, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 16, background: '#f1f5f9', borderRadius: 8, marginBottom: 8, width: '70%' }} />
                  <div style={{ height: 12, background: '#f8fafc', borderRadius: 8, width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && students.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <div style={{ fontSize: 72, marginBottom: 16 }}>
              {search || grade !== 'Бүгд' ? '🔍' : '🌟'}
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#475569', marginBottom: 8 }}>
              {search || grade !== 'Бүгд' ? 'Тохирох сурагч олдсонгүй' : 'Сурагч бүртгэгдээгүй байна'}
            </p>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>
              {search || grade !== 'Бүгд' ? 'Өөр нэрээр эсвэл анги сонгоод үзээрэй' : 'Багш нэвтэрч сурагч нэмнэ үү'}
            </p>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && students.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${search}-${grade}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}
            >
              {students.map((student, i) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <StudentCard
                    student={student}
                    queryKey={['students', search, grade, page]}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48, alignItems: 'center' }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '8px 18px', borderRadius: 14, fontWeight: 700, fontSize: 14, border: '2px solid #e2e8f0', background: 'white', color: page === 1 ? '#cbd5e1' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              ← Өмнөх
            </button>
            {[...Array(data.pages)].map((_: unknown, i: number) => (
              <motion.button
                key={i}
                onClick={() => setPage(i + 1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 40, height: 40, borderRadius: 12, fontWeight: 800, fontSize: 14,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: page === i + 1 ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'white',
                  color: page === i + 1 ? 'white' : '#64748b',
                  boxShadow: page === i + 1 ? '0 4px 12px rgba(249,115,22,0.35)' : '0 1px 4px rgba(0,0,0,0.06)',
                  outline: page === i + 1 ? 'none' : '1.5px solid #e2e8f0',
                }}
              >
                {i + 1}
              </motion.button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              style={{ padding: '8px 18px', borderRadius: 14, fontWeight: 700, fontSize: 14, border: '2px solid #e2e8f0', background: 'white', color: page === data.pages ? '#cbd5e1' : '#374151', cursor: page === data.pages ? 'not-allowed' : 'pointer' }}
            >
              Дараах →
            </button>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
