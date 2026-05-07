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
    <div className="min-h-screen pt-24" style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: '#e0f2fe', color: '#0369a1' }}>
            ✨ Бүх сурагчид
          </span>
          <h1 className="text-4xl lg:text-5xl font-black mb-3" style={{ color: '#0f172a' }}>
            Манай <span style={{
              background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>гайхалтай хүүхдүүд</span>
          </h1>
          {total > 0 && (
            <p className="text-lg" style={{ color: '#64748b' }}>
              {total} сурагч — тус бүр өөрийн гэсэн гайхамшигтай
            </p>
          )}
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#94a3b8' }}>🔍</span>
            <input
              type="text"
              placeholder="Сурагч хайх..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => { setGrade(g); setPage(1) }}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={grade === g
                  ? { background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: 'white', boxShadow: '0 4px 14px rgba(14,165,233,0.35)' }
                  : { background: 'white', color: '#475569', border: '2px solid #e2e8f0' }
                }
              >
                {g === 'Бүгд' ? 'Бүгд' : `${g}-р анги`}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-44 rounded-2xl mb-4" style={{ background: '#e2e8f0' }} />
                <div className="h-5 rounded mb-2 w-3/4" style={{ background: '#e2e8f0' }} />
                <div className="h-4 rounded" style={{ background: '#f1f5f9' }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && students.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-bold" style={{ color: '#64748b' }}>
              {search || grade !== 'Бүгд' ? 'Тохирох сурагч олдсонгүй' : 'Сурагч бүртгэгдээгүй байна'}
            </p>
            <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>
              {search || grade !== 'Бүгд' ? 'Өөр нэрээр хайж үзээрэй' : 'Багш нэвтэрч сурагч нэмнэ үү'}
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && students.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${search}-${grade}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {students.map((student, i) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <StudentCard student={student} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(data.pages)].map((_: unknown, i: number) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-10 h-10 rounded-xl font-bold transition-all"
                style={page === i + 1
                  ? { background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: 'white' }
                  : { background: 'white', color: '#475569', border: '2px solid #e2e8f0' }
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
