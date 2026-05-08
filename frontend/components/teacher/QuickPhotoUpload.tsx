'use client'

import { useState, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { studentsApi } from '@/lib/api'
import type { Student } from '@/types'

type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'done' | 'error'

interface CardState {
  status: UploadStatus
  added: number
}

function StudentDropCard({
  student,
  state,
  onFiles,
}: {
  student: Student
  state: CardState
  onFiles: (id: string, files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOver(true)
  }
  const handleDragLeave = () => setOver(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    )
    if (files.length) onFiles(student._id, files)
  }
  const handleClick = () => inputRef.current?.click()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith('image/')
    )
    if (files.length) onFiles(student._id, files)
    e.target.value = ''
  }

  const { status, added } = state
  const active = over || status === 'uploading'

  let border = '2px dashed #e2e8f0'
  let bg = '#ffffff'
  let shadow = 'none'

  if (active) {
    border = '2px solid #f97316'
    bg = '#fff7ed'
    shadow = '0 0 0 4px rgba(249,115,22,0.12)'
  } else if (status === 'done') {
    border = '2px solid #22c55e'
    bg = '#f0fdf4'
  } else if (status === 'error') {
    border = '2px solid #ef4444'
    bg = '#fff1f2'
  }

  const icon =
    status === 'uploading'
      ? '⏳'
      : status === 'done'
      ? '✅'
      : status === 'error'
      ? '❌'
      : over
      ? '📥'
      : '📸'

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        border,
        background: bg,
        boxShadow: shadow,
        borderRadius: 16,
        padding: '14px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'all 0.18s ease',
        userSelect: 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {/* Avatar */}
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {student.profilePhoto ? (
          <img
            src={student.profilePhoto}
            alt={student.fullName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #fb923c, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              fontSize: 22,
            }}
          >
            {student.fullName[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight: 800,
            color: '#0f172a',
            fontSize: 15,
            marginBottom: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {student.fullName}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
            {student.grade}-р анги · {student.photos?.length ?? 0} зураг
          </span>
          {added > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#16a34a',
                background: '#dcfce7',
                padding: '2px 8px',
                borderRadius: 20,
              }}
            >
              +{added} нэмэгдсэн
            </span>
          )}
        </div>
      </div>

      {/* Status icon */}
      <div
        style={{
          fontSize: 22,
          flexShrink: 0,
          width: 32,
          textAlign: 'center',
          transition: 'all 0.2s',
        }}
      >
        {icon}
      </div>
    </div>
  )
}

export default function QuickPhotoUpload({ students }: { students: Student[] }) {
  const qc = useQueryClient()
  const [states, setStates] = useState<Record<string, CardState>>({})
  const [search, setSearch] = useState('')

  const setCardState = useCallback(
    (id: string, patch: Partial<CardState>) =>
      setStates((prev) => ({
        ...prev,
        [id]: { ...{ status: 'idle' as UploadStatus, added: 0 }, ...prev[id], ...patch },
      })),
    []
  )

  const handleFiles = useCallback(
    async (studentId: string, files: File[]) => {
      setCardState(studentId, { status: 'uploading' })
      try {
        for (const file of files) {
          const fd = new FormData()
          fd.append('photo', file)
          await studentsApi.uploadPhoto(studentId, fd)
        }
        setStates((prev) => ({
          ...prev,
          [studentId]: {
            status: 'done',
            added: (prev[studentId]?.added ?? 0) + files.length,
          },
        }))
        qc.invalidateQueries({ queryKey: ['my-students'] })
        setTimeout(
          () => setCardState(studentId, { status: 'idle' }),
          2500
        )
      } catch {
        setCardState(studentId, { status: 'error' })
        setTimeout(
          () => setCardState(studentId, { status: 'idle' }),
          2500
        )
      }
    },
    [qc, setCardState]
  )

  const filtered = students.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase())
  )

  const totalAdded = Object.values(states).reduce((a, s) => a + s.added, 0)

  return (
    <div>
      {/* Info banner */}
      <div
        style={{
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <span style={{ fontSize: 26, lineHeight: 1 }}>⚡</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 800, color: '#c2410c', fontSize: 15, marginBottom: 4 }}>
            Хурдан зураг оруулах горим
          </p>
          <p style={{ fontSize: 13, color: '#9a3412', lineHeight: 1.6 }}>
            Зургаа хүүхдийн карт дээр <strong>чирж тавих</strong> эсвэл{' '}
            <strong>карт дээр дарж</strong> файл сонгоно уу. Олон зураг нэгэн зэрэг оруулах боломжтой.
          </p>
        </div>
        {totalAdded > 0 && (
          <div
            style={{
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: 12,
              padding: '8px 14px',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <p style={{ fontSize: 22, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>
              {totalAdded}
            </p>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#15803d' }}>нэмэгдсэн</p>
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 380 }}>
        <span
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Сурагч хайх..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ paddingLeft: 42 }}
        />
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={{ fontWeight: 700, fontSize: 16 }}>Сурагч олдсонгүй</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((student) => (
            <StudentDropCard
              key={student._id}
              student={student}
              state={states[student._id] ?? { status: 'idle', added: 0 }}
              onFiles={handleFiles}
            />
          ))}
        </div>
      )}
    </div>
  )
}
