'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import FloatingParticles from '@/components/ui/FloatingParticles'

export default function LoginPage() {
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
      // useEffect above handles the redirect based on role
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Нэвтрэх амжилтгүй болсон'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-warm-50 via-white to-lavender-50 pt-20">
      <FloatingParticles count={15} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-warm-400 to-warm-600 rounded-3xl flex items-center justify-center text-3xl text-white shadow-warm mx-auto mb-4">
              ✦
            </div>
            <h1 className="text-3xl font-black text-slate-900">Нэвтрэх</h1>
            <p className="text-slate-500 mt-1">KidsShine платформд тавтай морилно уу</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 mb-6 text-sm font-semibold"
            >
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">И-мэйл хаяг</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@school.mn"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Нууц үг</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Нэвтэрж байна...' : '🚀 Нэвтрэх'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Бүртгэл байхгүй юу?{' '}
            <Link href="/register" className="font-bold text-warm-500 hover:text-warm-600">
              Бүртгүүлэх
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs font-bold text-slate-500 mb-2">🧪 Demo нэвтрэх мэдээлэл:</p>
            <p className="text-xs text-slate-400">Багш: teacher@demo.mn / demo1234</p>
            <p className="text-xs text-slate-400">Эцэг эх: parent@demo.mn / demo1234</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
