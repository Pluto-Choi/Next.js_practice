'use client'

import { useEffect, useState } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

type Status = 'unsupported' | 'default' | 'granted' | 'denied' | 'loading'

export default function NotificationButton() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !VAPID_PUBLIC_KEY
    ) {
      setStatus('unsupported')
      return
    }
    navigator.serviceWorker.register('/sw.js').catch(() => {})
    setStatus(Notification.permission as Status)
  }, [])

  async function subscribe() {
    setStatus('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission as Status)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setStatus('granted')
    } catch {
      setStatus('default')
    }
  }

  if (status === 'unsupported' || status === 'denied') return null

  if (status === 'granted') {
    return (
      <p className="mb-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        🔔 매일 낮 12시 알림 설정됨
      </p>
    )
  }

  return (
    <div className="mb-6 flex justify-center">
      <button
        onClick={subscribe}
        disabled={status === 'loading'}
        className="px-4 py-2.5 rounded-full text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'loading' ? '설정 중…' : '🔔 매일 12시 키워드 알림 받기'}
      </button>
    </div>
  )
}
