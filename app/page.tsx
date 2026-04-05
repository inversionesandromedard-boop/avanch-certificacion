'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      router.push('/reset-password' + hash)
    } else {
      router.push('/login')
    }
  }, [router])

  return null
}