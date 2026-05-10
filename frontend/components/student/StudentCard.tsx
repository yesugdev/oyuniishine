'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Student } from '@/types'
import { getInitials, REACTION_ICONS } from '@/lib/utils'
import { studentsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const PROFILE_GRADIENTS = [
  'linear-gradient(160deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)',
  'linear-gradient(160deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)',
  'linear-gradient(160deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)',
  'linear-gradient(160deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
  'linear-gradient(160deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)',
]

const GRADE_STYLES: Record<string, { background: string; color: string; border: string }> = {
  '1': { background: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
  '2': { background: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  '3': { background: '#fefce8', color: '#ca8a04', border: '#fde68a' },
  '4': { background: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  '5': { background: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
  '6': { background: '#faf5ff', color: '#7c3aed', border: '#ddd6fe' },
  '7': { background: '#fdf2f8', color: '#db2777', border: '#fbcfe8' },
  '8': { background: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
}

function getGradient(name: string) {
  return PROFILE_GRADIENTS[name.charCodeAt(0) % PROFILE_GRADIENTS.length]
}

const REACTION_LIST = [
  { type: 'heart', emoji: '❤️' },
  { type: 'star', emoji: '⭐' },
  { type: 'clap', emoji: '👏' },
  { type: 'smile', emoji: '😊' },
]

export default function StudentCard({ student, queryKey = ['students'] }: {
  student: Student
  queryKey?: unknown[]
}) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [hovered, setHovered] = useState(false)
  const [reacted, setReacted] = useState<string | null>(null)

  const reactMutation = useMutation({
    mutationFn: (type: string) => studentsApi.react(student._id, type),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })

  const handleReact = (e: React.MouseEvent, type: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    setReacted(type)
    reactMutation.mutate(type)
    setTimeout(() => setReacted(null), 800)
  }

  const gradeStyle = GRADE_STYLES[student.grade] || { background: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
  const gradientBg = getGradient(student.fullName)
  const totalReactions = student.reactions?.length ?? 0
  const topReactions = REACTION_LIST.map((r) => ({
    ...r,
    count: student.reactions?.filter((rx) => rx.type === r.type).length ?? 0,
  })).filter((r) => r.count > 0)

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ position: 'relative', borderRadius: 24 }}
    >
      <Link href={`/students/${student._id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          borderRadius: 24,
          overflow: 'hidden',
          background: 'white',
          boxShadow: hovered
            ? '0 20px 60px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.08)'
            : '0 4px 20px rgba(0,0,0,0.07)',
          transition: 'box-shadow 0.3s ease',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>

          {/* ── Photo area ── */}
          <div style={{ position: 'relative', height: 220, background: gradientBg, overflow: 'hidden' }}>
            {student.profilePhoto ? (
              <Image
                src={student.profilePhoto}
                alt={student.fullName}
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center 15%',   // ← нүүр дээрээ focus хийнэ
                  transform: hovered ? 'scale(1.06)' : 'scale(1)',
                  transition: 'transform 0.5s ease',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 64, fontWeight: 900, color: 'rgba(255,255,255,0.85)', userSelect: 'none' }}>
                  {getInitials(student.fullName)}
                </span>
              </div>
            )}

            {/* Gradient overlay - always */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
            }} />

            {/* Grade badge - top left */}
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                background: gradeStyle.background, color: gradeStyle.color,
                border: `1.5px solid ${gradeStyle.border}`,
                backdropFilter: 'blur(4px)',
              }}>
                {student.grade}-р анги
              </span>
            </div>

            {/* Views - top right */}
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: 'rgba(0,0,0,0.35)', color: 'white',
                backdropFilter: 'blur(6px)',
              }}>
                👁 {student.viewCount ?? 0}
              </span>
            </div>

            {/* Name overlay on photo bottom */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px' }}>
              <h3 style={{ fontWeight: 900, color: 'white', fontSize: 18, lineHeight: 1.2, margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                {student.fullName}
              </h3>
              {student.nickname && (
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600, margin: '2px 0 0' }}>
                  "{student.nickname}"
                </p>
              )}
            </div>

            {/* ── Hover overlay: quick react ── */}
            <AnimatePresence>
              {hovered && user && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: 6,
                  }}
                >
                  {REACTION_LIST.map((r) => (
                    <motion.button
                      key={r.type}
                      onClick={(e) => handleReact(e, r.type)}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      animate={reacted === r.type ? { scale: [1, 1.5, 1] } : {}}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', fontSize: 16,
                        background: reacted === r.type ? 'rgba(249,115,22,0.9)' : 'rgba(255,255,255,0.85)',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', backdropFilter: 'blur(6px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        transition: 'background 0.15s',
                      }}
                    >
                      {r.emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Info section ── */}
          <div style={{ padding: '14px 16px 16px' }}>

            {/* Age + Dream */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                🎂 <span>{student.age} настай</span>
              </span>
              {student.dreamProfession && (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316', display: 'flex', alignItems: 'center', gap: 3 }}>
                  🌠 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{student.dreamProfession}</span>
                </span>
              )}
            </div>

            {/* Intro */}
            {student.intro && (
              <p style={{
                fontSize: 13, color: '#64748b', lineHeight: 1.55, marginBottom: 10,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {student.intro}
              </p>
            )}

            {/* Hobbies */}
            {student.hobbies?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                {student.hobbies.slice(0, 3).map((h) => (
                  <span key={h} style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa',
                  }}>
                    {h}
                  </span>
                ))}
                {student.hobbies.length > 3 && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0',
                  }}>
                    +{student.hobbies.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              {/* Reactions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {topReactions.length > 0 ? (
                  topReactions.slice(0, 3).map((r) => (
                    <span key={r.type} style={{ fontSize: 12, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {r.emoji}<span>{r.count}</span>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }}>
                    {user ? 'Дээрх 😊 товч дарж хандлагаа илэрхийл' : 'Хандлага байхгүй'}
                  </span>
                )}
              </div>

              {/* CTA */}
              <motion.span
                animate={{ x: hovered ? 3 : 0 }}
                style={{
                  fontSize: 13, fontWeight: 800, color: '#f97316',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                Дэлгэрэнгүй <span style={{ fontSize: 16 }}>→</span>
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
