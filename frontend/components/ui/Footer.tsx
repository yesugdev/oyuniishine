import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-warm-400 to-warm-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                ✦
              </div>
              <span className="font-black text-xl text-white">
                Kids<span className="text-warm-400">Shine</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Хүүхэд бүрийн гайхамшгийг харуулах платформ. Багш, эцэг эх, сурагчдыг нэгтгэх цифрлэх дурсамжийн ном.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Хуудсууд</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Нүүр хуудас' },
                { href: '/showcase', label: 'Сурагчид' },
                { href: '/gallery', label: 'Галерей' },
                { href: '/login', label: 'Нэвтрэх' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-400 hover:text-warm-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Холбоо барих</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📧 info@kidsshine.mn</li>
              <li>📞 +976 9900-0000</li>
              <li>📍 Улаанбаатар, Монгол</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© 2026 KidsShine. Бүх эрх хуулиар хамгаалагдсан.</p>
          <p className="text-sm text-slate-500">Хайр ❤️-р хийсэн Монголд</p>
        </div>
      </div>
    </footer>
  )
}
