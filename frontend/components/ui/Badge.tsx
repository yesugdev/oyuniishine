import { cn } from '@/lib/utils'

type BadgeVariant = 'warm' | 'sky' | 'mint' | 'lavender' | 'rose' | 'default'

const VARIANTS: Record<BadgeVariant, string> = {
  warm: 'bg-warm-100 text-warm-700',
  sky: 'bg-sky-100 text-sky-700',
  mint: 'bg-mint-100 text-mint-700',
  lavender: 'bg-lavender-100 text-lavender-700',
  rose: 'bg-rose-100 text-rose-600',
  default: 'bg-slate-100 text-slate-600',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  emoji?: string
}

export default function Badge({ children, variant = 'default', className, emoji }: BadgeProps) {
  return (
    <span className={cn('badge', VARIANTS[variant], className)}>
      {emoji && <span>{emoji}</span>}
      {children}
    </span>
  )
}
