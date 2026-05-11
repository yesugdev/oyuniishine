'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentsApi } from '@/lib/api'
import type { Grade } from '@/types'

// ── Constants ──────────────────────────────────────────────────────────────────

const TERMS = ['1-р улирал','2-р улирал','3-р улирал','4-р улирал','Жилийн эцэст'] as const

const SUBJECTS = [
  'Математик','Монгол хэл','Монгол уран зохиол','Байгаль орчин',
  'Нийгмийн ухаан','Англи хэл','Хүмүүжил','Биеийн тамир',
  'Дүрслэх урлаг','Хөгжим','Технологи','Түүх','Газарзүй',
  'Физик','Хими','Биологи','Мэдээлэл зүй',
]

const TERM_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  '1-р улирал':    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  '2-р улирал':    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  '3-р улирал':    { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  '4-р улирал':    { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
  'Жилийн эцэст': { bg: '#fef9c3', color: '#854d0e', border: '#fde68a' },
}

function letterGrade(score: number): { letter: string; bg: string; color: string } {
  if (score >= 90) return { letter: 'А',  bg: '#dcfce7', color: '#15803d' }
  if (score >= 75) return { letter: 'В',  bg: '#dbeafe', color: '#1d4ed8' }
  if (score >= 60) return { letter: 'С',  bg: '#fef9c3', color: '#854d0e' }
  if (score >= 40) return { letter: 'D',  bg: '#ffedd5', color: '#c2410c' }
  return                   { letter: 'F',  bg: '#fee2e2', color: '#b91c1c' }
}

function scoreColor(score: number): string {
  if (score >= 90) return '#15803d'
  if (score >= 75) return '#1d4ed8'
  if (score >= 60) return '#854d0e'
  if (score >= 40) return '#c2410c'
  return '#b91c1c'
}

// ── Add/Edit Grade Modal ───────────────────────────────────────────────────────

function GradeModal({ initial, onClose, onSave }: {
  initial?: Grade
  onClose: () => void
  onSave: (data: { subject: string; score: number; term: string; comment?: string }) => Promise<void>
}) {
  const [form, setForm] = useState({
    subject: initial?.subject ?? SUBJECTS[0],
    customSubject: '',
    score: initial?.score?.toString() ?? '',
    term: initial?.term ?? TERMS[0],
    comment: initial?.comment ?? '',
  })
  const [useCustom, setUseCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const scoreNum = Number(form.score)
  const lg = form.score !== '' && !isNaN(scoreNum) ? letterGrade(scoreNum) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.score || isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) return
    setLoading(true)
    const subject = useCustom ? form.customSubject.trim() : form.subject
    await onSave({ subject, score: scoreNum, term: form.term, comment: form.comment || undefined })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">

        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontSize:20, fontWeight:900, color:'#0f172a' }}>
            {initial ? '✏️ Дүн засах' : '📝 Дүн нэмэх'}
          </h2>
          <button onClick={onClose}
            style={{ width:36, height:36, borderRadius:12, background:'#f1f5f9', border:'none', cursor:'pointer', fontWeight:700, color:'#64748b' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Subject */}
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', marginBottom:6 }}>
              Хичээл *
            </label>
            {!useCustom ? (
              <select value={form.subject} onChange={e => set('subject', e.target.value)}
                className="input-field" style={{ fontSize:14 }}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input type="text" value={form.customSubject} onChange={e => set('customSubject', e.target.value)}
                placeholder="Хичээлийн нэр..." required className="input-field" style={{ fontSize:14 }} />
            )}
            <button type="button" onClick={() => setUseCustom(v => !v)}
              style={{ marginTop:6, fontSize:12, fontWeight:700, color:'#f97316', background:'none', border:'none', cursor:'pointer', padding:0 }}>
              {useCustom ? '← Жагсаалтаас сонгох' : '+ Өөр хичээл нэмэх'}
            </button>
          </div>

          {/* Term */}
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', marginBottom:6 }}>
              Улирал *
            </label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {TERMS.map(t => {
                const tc = TERM_COLORS[t]
                const active = form.term === t
                return (
                  <button key={t} type="button" onClick={() => set('term', t)}
                    style={{ padding:'6px 12px', borderRadius:10, fontSize:12, fontWeight:800, cursor:'pointer', border: active ? `2px solid ${tc.color}` : '2px solid #e2e8f0',
                      background: active ? tc.bg : 'white', color: active ? tc.color : '#64748b', transition:'all 0.15s' }}>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Score */}
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', marginBottom:6 }}>
              Оноо (0–100) *
            </label>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <input type="number" min={0} max={100} value={form.score}
                onChange={e => set('score', e.target.value)}
                placeholder="85" required className="input-field" style={{ fontSize:16, fontWeight:800, flex:1 }} />
              {lg && (
                <div style={{ width:52, height:52, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center',
                  background:lg.bg, flexShrink:0 }}>
                  <span style={{ fontSize:20, fontWeight:900, color:lg.color }}>{lg.letter}</span>
                </div>
              )}
            </div>
            {/* Score bar */}
            {form.score !== '' && !isNaN(scoreNum) && (
              <div style={{ marginTop:8, height:6, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(100, scoreNum)}%` }}
                  style={{ height:'100%', borderRadius:99, background:`linear-gradient(90deg, ${scoreColor(scoreNum)}, ${scoreColor(scoreNum)}88)` }} />
              </div>
            )}
          </div>

          {/* Comment */}
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', marginBottom:6 }}>
              Тайлбар (заавал биш)
            </label>
            <textarea value={form.comment} onChange={e => set('comment', e.target.value)}
              placeholder="Сайжрах хэрэгтэй, ахиц гарсан..." rows={2}
              className="input-field" style={{ fontSize:13, resize:'none' }} />
          </div>

          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <button type="button" onClick={onClose}
              style={{ flex:1, padding:'11px', borderRadius:14, fontWeight:700, fontSize:14, border:'2px solid #e2e8f0', background:'white', color:'#374151', cursor:'pointer' }}>
              Болих
            </button>
            <button type="submit" disabled={loading}
              style={{ flex:1, padding:'11px', borderRadius:14, fontWeight:800, fontSize:14, border:'none', cursor:loading?'not-allowed':'pointer',
                background:'linear-gradient(135deg, #f97316, #ea580c)', color:'white', opacity:loading?0.7:1,
                boxShadow:'0 4px 12px rgba(249,115,22,0.3)' }}>
              {loading ? '⏳ Хадгалж байна...' : '✅ Хадгалах'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Subject Summary Card ───────────────────────────────────────────────────────

function SubjectCard({ subject, grades, canEdit, onEdit, onDelete }: {
  subject: string
  grades: Grade[]
  canEdit: boolean
  onEdit: (g: Grade) => void
  onDelete: (id: string) => void
}) {
  const avg = Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length)
  const lg = letterGrade(avg)
  const [open, setOpen] = useState(false)

  return (
    <motion.div layout initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      style={{ background:'white', borderRadius:18, border:'1.5px solid #f1f5f9',
        boxShadow:'0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden' }}>

      {/* Header */}
      <div onClick={() => setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', cursor:'pointer',
          background: open ? '#fafafa' : 'white', transition:'background 0.15s' }}>

        {/* Letter grade circle */}
        <div style={{ width:48, height:48, borderRadius:14, display:'flex', alignItems:'center',
          justifyContent:'center', background:lg.bg, flexShrink:0 }}>
          <span style={{ fontSize:20, fontWeight:900, color:lg.color }}>{lg.letter}</span>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:800, color:'#0f172a', fontSize:15, marginBottom:2 }}>{subject}</p>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#64748b' }}>{grades.length} дүн</span>
            <span style={{ fontSize:12, color:'#cbd5e1' }}>·</span>
            <span style={{ fontSize:13, fontWeight:900, color:scoreColor(avg) }}>{avg} оноо</span>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ width:80, flexShrink:0 }}>
          <div style={{ height:6, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${avg}%`, borderRadius:99,
              background:`linear-gradient(90deg, ${scoreColor(avg)}, ${scoreColor(avg)}99)`,
              transition:'width 0.6s ease' }} />
          </div>
          <p style={{ fontSize:11, fontWeight:700, color:scoreColor(avg), textAlign:'right', marginTop:3 }}>{avg}%</p>
        </div>

        <span style={{ color:'#94a3b8', fontSize:14, transition:'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>

      {/* Expanded rows */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} style={{ overflow:'hidden' }}>
            <div style={{ borderTop:'1px solid #f1f5f9' }}>
              {grades.map((g) => {
                const gl = letterGrade(g.score)
                const tc = TERM_COLORS[g.term] ?? TERM_COLORS['1-р улирал']
                return (
                  <div key={g._id}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px',
                      borderBottom:'1px solid #f8fafc', transition:'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background='#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.background='transparent')}>

                    {/* Term badge */}
                    <span style={{ fontSize:11, fontWeight:800, padding:'3px 9px', borderRadius:20,
                      background:tc.bg, color:tc.color, border:`1px solid ${tc.border}`, flexShrink:0, whiteSpace:'nowrap' }}>
                      {g.term}
                    </span>

                    {/* Score + letter */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
                      <span style={{ fontSize:18, fontWeight:900, color:scoreColor(g.score) }}>{g.score}</span>
                      <span style={{ fontSize:11, fontWeight:800, padding:'2px 7px', borderRadius:8,
                        background:gl.bg, color:gl.color }}>{gl.letter}</span>
                    </div>

                    {/* Comment */}
                    {g.comment && (
                      <span style={{ fontSize:12, color:'#94a3b8', fontStyle:'italic', flex:2,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {g.comment}
                      </span>
                    )}

                    {/* Edit/delete */}
                    {canEdit && (
                      <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                        <button onClick={() => onEdit(g)}
                          style={{ width:28, height:28, borderRadius:8, border:'none', cursor:'pointer',
                            background:'#f1f5f9', color:'#475569', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          ✏️
                        </button>
                        <button onClick={() => onDelete(g._id)}
                          style={{ width:28, height:28, borderRadius:8, border:'none', cursor:'pointer',
                            background:'#fee2e2', color:'#dc2626', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main GradesTab ─────────────────────────────────────────────────────────────

export default function GradesTab({ grades, canEdit, studentId }: {
  grades: Grade[]
  canEdit: boolean
  studentId: string
}) {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ mode: 'add' } | { mode: 'edit'; grade: Grade } | null>(null)
  const [filterTerm, setFilterTerm] = useState<string>('Бүгд')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['student', studentId] })

  const addMutation = useMutation({
    mutationFn: (data: Parameters<typeof studentsApi.addGrade>[1]) => studentsApi.addGrade(studentId, data),
    onSuccess: () => { invalidate(); setModal(null) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ gradeId, data }: { gradeId: string; data: Parameters<typeof studentsApi.updateGrade>[2] }) =>
      studentsApi.updateGrade(studentId, gradeId, data),
    onSuccess: () => { invalidate(); setModal(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (gradeId: string) => studentsApi.deleteGrade(studentId, gradeId),
    onSuccess: invalidate,
  })

  const handleDelete = (gradeId: string) => {
    if (!confirm('Энэ дүнг устгах уу?')) return
    deleteMutation.mutate(gradeId)
  }

  // Filter by term
  const filtered = filterTerm === 'Бүгд' ? grades : grades.filter(g => g.term === filterTerm)

  // Group by subject
  const bySubject = filtered.reduce<Record<string, Grade[]>>((acc, g) => {
    if (!acc[g.subject]) acc[g.subject] = []
    acc[g.subject].push(g)
    return acc
  }, {})

  // Overall stats
  const overall = grades.length ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : null
  const overallLg = overall !== null ? letterGrade(overall) : null

  return (
    <div>
      <AnimatePresence>
        {modal?.mode === 'add' && (
          <GradeModal onClose={() => setModal(null)}
            onSave={async (data) => { await addMutation.mutateAsync(data) }} />
        )}
        {modal?.mode === 'edit' && (
          <GradeModal initial={modal.grade} onClose={() => setModal(null)}
            onSave={async (data) => { await updateMutation.mutateAsync({ gradeId: modal.grade._id, data }) }} />
        )}
      </AnimatePresence>

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {overallLg && overall !== null && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderRadius:16,
              background:overallLg.bg, border:`1.5px solid ${overallLg.color}33` }}>
              <span style={{ fontSize:24, fontWeight:900, color:overallLg.color }}>{overallLg.letter}</span>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:'#64748b', margin:0 }}>Дундаж</p>
                <p style={{ fontSize:18, fontWeight:900, color:overallLg.color, margin:0 }}>{overall} оноо</p>
              </div>
            </div>
          )}
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'#64748b', margin:0 }}>Нийт хичээл</p>
            <p style={{ fontSize:20, fontWeight:900, color:'#0f172a', margin:0 }}>
              {Object.keys(bySubject).length}
              <span style={{ fontSize:13, fontWeight:600, color:'#94a3b8', marginLeft:4 }}>хичээл</span>
            </p>
          </div>
        </div>

        {canEdit && (
          <button onClick={() => setModal({ mode:'add' })}
            style={{ padding:'10px 20px', borderRadius:14, fontWeight:800, fontSize:14,
              background:'linear-gradient(135deg, #f97316, #ea580c)', color:'white', border:'none',
              cursor:'pointer', boxShadow:'0 4px 12px rgba(249,115,22,0.3)', display:'flex', alignItems:'center', gap:6 }}>
            ➕ Дүн нэмэх
          </button>
        )}
      </div>

      {/* Term filter */}
      {grades.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
          {(['Бүгд', ...TERMS] as string[]).map(t => {
            const active = filterTerm === t
            const tc = t !== 'Бүгд' ? TERM_COLORS[t] : null
            return (
              <button key={t} onClick={() => setFilterTerm(t)}
                style={{ padding:'6px 14px', borderRadius:10, fontSize:12, fontWeight:800, cursor:'pointer',
                  border: active ? `2px solid ${tc?.color ?? '#f97316'}` : '2px solid #e2e8f0',
                  background: active ? (tc?.bg ?? '#fff7ed') : 'white',
                  color: active ? (tc?.color ?? '#ea580c') : '#64748b',
                  transition:'all 0.15s' }}>
                {t}
              </button>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {grades.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>📝</div>
          <p style={{ fontWeight:800, fontSize:16, color:'#64748b', marginBottom:6 }}>Дүн бүртгэгдээгүй байна</p>
          {canEdit && (
            <p style={{ fontSize:13, color:'#94a3b8' }}>
              Дээрх "Дүн нэмэх" товч дарж эхлэх боломжтой
            </p>
          )}
        </div>
      )}

      {/* Filtered empty */}
      {grades.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'#94a3b8' }}>
          <p style={{ fontWeight:700 }}>"{filterTerm}"-н дүн байхгүй байна</p>
        </div>
      )}

      {/* Subject cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {Object.entries(bySubject).map(([subject, subGrades]) => (
          <SubjectCard
            key={subject}
            subject={subject}
            grades={subGrades}
            canEdit={canEdit}
            onEdit={(g) => setModal({ mode:'edit', grade:g })}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
