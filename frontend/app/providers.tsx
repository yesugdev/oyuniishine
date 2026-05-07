'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'

function AuthInit({ children }: { children: React.ReactNode }) {
  const init = useAuth((s) => s.init)
  useEffect(() => { init() }, [init])
  return <>{children}</>
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInit>{children}</AuthInit>
    </QueryClientProvider>
  )
}
