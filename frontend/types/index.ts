export interface Student {
  _id: string
  fullName: string
  nickname?: string
  age: number
  grade: string
  class: string
  birthday: string
  profilePhoto?: string
  intro?: string
  isPublic: boolean
  hobbies: string[]
  favoriteSubject?: string
  favoriteActivity?: string
  skills: string[]
  dreamProfession?: string
  traits: string[]
  whatMakesSpecial?: string
  bestMemory?: string
  friendQuote?: string
  teacherComment?: string
  parentMessage?: string
  childMessage?: string
  photos: Photo[]
  videos: Video[]
  achievements: Achievement[]
  timeline: TimelineEvent[]
  aiSummary?: string
  aiStrengths: string[]
  teacher: { _id: string; name: string; avatar?: string }
  reactions: Reaction[]
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface Photo {
  _id: string
  url: string
  caption?: string
  uploadedAt: string
}

export interface Video {
  _id: string
  url: string
  title: string
  thumbnail?: string
}

export interface Achievement {
  _id: string
  title: string
  date: string
  description?: string
  type: 'award' | 'certificate' | 'sports' | 'art' | 'academic' | 'other'
  imageUrl?: string
}

export interface TimelineEvent {
  _id: string
  date: string
  event: string
  type: 'academic' | 'social' | 'personal' | 'achievement'
  emoji?: string
}

export interface Reaction {
  userId: string
  type: 'heart' | 'star' | 'smile' | 'clap'
}

export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'teacher' | 'parent'
  avatar?: string
}
