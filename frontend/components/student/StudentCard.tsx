'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { Student } from '@/types'
import { getInitials, REACTION_ICONS } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

const PROFILE_GRADIENTS = [
  'linear-gradient(135deg, #fb923c, #f97316)',
  'linear-gradient(135deg, #38bdf8, #0ea5e9)',
  'linear-gradient(135deg, #a78bfa, #8b5cf6)',
  'linear-gradient(135deg, #34d399, #10b981)',
  'linear-gradient(135deg, #fb7185, #f43f5e)',
]

const GRADE_STYLES: Record<string, { background: string; color: string }> = {
  '1': { background: '#fee2e2', color: '#dc2626' },
  '2': { background: '#fff7ed', color: '#ea580c' },
  '3': { background: '#fef9c3', color: '#ca8a04' },
  '4': { background: '#dcfce7', color: '#16a34a' },
  '5': { background: '#e0f2fe', color: '#0284c7' },
  '6': { background: '#ede9fe', color: '#7c3aed' },
  '7': { background: '#fce7f3', color: '#db2777' },
  '8': { background: '#e0e7ff', color: '#4338ca' },
}

function getGradient(name: string) {
  return PROFILE_GRADIENTS[name.charCodeAt(0) % PROFILE_GRADIENTS.length]
}

export default function StudentCard({ student }: { student: Student }) {
  const gradientBg = getGradient(student.fullName)
  const reactionCount = student.reactions?.length ?? 0
  const gradeStyle = GRADE_STYLES[student.grade] || { background: '#f1f5f9', color: '#475569' }

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link href={`/students/${student._id}`}>
        <div className="card overflow-hidden group cursor-pointer">
          {/* Top photo/avatar area */}
          <div className="relative h-44 overflow-hidden" style={{ background: gradientBg }}>
            {student.profilePhoto ? (
              <Image
                src={student.profilePhoto}
                alt={student.fullName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-black text-white/80 select-none">
                  {getInitials(student.fullName)}
                </span>
              </div>
            )}

            {/* Grade badge */}
            <div className="absolute top-3 left-3">
              <span className="badge text-xs font-bold" style={{ ...gradeStyle, backdropFilter: 'blur(4px)' }}>
                {student.grade}-р анги
              </span>
            </div>

            {/* View count */}
            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
              👁 {student.viewCount ?? 0}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight">
                  {student.fullName}
                </h3>
                {student.nickname && (
                  <p className="text-sm text-slate-400 font-medium">"{student.nickname}"</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-orange-400">
                <span>✨</span>
                <span>{student.age}</span>
              </div>
            </div>

            {student.intro && (
              <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{student.intro}</p>
            )}

            {/* Skills/hobbies */}
            {student.hobbies?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {student.hobbies.slice(0, 3).map((h) => (
                  <Badge key={h} variant="warm" className="text-xs py-0.5">
                    {h}
                  </Badge>
                ))}
                {student.hobbies.length > 3 && (
                  <Badge variant="default" className="text-xs py-0.5">
                    +{student.hobbies.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Dream profession */}
            {student.dreamProfession && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <span>🌠</span>
                <span className="font-semibold">{student.dreamProfession} болох мөрөөдөлтэй</span>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                {['heart', 'star', 'clap'].map((type) => {
                  const count = student.reactions?.filter((r) => r.type === type).length ?? 0
                  if (!count) return null
                  return (
                    <span key={type} className="text-sm flex items-center gap-0.5 text-slate-500">
                      {REACTION_ICONS[type]} <span className="font-semibold">{count}</span>
                    </span>
                  )
                })}
                {!reactionCount && <span className="text-sm text-slate-400">Эхний хариу үлдээгч байгаарай!</span>}
              </div>
              <span className="text-orange-400 text-sm font-bold group-hover:translate-x-1 transition-transform inline-block">
                Дэлгэрэнгүй →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
