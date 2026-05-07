'use client'

import { create } from 'zustand'
import { authApi } from './api'

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'teacher' | 'parent'
  avatar?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  init: () => Promise<void>
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  token: null,
  loading: true,

  login: async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  init: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ loading: false })
      return
    }
    try {
      const res = await authApi.me()
      set({ user: res.data, token, loading: false })
    } catch {
      localStorage.removeItem('token')
      set({ loading: false })
    }
  },
}))
