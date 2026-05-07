export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatAge(age: number): string {
  return `${age} настай`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const GRADE_COLORS: Record<string, string> = {
  '1': 'bg-rose-100 text-rose-700',
  '2': 'bg-warm-100 text-warm-700',
  '3': 'bg-yellow-100 text-yellow-700',
  '4': 'bg-mint-100 text-mint-700',
  '5': 'bg-sky-100 text-sky-700',
  '6': 'bg-lavender-100 text-lavender-700',
  '7': 'bg-pink-100 text-pink-700',
  '8': 'bg-indigo-100 text-indigo-700',
}

export const ACHIEVEMENT_ICONS: Record<string, string> = {
  award: '🏆',
  certificate: '📜',
  sports: '⚽',
  art: '🎨',
  academic: '📚',
  other: '⭐',
}

export const REACTION_ICONS: Record<string, string> = {
  heart: '❤️',
  star: '⭐',
  smile: '😊',
  clap: '👏',
}
