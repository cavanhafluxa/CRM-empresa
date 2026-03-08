'use client'

import { useState, useCallback } from 'react'
import { Toast } from '@/types'

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
