'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { studentsApi } from '@/lib/api'
import StudentCard from '@/components/student/StudentCard'
import type { Student } from '@/types'


function StatsCard({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="card p-6"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-xl mb-4 shadow-md`}>
        {icon}
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <p className="text-slate-500 text-sm font-semibold">{label}</p>
    </motion.div>
  )
}

function UploadPhotoModal({ studentId, studentName, onClose }: { studentId: string; studentName: string; onClose: () => void }) {
  const qc = useQueryClient()
  const [photo, setPhoto] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setPhoto(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photo) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('photo', photo)
      if (caption) fd.append('caption', caption)
      await studentsApi.uploadPhoto(studentId, fd)
      qc.invalidateQueries({ queryKey: ['my-students'] })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">📸 Зураг нэмэх</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600">✕</button>
        </div>
        <p className="text-sm text-slate-500 mb-5">{studentName}-д зураг нэмэх</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Зураг сонгох *</label>
            <input type="file" accept="image/*" onChange={handleFile} required
              className="input-field text-sm py-2.5" />
          </div>
          {preview && (
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Тайлбар</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)}
              placeholder="Зургийн тайлбар..." className="input-field text-sm py-2.5" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Болих</button>
            <button type="submit" disabled={loading || !photo} className="btn-primary flex-1 justify-center py-3">
              {loading ? '⏳ Байршуулж байна...' : '📤 Нэмэх'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function AddStudentModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    fullName: '', nickname: '', age: '', grade: '', class: '',
    birthday: '', intro: '', dreamProfession: '', isPublic: false,
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      if (photo) fd.append('profilePhoto', photo)
      await studentsApi.create(fd)
      qc.invalidateQueries({ queryKey: ['my-students'] })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900">✨ Сурагч нэмэх</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'fullName', label: 'Бүтэн нэр *', placeholder: 'Жишээ: Энхбаяр Дорж' },
              { id: 'nickname', label: 'Хоч нэр', placeholder: 'Энхэ' },
            ].map((f) => (
              <div key={f.id}>
                <label className="block text-xs font-bold text-slate-600 mb-1">{f.label}</label>
                <input type="text" value={form[f.id as keyof typeof form] as string}
                  onChange={(e) => set(f.id, e.target.value)}
                  placeholder={f.placeholder} required={f.label.includes('*')}
                  className="input-field text-sm py-2.5" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Нас *</label>
              <input type="number" min={3} max={18} value={form.age}
                onChange={(e) => set('age', e.target.value)} required className="input-field text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Анги *</label>
              <input type="text" value={form.grade} onChange={(e) => set('grade', e.target.value)}
                placeholder="4" required className="input-field text-sm py-2.5" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Ангийн дугаар *</label>
              <input type="text" value={form.class} onChange={(e) => set('class', e.target.value)}
                placeholder="4А" required className="input-field text-sm py-2.5" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Төрсөн өдөр *</label>
            <input type="date" value={form.birthday} onChange={(e) => set('birthday', e.target.value)}
              required className="input-field text-sm py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Танилцуулга</label>
            <textarea value={form.intro} onChange={(e) => set('intro', e.target.value)}
              placeholder="Сурагчийн тухай товч танилцуулга..." rows={3}
              className="input-field text-sm py-2.5 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Мөрөөдлийн мэргэжил</label>
            <input type="text" value={form.dreamProfession}
              onChange={(e) => set('dreamProfession', e.target.value)}
              placeholder="Инженер, Эмч, Уран зураач..." className="input-field text-sm py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Профайл зураг</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="input-field text-sm py-2.5" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPublic" checked={form.isPublic}
              onChange={(e) => set('isPublic', e.target.checked)} className="w-4 h-4 accent-warm-500" />
            <label htmlFor="isPublic" className="text-sm font-semibold text-slate-700">
              Нийтэд нээлттэй профайл
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Болих</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
              {loading ? '⏳ Хадгалж байна...' : '✅ Нэмэх'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function TeacherDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [photoTarget, setPhotoTarget] = useState<{ id: string; name: string } | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/login'); return }
    if (user.role === 'parent') router.replace('/showcase')
  }, [user, loading, router])

  const { data: students, isLoading } = useQuery({
    queryKey: ['my-students'],
    queryFn: () => studentsApi.myStudents().then((r) => r.data as Student[]),
  })

  const qc = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-students'] }),
  })

  const allStudents: Student[] = students ?? []
  const filtered = allStudents.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase())
  )
  const publicCount = allStudents.filter((s) => s.isPublic).length
  const totalReactions = allStudents.reduce((acc, s) => acc + (s.reactions?.length ?? 0), 0)
  const totalViews = allStudents.reduce((acc, s) => acc + (s.viewCount ?? 0), 0)

  if (loading || !user || user.role === 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl animate-bounce-soft">⭐</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white pt-24">
      <AnimatePresence>{showModal && <AddStudentModal onClose={() => setShowModal(false)} />}</AnimatePresence>
      <AnimatePresence>{photoTarget && <UploadPhotoModal studentId={photoTarget.id} studentName={photoTarget.name} onClose={() => setPhotoTarget(null)} />}</AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10 flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Сайн байна уу, <span className="gradient-text">{user?.name ?? 'Багш'}! 👋</span>
            </h1>
            <p className="text-slate-500 mt-1">Таны ангийн сурагчид</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(true)} className="btn-primary">
              ➕ Сурагч нэмэх
            </button>
            <button onClick={logout} className="btn-secondary py-2 px-4 text-sm">
              Гарах
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatsCard icon="👦" value={allStudents.length} label="Нийт сурагч" color="from-warm-400 to-warm-600" />
          <StatsCard icon="🌍" value={publicCount} label="Нийтэд нээлттэй" color="from-sky-400 to-sky-600" />
          <StatsCard icon="❤️" value={totalReactions} label="Нийт хариу үйлдэл" color="from-rose-400 to-rose-500" />
          <StatsCard icon="👁" value={totalViews} label="Нийт үзэлт" color="from-lavender-400 to-lavender-600" />
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input type="text" placeholder="Сурагч хайх..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12" />
        </div>

        {/* Students grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-40 bg-slate-200 rounded-2xl mb-4" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((student, i) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="relative group"
              >
                <StudentCard student={student} />
                {/* Action overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      if (confirm(`"${student.fullName}"-г устгах уу?`)) {
                        deleteMutation.mutate(student._id)
                      }
                    }}
                    className="w-8 h-8 rounded-xl shadow-md flex items-center justify-center text-sm"
                    style={{ background: '#ef4444', color: 'white' }}
                  >
                    🗑
                  </button>
                </div>
                {/* Public/private badge */}
                <div className="absolute top-14 right-3">
                  <span className={`badge text-xs ${student.isPublic ? 'bg-mint-100 text-mint-700' : 'bg-slate-100 text-slate-500'}`}>
                    {student.isPublic ? '🌍 Нийтэд' : '🔒 Хаалттай'}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Add card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="card p-8 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 hover:border-warm-300 hover:bg-warm-50 transition-all cursor-pointer min-h-[280px]"
            >
              <div className="w-16 h-16 rounded-3xl bg-warm-100 flex items-center justify-center text-3xl">
                ➕
              </div>
              <p className="font-bold text-slate-500">Шинэ сурагч нэмэх</p>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
