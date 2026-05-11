import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      const current = window.location.pathname
      const redirect = current !== '/login' && current !== '/register' ? `?redirect=${encodeURIComponent(current)}` : ''
      window.location.href = `/login${redirect}`
    }
    return Promise.reject(err)
  }
)

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// Students
export const studentsApi = {
  list: (params?: Record<string, string | number>) => api.get('/students', { params }),
  byId: (id: string) => api.get(`/students/${id}`),
  myStudents: () => api.get('/students/my'),
  create: (data: FormData) =>
    api.post('/students', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData | Record<string, unknown>) =>
    api.put(`/students/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  delete: (id: string) => api.delete(`/students/${id}`),
  uploadPhoto: (id: string, data: FormData) =>
    api.post(`/students/${id}/photos`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePhoto: (id: string, photoId: string) => api.delete(`/students/${id}/photos/${photoId}`),
  react: (id: string, type: string) => api.post(`/students/${id}/react`, { type }),
  addVideo: (id: string, data: { url: string; title?: string }) => api.post(`/students/${id}/videos`, data),
  deleteVideo: (id: string, videoId: string) => api.delete(`/students/${id}/videos/${videoId}`),
  addGrade:    (id: string, data: { subject: string; score: number; term: string; comment?: string }) => api.post(`/students/${id}/grades`, data),
  updateGrade: (id: string, gradeId: string, data: Partial<{ subject: string; score: number; term: string; comment: string }>) => api.put(`/students/${id}/grades/${gradeId}`, data),
  deleteGrade: (id: string, gradeId: string) => api.delete(`/students/${id}/grades/${gradeId}`),
}
