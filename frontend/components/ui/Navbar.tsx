'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { href: '/showcase', label: '✨ Сурагчид' },
    { href: '/gallery', label: '🎨 Галерей' },
  ]

  const navBg = scrolled
    ? 'rgba(255,255,255,0.95)'
    : 'rgba(255,255,255,0.92)'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: navBg,
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0,0,0,0.07)',
      boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
      transition: 'all 0.3s ease',
      padding: scrolled ? '10px 0' : '14px 0',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link href="/showcase" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: 18,
              boxShadow: '0 4px 12px rgba(249,115,22,0.35)',
            }}>✦</div>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#0f172a' }}>
              Oyunii<span style={{
                background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>Shine</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginLeft: 4, verticalAlign: 'middle' }}>beta</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{
                padding: '8px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                textDecoration: 'none', transition: 'all 0.2s',
                background: pathname === link.href ? '#fff7ed' : 'transparent',
                color: pathname === link.href ? '#ea580c' : '#374151',
                border: pathname === link.href ? '1px solid #fed7aa' : '1px solid transparent',
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden-mobile">
            {user ? (
              <>
                <Link href="/dashboard/teacher"
                  style={{
                    padding: '8px 18px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                    textDecoration: 'none', background: '#f1f5f9', color: '#334155',
                    border: '2px solid #e2e8f0',
                  }}>
                  📊 Dashboard
                </Link>
                <button onClick={logout} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, color: '#6b7280',
                }}>
                  Гарах
                </button>
              </>
            ) : (
              <Link href="/login" style={{
                padding: '8px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                textDecoration: 'none', color: 'white',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
              }}>
                Нэвтрэх
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            width: 40, height: 40, borderRadius: 12, background: '#f1f5f9',
            border: 'none', cursor: 'pointer', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
          }} className="show-mobile">
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                width: 20, height: 2, background: '#374151', borderRadius: 2,
                transition: 'all 0.2s',
                transform: menuOpen && i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                  : menuOpen && i === 1 ? 'scaleX(0)'
                  : menuOpen && i === 2 ? 'rotate(-45deg) translate(5px, -5px)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            marginTop: 12, paddingTop: 16, borderTop: '1px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
                padding: '12px 16px', borderRadius: 12, fontWeight: 700,
                fontSize: 15, textDecoration: 'none',
                color: pathname === link.href ? '#ea580c' : '#374151',
                background: pathname === link.href ? '#fff7ed' : 'transparent',
              }}>
                {link.label}
              </Link>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              {user ? (
                <button onClick={() => { logout(); setMenuOpen(false) }} style={{
                  flex: 1, padding: '10px', borderRadius: 12, fontWeight: 700,
                  fontSize: 14, border: '2px solid #e2e8f0', background: 'white',
                  color: '#374151', cursor: 'pointer',
                }}>
                  Гарах
                </button>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                  flex: 1, padding: '10px', borderRadius: 12, fontWeight: 700,
                  fontSize: 14, border: 'none', color: 'white', textAlign: 'center',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  textDecoration: 'none',
                }}>
                  Нэвтрэх
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) { .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </nav>
  )
}
