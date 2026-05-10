'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { studentsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { formatDate, ACHIEVEMENT_ICONS, REACTION_ICONS, getInitials } from '@/lib/utils'
import FloatingParticles from '@/components/ui/FloatingParticles'
import Badge from '@/components/ui/Badge'
import ProfilePhotoEditor from '@/components/student/ProfilePhotoEditor'
import type { Student } from '@/types'

// ─── helpers ──────────────────────────────────────────────────────────────────

function Section({ title, emoji, children, action }: {
  title: string; emoji: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} className="card p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <span className="text-3xl">{emoji}</span> {title}
        </h2>
        {action}
      </div>
      {children}
    </motion.div>
  )
}

function ReactionBar({ student, onReact }: { student: Student; onReact: (type: string) => void }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {(['heart', 'star', 'smile', 'clap'] as const).map((type) => {
        const count = student.reactions?.filter((r) => r.type === type).length ?? 0
        return (
          <button key={type} onClick={() => onReact(type)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all font-semibold text-sm hover:scale-105 active:scale-95">
            <span className="text-lg">{REACTION_ICONS[type]}</span>
            {count > 0 && <span style={{ color: '#334155' }}>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

// ─── Edit Profile Modal ────────────────────────────────────────────────────────

function EditProfileModal({ student, onClose, onSave }: {
  student: Student; onClose: () => void; onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [form, setForm] = useState({
    fullName: student.fullName,
    nickname: student.nickname ?? '',
    age: String(student.age),
    grade: student.grade,
    class: student.class,
    intro: student.intro ?? '',
    dreamProfession: student.dreamProfession ?? '',
    favoriteSubject: student.favoriteSubject ?? '',
    favoriteActivity: student.favoriteActivity ?? '',
    whatMakesSpecial: student.whatMakesSpecial ?? '',
    bestMemory: student.bestMemory ?? '',
    teacherComment: student.teacherComment ?? '',
    childMessage: student.childMessage ?? '',
    hobbies: (student.hobbies ?? []).join(', '),
    skills: (student.skills ?? []).join(', '),
    traits: (student.traits ?? []).join(', '),
    isPublic: student.isPublic,
  })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSave({
      ...form,
      age: Number(form.age),
      hobbies: form.hobbies.split(',').map((s) => s.trim()).filter(Boolean),
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      traits: form.traits.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setLoading(false)
  }

  const fields: { id: string; label: string; type?: string; placeholder?: string; textarea?: boolean }[] = [
    { id: 'fullName', label: 'Бүтэн нэр *', placeholder: 'Энхбаяр Дорж' },
    { id: 'nickname', label: 'Хоч нэр', placeholder: 'Энхэ' },
    { id: 'age', label: 'Нас *', type: 'number', placeholder: '8' },
    { id: 'grade', label: 'Анги *', placeholder: '4' },
    { id: 'class', label: 'Ангийн дугаар *', placeholder: '4А' },
    { id: 'dreamProfession', label: 'Мөрөөдлийн мэргэжил', placeholder: 'Инженер...' },
    { id: 'favoriteSubject', label: 'Дуртай хичээл', placeholder: 'Математик...' },
    { id: 'favoriteActivity', label: 'Дуртай үйлдэл', placeholder: 'Зураг зурах...' },
    { id: 'whatMakesSpecial', label: 'Онцгой зүйл', placeholder: '...' },
    { id: 'hobbies', label: 'Хобби (таслалаар тусгаар)', placeholder: 'Хөгжим, Тоглоом' },
    { id: 'skills', label: 'Авьяас чадвар (таслалаар)', placeholder: 'Зураг, Дуу' },
    { id: 'traits', label: 'Зан чанар (таслалаар)', placeholder: 'Найрсаг, Идэвхтэй' },
  ]
  const textareas: { id: string; label: string; placeholder?: string }[] = [
    { id: 'intro', label: 'Танилцуулга', placeholder: 'Сурагчийн тухай...' },
    { id: 'bestMemory', label: 'Сайн дурсамж', placeholder: '...' },
    { id: 'teacherComment', label: 'Багшийн захидал', placeholder: '...' },
    { id: 'childMessage', label: 'Хүүхдийн өөрийн үг', placeholder: '...' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black" style={{ color: '#0f172a' }}>✏️ Мэдээлэл засах</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
            style={{ background: '#f1f5f9', color: '#475569' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.id} className={f.id === 'intro' ? 'col-span-2' : ''}>
                <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>{f.label}</label>
                <input type={f.type ?? 'text'} value={form[f.id as keyof typeof form] as string}
                  onChange={(e) => set(f.id, e.target.value)}
                  placeholder={f.placeholder} required={f.label.includes('*')}
                  className="input-field text-sm py-2.5" />
              </div>
            ))}
          </div>
          {textareas.map((f) => (
            <div key={f.id}>
              <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>{f.label}</label>
              <textarea value={form[f.id as keyof typeof form] as string}
                onChange={(e) => set(f.id, e.target.value)}
                placeholder={f.placeholder} rows={3}
                className="input-field text-sm py-2.5 resize-none" />
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <input type="checkbox" id="isPublicEdit" checked={form.isPublic}
              onChange={(e) => set('isPublic', e.target.checked)} className="w-4 h-4 accent-orange-500" />
            <label htmlFor="isPublicEdit" className="text-sm font-semibold" style={{ color: '#374151' }}>
              Нийтэд нээлттэй профайл
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Болих</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
              {loading ? '⏳ Хадгалж байна...' : '✅ Хадгалах'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Add Achievement Modal ─────────────────────────────────────────────────────

function AddAchievementModal({ onClose, onSave }: {
  onClose: () => void; onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [form, setForm] = useState({ title: '', date: '', type: 'academic', description: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>🏆 Амжилт нэмэх</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
            style={{ background: '#f1f5f9', color: '#475569' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Гарчиг *</label>
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="Математикийн олимпиад 1-р байр" required className="input-field text-sm py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Огноо *</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
              required className="input-field text-sm py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Төрөл *</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className="input-field text-sm py-2.5">
              {[['academic', '📚 Хичээл'], ['sports', '⚽ Спорт'], ['art', '🎨 Урлаг'],
                ['award', '🏅 Шагнал'], ['certificate', '📜 Гэрчилгээ'], ['other', '⭐ Бусад']].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Тайлбар</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Дэлгэрэнгүй мэдээлэл..." rows={3} className="input-field text-sm py-2.5 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Болих</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
              {loading ? '⏳...' : '✅ Нэмэх'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Add Timeline Modal ────────────────────────────────────────────────────────

function AddTimelineModal({ onClose, onSave }: {
  onClose: () => void; onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [form, setForm] = useState({ event: '', date: '', type: 'academic', emoji: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>📅 Тэмдэглэл нэмэх</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
            style={{ background: '#f1f5f9', color: '#475569' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Үйл явдал *</label>
            <input type="text" value={form.event} onChange={(e) => set('event', e.target.value)}
              placeholder="Дүрслэх урлагийн тэмцээнд оролцлоо" required className="input-field text-sm py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Огноо *</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
              required className="input-field text-sm py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Төрөл *</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className="input-field text-sm py-2.5">
              {[['academic', '📚 Хичээл'], ['social', '👫 Нийгмийн'], ['personal', '🌱 Хувийн'],
                ['achievement', '🏆 Амжилт']].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Emoji (заавал биш)</label>
            <input type="text" value={form.emoji} onChange={(e) => set('emoji', e.target.value)}
              placeholder="🎉" className="input-field text-sm py-2.5" maxLength={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Болих</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
              {loading ? '⏳...' : '✅ Нэмэх'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Upload Photo Modal ────────────────────────────────────────────────────────

function UploadPhotoModal({ onClose, onSave }: {
  onClose: () => void; onSave: (fd: FormData) => Promise<void>
}) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setPhoto(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photo) return
    setLoading(true)
    const fd = new FormData()
    fd.append('photo', photo)
    if (caption) fd.append('caption', caption)
    await onSave(fd)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>📸 Зураг нэмэх</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
            style={{ background: '#f1f5f9', color: '#475569' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Зураг сонгох *</label>
            <input type="file" accept="image/*" onChange={handleFile} required className="input-field text-sm py-2.5" />
          </div>
          {preview && (
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Тайлбар</label>
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

// ─── Add Video Modal ──────────────────────────────────────────────────────────

function AddVideoModal({ onClose, onSave }: {
  onClose: () => void; onSave: (data: { url: string; title: string }) => Promise<void>
}) {
  const [form, setForm] = useState({ url: '', title: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>🎬 Бичлэг нэмэх</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
            style={{ background: '#f1f5f9', color: '#475569' }}>✕</button>
        </div>
        <p className="text-sm mb-5 rounded-2xl p-3" style={{ color: '#475569', background: '#f8fafc' }}>
          YouTube, Vimeo болон бусад бичлэгийн холбоосыг оруулна уу.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Бичлэгийн URL *</label>
            <input type="url" value={form.url} onChange={(e) => set('url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..." required className="input-field text-sm py-2.5" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#475569' }}>Гарчиг</label>
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="Математикийн хичээлийн бичлэг..." className="input-field text-sm py-2.5" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Болих</button>
            <button type="submit" disabled={loading || !form.url} className="btn-primary flex-1 justify-center py-3">
              {loading ? '⏳...' : '✅ Нэмэх'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Video embed helper ────────────────────────────────────────────────────────

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // YouTube
    const ytId = u.searchParams.get('v') ||
      (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null) ||
      (u.pathname.startsWith('/shorts/') ? u.pathname.split('/shorts/')[1] : null)
    if (ytId) return `https://www.youtube.com/embed/${ytId}`
    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (id) return `https://player.vimeo.com/video/${id}`
    }
    return null
  } catch { return null }
}

function VideoCard({ video, canEdit, onDelete }: {
  video: { _id: string; url: string; title: string }
  canEdit: boolean
  onDelete: () => void
}) {
  const embed = getEmbedUrl(video.url)
  return (
    <div className="card overflow-hidden group relative">
      {embed ? (
        <div style={{ aspectRatio: '16/9' }}>
          <iframe src={embed} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }} />
        </div>
      ) : (
        <a href={video.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center" style={{ aspectRatio: '16/9', background: '#f1f5f9' }}>
          <div className="text-center p-6">
            <div className="text-4xl mb-2">▶️</div>
            <p className="text-sm font-bold" style={{ color: '#3b82f6' }}>Бичлэг нээх ↗</p>
          </div>
        </a>
      )}
      <div className="p-4">
        {video.title && <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{video.title}</p>}
        <a href={video.url} target="_blank" rel="noopener noreferrer"
          className="text-xs mt-1 block truncate" style={{ color: '#94a3b8' }}>{video.url}</a>
      </div>
      {canEdit && (
        <button onClick={onDelete}
          className="absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(220,38,38,0.9)', color: 'white' }}>✕</button>
      )}
    </div>
  )
}

// ─── Profile Hero ──────────────────────────────────────────────────────────────

function ProfileHero({ student, canEdit, onEdit, onEditPhoto }: {
  student: Student; canEdit: boolean; onEdit: () => void; onEditPhoto: () => void
}) {
  const [avatarHover, setAvatarHover] = useState(false)
  return (
    <div className="relative min-h-[50vh] overflow-hidden flex items-end"
      style={{ background: 'linear-gradient(135deg, #f97316, #8b5cf6)' }}>
      <FloatingParticles count={20} useEmoji />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.2)' }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-32">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Avatar */}
          <div className="relative" style={{ flexShrink: 0 }}>
            <div
              className="w-32 h-32 rounded-3xl border-4 shadow-2xl overflow-hidden flex items-center justify-center"
              style={{ borderColor: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', cursor: canEdit ? 'pointer' : 'default', position: 'relative' }}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={canEdit ? onEditPhoto : undefined}
            >
              {student.profilePhoto ? (
                <Image src={student.profilePhoto} alt={student.fullName} fill className="object-cover" style={{ transition: 'filter 0.2s', filter: canEdit && avatarHover ? 'brightness(0.55)' : 'none' }} />
              ) : (
                <span className="text-4xl font-black text-white">{getInitials(student.fullName)}</span>
              )}
              {canEdit && avatarHover && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, zIndex: 2 }}>
                  <span style={{ fontSize: 26 }}>📷</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'white', textAlign: 'center', lineHeight: 1.3 }}>Зураг засах</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-sm">⭐</div>
          </div>

          {/* Name & info */}
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-1">{student.fullName}</h1>
            {student.nickname && <p className="text-lg font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>"{student.nickname}"</p>}
            <div className="flex flex-wrap gap-2">
              {[
                `📚 ${student.grade}-р анги · ${student.class}`,
                `🎂 ${student.age} настай`,
                ...(student.dreamProfession ? [`🌠 ${student.dreamProfession}`] : []),
              ].map((t) => (
                <span key={t} className="badge" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Edit button for teachers */}
          {canEdit && (
            <button onClick={onEdit} className="btn-secondary flex items-center gap-2 self-start sm:self-end"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
              ✏️ Засах
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type Modal = 'editProfile' | 'addAchievement' | 'addTimeline' | 'uploadPhoto' | 'addVideo' | 'editPhoto' | null
type TabKey = 'profile' | 'gallery' | 'achievements' | 'timeline' | 'videos'

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [modal, setModal] = useState<Modal>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; caption?: string } | null>(null)

  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.byId(id).then((r) => r.data as Student),
  })

  const canEdit = !!(user && (user.role === 'admin' ||
    (user.role === 'teacher' && student && typeof student.teacher === 'object' && student.teacher._id === user._id)))

  const reactMutation = useMutation({
    mutationFn: (type: string) => studentsApi.react(id, type),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', id] }),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => studentsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student', id] }); setModal(null) },
  })

  const uploadPhotoMutation = useMutation({
    mutationFn: (fd: FormData) => studentsApi.uploadPhoto(id, fd),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student', id] }); setModal(null) },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId: string) => studentsApi.deletePhoto(id, photoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', id] }),
  })

  const addVideoMutation = useMutation({
    mutationFn: (data: { url: string; title: string }) => studentsApi.addVideo(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student', id] }); setModal(null) },
  })

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId: string) => studentsApi.deleteVideo(id, videoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', id] }),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce-soft mb-4">⭐</div>
          <p className="font-semibold" style={{ color: '#64748b' }}>Уншиж байна...</p>
        </div>
      </div>
    )
  }

  if (isError || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-xl font-bold" style={{ color: '#64748b' }}>Сурагч олдсонгүй</p>
          <button onClick={() => router.back()} className="mt-4 btn-primary">← Буцах</button>
        </div>
      </div>
    )
  }

  const s = student

  // Achievement helpers
  const saveAchievement = async (data: Record<string, unknown>) => {
    const newList = [...(s.achievements ?? []), data]
    await updateMutation.mutateAsync({ achievements: newList })
  }
  const deleteAchievement = (achId: string) => {
    if (!confirm('Устгах уу?')) return
    updateMutation.mutate({ achievements: s.achievements.filter((a) => a._id !== achId) })
  }

  // Timeline helpers
  const saveTimeline = async (data: Record<string, unknown>) => {
    const newList = [...(s.timeline ?? []), data]
    await updateMutation.mutateAsync({ timeline: newList })
  }
  const deleteTimeline = (evId: string) => {
    if (!confirm('Устгах уу?')) return
    updateMutation.mutate({ timeline: s.timeline.filter((t) => t._id !== evId) })
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)' }}>
      {/* Modals */}
      <AnimatePresence>
        {modal === 'editProfile' && (
          <EditProfileModal student={s} onClose={() => setModal(null)}
            onSave={async (data) => { await updateMutation.mutateAsync(data) }} />
        )}
        {modal === 'addAchievement' && (
          <AddAchievementModal onClose={() => setModal(null)} onSave={saveAchievement} />
        )}
        {modal === 'addTimeline' && (
          <AddTimelineModal onClose={() => setModal(null)} onSave={saveTimeline} />
        )}
        {modal === 'uploadPhoto' && (
          <UploadPhotoModal onClose={() => setModal(null)}
            onSave={async (fd) => { await uploadPhotoMutation.mutateAsync(fd) }} />
        )}
        {modal === 'addVideo' && (
          <AddVideoModal onClose={() => setModal(null)}
            onSave={async (data) => { await addVideoMutation.mutateAsync(data) }} />
        )}
        {modal === 'editPhoto' && (
          <ProfilePhotoEditor
            currentPhoto={s.profilePhoto}
            studentName={s.fullName}
            onClose={() => setModal(null)}
            onSave={async (fd) => {
              await studentsApi.update(id, fd)
              qc.invalidateQueries({ queryKey: ['student', id] })
              setModal(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Photo lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'relative', maxWidth: '56rem', width: '100%' }}>
              <div style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', aspectRatio: '4/3' }}>
                <Image src={lightboxPhoto.url} alt={lightboxPhoto.caption || ''} fill style={{ objectFit: 'contain' }} />
              </div>
              {lightboxPhoto.caption && (
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', borderRadius: '1rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{lightboxPhoto.caption}</p>
                </div>
              )}
              <button onClick={() => setLightboxPhoto(null)}
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <button onClick={() => router.back()}
        className="fixed top-24 left-4 z-40 shadow-lg rounded-2xl px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors"
        style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0', color: '#475569' }}>
        ← Буцах
      </button>

      <ProfileHero student={s} canEdit={canEdit} onEdit={() => setModal('editProfile')} onEditPhoto={() => setModal('editPhoto')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro + reactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-6 -mt-8 relative z-10">
          {s.intro && (
            <p className="text-lg leading-relaxed mb-6 italic" style={{ color: '#334155' }}>
              &ldquo;{s.intro}&rdquo;
            </p>
          )}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <ReactionBar student={s} onReact={(type) => user && reactMutation.mutate(type)} />
            <div className="flex items-center gap-2 text-sm" style={{ color: '#94a3b8' }}>
              <span>👁</span><span>{s.viewCount} хүн үзсэн</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {[
            { key: 'profile', label: '👤 Профайл' },
            { key: 'achievements', label: `🏆 Амжилт ${(s.achievements?.length ?? 0) > 0 ? `(${s.achievements.length})` : ''}` },
            { key: 'gallery', label: `📸 Галерей ${(s.photos?.length ?? 0) > 0 ? `(${s.photos.length})` : ''}` },
            { key: 'videos', label: `🎬 Бичлэг ${(s.videos?.length ?? 0) > 0 ? `(${s.videos.length})` : ''}` },
            { key: 'timeline', label: `📅 Хэлхээ ${(s.timeline?.length ?? 0) > 0 ? `(${s.timeline.length})` : ''}` },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all"
              style={activeTab === tab.key
                ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }
                : { background: 'white', color: '#475569', border: '2px solid #e2e8f0' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Profile tab ── */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <Section title="Зан чанар & Хобби" emoji="🌈">
                {s.hobbies?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold mb-2" style={{ color: '#94a3b8' }}>Хобби</p>
                    <div className="flex flex-wrap gap-2">{s.hobbies.map((h) => <Badge key={h} variant="warm">{h}</Badge>)}</div>
                  </div>
                )}
                {s.skills?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold mb-2" style={{ color: '#94a3b8' }}>Авьяас & Чадвар</p>
                    <div className="flex flex-wrap gap-2">{s.skills.map((sk) => <Badge key={sk} variant="sky">{sk}</Badge>)}</div>
                  </div>
                )}
                {s.traits?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#94a3b8' }}>Зан чанар</p>
                    <div className="flex flex-wrap gap-2">{s.traits.map((t) => <Badge key={t} variant="lavender">{t}</Badge>)}</div>
                  </div>
                )}
                {(s.hobbies?.length ?? 0) === 0 && (s.skills?.length ?? 0) === 0 && (s.traits?.length ?? 0) === 0 && (
                  <p className="text-sm" style={{ color: '#94a3b8' }}>Мэдээлэл байхгүй байна</p>
                )}
              </Section>

              <Section title="Дуртай зүйлс" emoji="💝">
                <div className="space-y-4">
                  {[
                    { label: 'Дуртай хичээл', value: s.favoriteSubject, emoji: '📚' },
                    { label: 'Дуртай үйлдэл', value: s.favoriteActivity, emoji: '🎯' },
                    { label: 'Мөрөөдлийн мэргэжил', value: s.dreamProfession, emoji: '🌠' },
                    { label: 'Онцгой зүйл', value: s.whatMakesSpecial, emoji: '✨' },
                  ].filter((item) => item.value).map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: '#fff7ed' }}>
                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{item.label}</p>
                        <p className="font-bold" style={{ color: '#1e293b' }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                  {!s.favoriteSubject && !s.favoriteActivity && !s.dreamProfession && !s.whatMakesSpecial && (
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Мэдээлэл байхгүй байна</p>
                  )}
                </div>
              </Section>

              {s.teacherComment && (
                <Section title="Багшийн үг" emoji="👩‍🏫">
                  <div className="rounded-2xl p-6 border-l-4" style={{ background: 'linear-gradient(135deg, #f0f9ff, #f5f3ff)', borderColor: '#0ea5e9' }}>
                    <p className="leading-relaxed italic text-lg" style={{ color: '#334155' }}>&ldquo;{s.teacherComment}&rdquo;</p>
                    <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: '#64748b' }}>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: '#e0f2fe' }}>👩‍🏫</span>
                      <span className="font-semibold">{typeof s.teacher === 'object' ? s.teacher.name : 'Багш'}</span>
                    </div>
                  </div>
                </Section>
              )}

              {s.childMessage && (
                <Section title="Хүүхдийн өөрийн үг" emoji="💬">
                  <div className="rounded-2xl p-6 border-l-4 relative" style={{ background: 'linear-gradient(135deg, #f0fdf4, #f0f9ff)', borderColor: '#22c55e' }}>
                    <div className="text-4xl absolute -top-4 left-4">💭</div>
                    <p className="leading-relaxed italic text-lg mt-4" style={{ color: '#334155' }}>&ldquo;{s.childMessage}&rdquo;</p>
                  </div>
                </Section>
              )}

              {s.bestMemory && (
                <Section title="Сайн дурсамж" emoji="🌟">
                  <p style={{ color: '#334155' }} className="leading-relaxed">{s.bestMemory}</p>
                </Section>
              )}
            </motion.div>
          )}

          {/* ── Achievements tab ── */}
          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {canEdit && (
                <div className="flex justify-end mb-6">
                  <button onClick={() => setModal('addAchievement')} className="btn-primary flex items-center gap-2">
                    ➕ Амжилт нэмэх
                  </button>
                </div>
              )}
              {(s.achievements?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {s.achievements.map((ach, i) => (
                    <motion.div key={ach._id}
                      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring', bounce: 0.4 }}
                      className="card p-6 text-center hover:-translate-y-2 relative group">
                      {canEdit && (
                        <button onClick={() => deleteAchievement(ach._id)}
                          className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: '#fee2e2', color: '#dc2626' }}>✕</button>
                      )}
                      <div className="text-5xl mb-4">{ACHIEVEMENT_ICONS[ach.type] || '⭐'}</div>
                      <h3 className="font-black text-lg mb-2" style={{ color: '#0f172a' }}>{ach.title}</h3>
                      {ach.description && <p className="text-sm mb-3" style={{ color: '#64748b' }}>{ach.description}</p>}
                      <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{formatDate(ach.date)}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🏆</div>
                  <p className="font-semibold" style={{ color: '#94a3b8' }}>Амжилт бүртгэгдээгүй байна</p>
                  {canEdit && (
                    <button onClick={() => setModal('addAchievement')} className="mt-4 btn-primary">➕ Нэмэх</button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Gallery tab ── */}
          {activeTab === 'gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {canEdit && (
                <div className="flex justify-end mb-6">
                  <button onClick={() => setModal('uploadPhoto')} className="btn-primary flex items-center gap-2">
                    📸 Зураг нэмэх
                  </button>
                </div>
              )}
              {(s.photos?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {s.photos.map((photo, i) => (
                    <motion.div key={photo._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setLightboxPhoto({ url: photo.url, caption: photo.caption })}
                      className="relative rounded-2xl overflow-hidden group cursor-pointer"
                      style={{ aspectRatio: '1/1' }}>
                      <Image src={photo.url} alt={photo.caption || ''} fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform"
                          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                          <p className="text-white text-xs font-semibold">{photo.caption}</p>
                        </div>
                      )}
                      {canEdit && (
                        <button onClick={(e) => { e.stopPropagation(); if (confirm('Зураг устгах уу?')) deletePhotoMutation.mutate(photo._id) }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'rgba(220,38,38,0.9)', color: 'white' }}>✕</button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📸</div>
                  <p className="font-semibold" style={{ color: '#94a3b8' }}>Зураг байхгүй байна</p>
                  {canEdit && (
                    <button onClick={() => setModal('uploadPhoto')} className="mt-4 btn-primary">📸 Зураг нэмэх</button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Videos tab ── */}
          {activeTab === 'videos' && (
            <motion.div key="videos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {canEdit && (
                <div className="flex justify-end mb-6">
                  <button onClick={() => setModal('addVideo')} className="btn-primary flex items-center gap-2">
                    🎬 Бичлэг нэмэх
                  </button>
                </div>
              )}
              {(s.videos?.length ?? 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {s.videos.map((video) => (
                    <VideoCard key={video._id} video={video} canEdit={canEdit}
                      onDelete={() => { if (confirm('Бичлэг устгах уу?')) deleteVideoMutation.mutate(video._id) }} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🎬</div>
                  <p className="font-semibold" style={{ color: '#94a3b8' }}>Бичлэг байхгүй байна</p>
                  {canEdit && (
                    <button onClick={() => setModal('addVideo')} className="mt-4 btn-primary">🎬 Бичлэг нэмэх</button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Timeline tab ── */}
          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto">
              {canEdit && (
                <div className="flex justify-end mb-6">
                  <button onClick={() => setModal('addTimeline')} className="btn-primary flex items-center gap-2">
                    ➕ Тэмдэглэл нэмэх
                  </button>
                </div>
              )}
              {(s.timeline?.length ?? 0) > 0 ? (
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5"
                    style={{ background: 'linear-gradient(180deg, #f97316, #8b5cf6)' }} />
                  <div className="space-y-6">
                    {[...s.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event, i) => (
                      <motion.div key={event._id}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-6 items-start group">
                        <div className="w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center text-2xl shadow-lg z-10"
                          style={{ background: 'linear-gradient(135deg, #f97316, #8b5cf6)' }}>
                          {event.emoji || '📌'}
                        </div>
                        <div className="flex-1 card p-5 hover:-translate-y-0.5 relative">
                          {canEdit && (
                            <button onClick={() => deleteTimeline(event._id)}
                              className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: '#fee2e2', color: '#dc2626' }}>✕</button>
                          )}
                          <p className="font-black" style={{ color: '#0f172a' }}>{event.event}</p>
                          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{formatDate(event.date)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📅</div>
                  <p className="font-semibold" style={{ color: '#94a3b8' }}>Он цагийн хэлхээ байхгүй</p>
                  {canEdit && (
                    <button onClick={() => setModal('addTimeline')} className="mt-4 btn-primary">➕ Нэмэх</button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
