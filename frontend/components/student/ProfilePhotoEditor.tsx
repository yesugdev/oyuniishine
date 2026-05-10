'use client'

import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { motion } from 'framer-motion'

// ─── Canvas helpers ────────────────────────────────────────────────────────────

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function renderCroppedImage(
  src: string,
  crop: Area,
  rotation: number,
  adj: { brightness: number; contrast: number; saturation: number; warmth: number }
): Promise<Blob> {
  const image = await loadImage(src)

  // Step 1: rotate + crop on temporary canvas
  const maxDim = Math.max(image.width, image.height)
  const safeArea = Math.ceil(2 * ((maxDim / 2) * Math.sqrt(2)))

  const rotCanvas = document.createElement('canvas')
  rotCanvas.width = safeArea
  rotCanvas.height = safeArea
  const rotCtx = rotCanvas.getContext('2d')!

  rotCtx.translate(safeArea / 2, safeArea / 2)
  rotCtx.rotate(toRad(rotation))
  rotCtx.translate(-safeArea / 2, -safeArea / 2)
  rotCtx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2
  )

  // Step 2: extract crop area
  const croppedData = rotCtx.getImageData(
    Math.round(safeArea / 2 - image.width / 2 + crop.x),
    Math.round(safeArea / 2 - image.height / 2 + crop.y),
    crop.width,
    crop.height
  )

  // Step 3: apply adjustments
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = crop.width
  finalCanvas.height = crop.height
  const finalCtx = finalCanvas.getContext('2d')!
  finalCtx.putImageData(croppedData, 0, 0)

  // Warmth: shift red/blue channels manually
  if (adj.warmth !== 0) {
    const imgData = finalCtx.getImageData(0, 0, crop.width, crop.height)
    const d = imgData.data
    const w = adj.warmth * 0.4 // scale warmth to pixel shift
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, Math.max(0, d[i] + w))       // R
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] - w)) // B
    }
    finalCtx.putImageData(imgData, 0, 0)
  }

  // Apply CSS filters (brightness/contrast/saturation)
  const outCanvas = document.createElement('canvas')
  outCanvas.width = crop.width
  outCanvas.height = crop.height
  const outCtx = outCanvas.getContext('2d')!
  outCtx.filter = [
    `brightness(${adj.brightness}%)`,
    `contrast(${adj.contrast}%)`,
    `saturate(${adj.saturation}%)`,
  ].join(' ')
  outCtx.drawImage(finalCanvas, 0, 0)

  return new Promise((resolve, reject) => {
    outCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      0.95
    )
  })
}

// ─── Slider ────────────────────────────────────────────────────────────────────

function AdjSlider({
  label,
  emoji,
  value,
  min,
  max,
  defaultVal,
  onChange,
  format,
}: {
  label: string
  emoji: string
  value: number
  min: number
  max: number
  defaultVal: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  const pct = ((value - min) / (max - min)) * 100
  const changed = value !== defaultVal

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
          {emoji} {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: changed ? '#ea580c' : '#94a3b8' }}>
            {format ? format(value) : value}
          </span>
          {changed && (
            <button
              onClick={() => onChange(defaultVal)}
              style={{ fontSize: 10, fontWeight: 700, color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '2px 6px', cursor: 'pointer' }}
            >
              ↺
            </button>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', height: 6, borderRadius: 99, background: '#e2e8f0' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #f97316, #ea580c)', width: `${pct}%`, transition: 'width 0.05s' }} />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface Props {
  currentPhoto?: string
  studentName: string
  onClose: () => void
  onSave: (fd: FormData) => Promise<void>
}

const DEFAULTS = { brightness: 100, contrast: 100, saturation: 100, warmth: 0 }

export default function ProfilePhotoEditor({ currentPhoto, studentName, onClose, onSave }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(currentPhoto ?? null)
  const [hasNewFile, setHasNewFile] = useState(false)

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  // Adjustments
  const [adj, setAdj] = useState({ ...DEFAULTS })
  const setA = (k: keyof typeof DEFAULTS, v: number) => setAdj((a) => ({ ...a, [k]: v }))

  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'crop' | 'adjust'>('crop')

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setHasNewFile(true)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setAdj({ ...DEFAULTS })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!imageSrc || !croppedArea) return
    setLoading(true)
    try {
      const blob = await renderCroppedImage(imageSrc, croppedArea, rotation, adj)
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
      const fd = new FormData()
      fd.append('profilePhoto', file)
      await onSave(fd)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const cssFilter = [
    `brightness(${adj.brightness}%)`,
    `contrast(${adj.contrast}%)`,
    `saturate(${adj.saturation}%)`,
  ].join(' ')

  const adjChanged = Object.entries(adj).some(([k, v]) => v !== DEFAULTS[k as keyof typeof DEFAULTS])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full overflow-hidden"
        style={{ maxWidth: 860, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>🖼 Профайл зураг засах</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{studentName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: '#f1f5f9', border: '2px solid #e2e8f0', color: '#374151', cursor: 'pointer' }}
            >
              📁 Зураг солих
            </button>
            <button
              onClick={onClose}
              style={{ width: 36, height: 36, borderRadius: 12, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#64748b', fontSize: 16 }}
            >
              ✕
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

        {!imageSrc ? (
          /* Empty state — pick a file */
          <div
            onClick={() => fileRef.current?.click()}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, cursor: 'pointer', margin: 24, borderRadius: 20, border: '2px dashed #e2e8f0', background: '#f8fafc', minHeight: 320 }}
          >
            <div style={{ fontSize: 56 }}>🖼</div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#475569' }}>Зураг сонгох</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>JPG, PNG, WEBP дэмжинэ</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 4, padding: '12px 24px 0', flexShrink: 0 }}>
              {([['crop', '✂️ Тайрах & Эргүүлэх'], ['adjust', '🎨 Тохиргоо']] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  style={{
                    padding: '8px 18px', border: 'none', cursor: 'pointer',
                    fontWeight: 800, fontSize: 13,
                    color: tab === k ? '#ea580c' : '#64748b',
                    background: tab === k ? '#fff7ed' : 'transparent',
                    borderRadius: '10px 10px 0 0',
                    borderBottom: tab === k ? '3px solid #f97316' : '3px solid transparent',
                  }}
                >
                  {label}
                  {k === 'adjust' && adjChanged && (
                    <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 900, color: '#f97316', background: '#fff7ed', border: '1px solid #fed7aa', padding: '1px 5px', borderRadius: 99 }}>●</span>
                  )}
                </button>
              ))}
            </div>

            {/* Main content area */}
            <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden', minHeight: 0 }}>
              {tab === 'crop' ? (
                /* ── Crop tab ── */
                <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
                  {/* Cropper */}
                  <div style={{ flex: 1, position: 'relative', background: '#0f172a', minHeight: 320 }}>
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      style={{
                        containerStyle: { borderRadius: 0 },
                        cropAreaStyle: { border: '3px solid #f97316', borderRadius: 16 },
                      }}
                    />
                  </div>

                  {/* Crop controls */}
                  <div style={{ width: 220, padding: '20px 20px', background: '#f8fafc', borderLeft: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', flexShrink: 0 }}>
                    <AdjSlider
                      label="Томруулалт" emoji="🔍"
                      value={zoom} min={1} max={3} defaultVal={1}
                      onChange={(v) => setZoom(v)}
                      format={(v) => `${Math.round((v - 1) * 100)}%`}
                    />
                    <AdjSlider
                      label="Эргүүлэх" emoji="🔄"
                      value={rotation} min={-180} max={180} defaultVal={0}
                      onChange={(v) => setRotation(v)}
                      format={(v) => `${v}°`}
                    />
                    {/* Quick rotate buttons */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>⚡ Хурдан эргүүлэх</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {[['↺ -90°', -90], ['↻ +90°', 90], ['↕ Flip 180°', 180], ['↩ Reset', 0]].map(([label, val]) => (
                          <button
                            key={String(label)}
                            onClick={() => setRotation(Number(val))}
                            style={{ padding: '7px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: 'white', border: '1.5px solid #e2e8f0', cursor: 'pointer', color: '#374151' }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9a3412', lineHeight: 1.5 }}>
                        💡 Зураг дотор чирж тайрах хэсгийг зөөж болно. Хуруугаараа томруулж болно.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Adjust tab ── */
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  {/* Preview */}
                  <div style={{ flex: 1, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 320 }}>
                    <div style={{ position: 'relative', width: 260, height: 260 }}>
                      <div style={{ width: 260, height: 260, borderRadius: 20, overflow: 'hidden', border: '3px solid rgba(249,115,22,0.6)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                        {/* We show the full image with adjustments as preview */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageSrc}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: cssFilter, transition: 'filter 0.1s' }}
                        />
                      </div>
                      <p style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Урьдчилсан харагдац</p>
                    </div>
                  </div>

                  {/* Adjustment sliders */}
                  <div style={{ width: 260, padding: '20px 20px', background: '#f8fafc', borderLeft: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 22, overflowY: 'auto', flexShrink: 0 }}>
                    <AdjSlider
                      label="Гэрэл" emoji="☀️"
                      value={adj.brightness} min={50} max={150} defaultVal={100}
                      onChange={(v) => setA('brightness', v)}
                      format={(v) => `${v - 100 > 0 ? '+' : ''}${v - 100}`}
                    />
                    <AdjSlider
                      label="Тодрол" emoji="◑"
                      value={adj.contrast} min={50} max={150} defaultVal={100}
                      onChange={(v) => setA('contrast', v)}
                      format={(v) => `${v - 100 > 0 ? '+' : ''}${v - 100}`}
                    />
                    <AdjSlider
                      label="Өнгө" emoji="🎨"
                      value={adj.saturation} min={0} max={200} defaultVal={100}
                      onChange={(v) => setA('saturation', v)}
                      format={(v) => `${v - 100 > 0 ? '+' : ''}${v - 100}`}
                    />
                    <AdjSlider
                      label="Дулаан өнгө" emoji="🌅"
                      value={adj.warmth} min={-50} max={50} defaultVal={0}
                      onChange={(v) => setA('warmth', v)}
                      format={(v) => `${v > 0 ? '+' : ''}${v}`}
                    />

                    {adjChanged && (
                      <button
                        onClick={() => setAdj({ ...DEFAULTS })}
                        style={{ padding: '9px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}
                      >
                        ↺ Бүгдийг reset
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end', flexShrink: 0, background: 'white' }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 24px', borderRadius: 14, fontWeight: 700, fontSize: 14, border: '2px solid #e2e8f0', background: 'white', color: '#374151', cursor: 'pointer' }}
          >
            Болих
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !imageSrc || !croppedArea}
            style={{
              padding: '10px 28px', borderRadius: 14, fontWeight: 800, fontSize: 14,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: 'white', border: 'none', cursor: loading || !imageSrc ? 'not-allowed' : 'pointer',
              opacity: loading || !imageSrc ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(249,115,22,0.35)',
            }}
          >
            {loading ? '⏳ Хадгалж байна...' : '✅ Хадгалах'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
