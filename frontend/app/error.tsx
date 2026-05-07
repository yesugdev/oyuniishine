'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff7ed' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😔</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
          Алдаа гарлаа
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error.message || 'Тодорхойгүй алдаа'}</p>
        <button onClick={reset} style={{
          padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 700, cursor: 'pointer',
          background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', border: 'none',
          boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
        }}>
          Дахин оролдох
        </button>
      </div>
    </div>
  )
}
