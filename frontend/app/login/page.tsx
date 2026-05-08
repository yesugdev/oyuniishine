'use client'

import { Suspense, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import FloatingParticles from '@/components/ui/FloatingParticles'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  useEffect(() => {
    if (user) {
      if (redirectTo) {
        router.replace(redirectTo)
      } else {
        router.replace(user.role === 'teacher' || user.role === 'admin' ? '/dashboard/teacher' : '/showcase')
      }
    }
  }, [user, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Нэвтрэх амжилтгүй болсон'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl text-white mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}>
          ✦
        </div>
        <h1 className="text-3xl font-black" style={{ color: '#0f172a' }}>Нэвтрэх</h1>
        <p style={{ color: '#64748b' }} className="mt-1">OyuniiShine платформд тавтай морилно уу</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 mb-6 text-sm font-semibold"
          style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48' }}>
          ⚠️ {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: '#374151' }}>И-мэйл хаяг</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="example@school.mn" required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: '#374151' }}>Нууц үг</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required className="input-field" />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-3.5 text-base mt-2"
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Нэвтэрж байна...' : '🚀 Нэвтрэх'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: '#64748b' }}>
        Бүртгэл байхгүй юу?{' '}
        <Link href="/register" className="font-bold" style={{ color: '#f97316' }}>
          Бүртгүүлэх
        </Link>
      </p>

      <div className="mt-6 p-4 rounded-2xl" style={{ background: '#f8fafc' }}>
        <p className="text-xs font-bold mb-2" style={{ color: '#94a3b8' }}>🧪 Demo нэвтрэх мэдээлэл:</p>
        <p className="text-xs" style={{ color: '#94a3b8' }}>Багш: teacher@demo.mn / demo1234</p>
        <p className="text-xs" style={{ color: '#94a3b8' }}>Эцэг эх: parent@demo.mn / demo1234</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
      style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #f5f3ff 100%)' }}>
      <FloatingParticles count={15} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="relative z-10 w-full max-w-md mx-4">
        <Suspense fallback={
          <div className="card p-8 flex items-center justify-center" style={{ minHeight: 400 }}>
            <div className="text-4xl animate-bounce-soft">✦</div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
