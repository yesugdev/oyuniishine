import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff7ed' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
          404 — Хуудас олдсонгүй
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Таны хайсан хуудас байхгүй байна</p>
        <Link href="/showcase" style={{
          padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: 700, textDecoration: 'none',
          background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white',
          boxShadow: '0 4px 12px rgba(249,115,22,0.3)', display: 'inline-block',
        }}>
          ← Нүүр хуудас руу
        </Link>
      </div>
    </div>
  )
}
