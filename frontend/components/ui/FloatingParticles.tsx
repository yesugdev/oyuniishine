'use client'

import { useEffect, useRef } from 'react'

const SHAPES = ['⭐', '🌟', '💫', '✨', '🎈', '🌸', '💖', '🦋', '🌈', '🎨']

interface Particle {
  x: number
  y: number
  size: number
  color: string
  speedX: number
  speedY: number
  emoji?: string
  opacity: number
  rotation: number
  rotSpeed: number
}

export default function FloatingParticles({ count = 15, useEmoji = false }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: Particle[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#FF7A3D', '#0EA5E9', '#8B5CF6', '#22C55E', '#F43F5E', '#FFB87A']

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        emoji: useEmoji ? SHAPES[Math.floor(Math.random() * SHAPES.length)] : undefined,
        opacity: Math.random() * 0.4 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        if (p.emoji) {
          ctx.font = `${p.size * 2}px serif`
          ctx.fillText(p.emoji, -p.size, p.size)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        }
        ctx.restore()

        p.x += p.speedX
        p.y += p.speedY
        p.rotation += p.rotSpeed

        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20
        if (p.y < -20) p.y = canvas.height + 20
        if (p.y > canvas.height + 20) p.y = -20
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [count, useEmoji])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
