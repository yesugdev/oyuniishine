'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import FloatingParticles from '@/components/ui/FloatingParticles'

type Role = 'teacher' | 'parent'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'parent' as Role })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Нууц үг таарахгүй байна')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { authApi } = await import('@/lib/api')
      await authApi.register({ name: form.name, email: form.email, password: form.password, role: form.role })
      await login(form.email, form.password)
      router.push(form.role === 'teacher' ? '/dashboard/teacher' : '/showcase')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Бүртгэл амжилтгүй'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-mint-50 pt-20 pb-10">
      <FloatingParticles count={15} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-mint-500 rounded-3xl flex items-center justify-center text-3xl text-white shadow-sky mx-auto mb-4">
              🌟
            </div>
            <h1 className="text-3xl font-black text-slate-900">Бүртгүүлэх</h1>
            <p className="text-slate-500 mt-1">KidsShine-д нэгдэх</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-3 mb-6">
            {[
              { value: 'teacher', label: '👩‍🏫 Багш', desc: 'Сурагч нэмэх' },
              { value: 'parent', label: '👨‍👩‍👧 Эцэг эх', desc: 'Хүүхэд харах' },
            ].map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => set('role', role.value)}
                className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${
                  form.role === role.value
                    ? 'border-warm-400 bg-warm-50'
                    : 'border-slate-200 hover:border-warm-200'
                }`}
              >
                <p className="font-bold text-slate-800 text-sm">{role.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{role.desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 mb-5 text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: 'name', label: 'Нэр', type: 'text', placeholder: 'Таны бүтэн нэр' },
              { id: 'email', label: 'И-мэйл', type: 'email', placeholder: 'example@school.mn' },
              { id: 'password', label: 'Нууц үг', type: 'password', placeholder: '6+ тэмдэгт' },
              { id: 'confirmPassword', label: 'Нууц үг давтах', type: 'password', placeholder: '••••••••' },
            ].map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.id as keyof typeof form]}
                  onChange={(e) => set(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required
                  minLength={field.id === 'password' || field.id === 'confirmPassword' ? 6 : 2}
                  className="input-field"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-70"
            >
              {loading ? '⏳ Бүртгэж байна...' : '✅ Бүртгүүлэх'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Бүртгэлтэй юу?{' '}
            <Link href="/login" className="font-bold text-warm-500 hover:text-warm-600">
              Нэвтрэх
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
