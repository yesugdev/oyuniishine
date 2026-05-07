import Image from 'next/image'
import { getInitials } from '@/lib/utils'

const BG_COLORS = [
  'from-warm-400 to-warm-600',
  'from-sky-400 to-sky-600',
  'from-lavender-400 to-lavender-600',
  'from-mint-400 to-mint-600',
  'from-rose-400 to-rose-500',
]

interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
  '2xl': 'w-36 h-36 text-4xl',
}

const PX_SIZES = { sm: 32, md: 40, lg: 64, xl: 96, '2xl': 144 }

export default function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const colorIdx = name.charCodeAt(0) % BG_COLORS.length
  const colorClass = BG_COLORS[colorIdx]
  const sizeClass = SIZES[size]
  const px = PX_SIZES[size]

  if (src) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <Image src={src} alt={name} width={px} height={px} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex-shrink-0 bg-gradient-to-br ${colorClass} flex items-center justify-center font-bold text-white ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}
