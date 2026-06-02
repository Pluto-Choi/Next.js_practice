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

const DISMISS_KEY = 'notif-dismissed'

export default function NotificationButton() {
  const [status, setStatus] = useState<Status>('loading')
  const [justSubscribed, setJustSubscribed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

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
    if (localStorage.getItem(DISMISS_KEY) === '1') setDismissed(true)
    navigator.serviceWorker.register('/sw.js').catch(() => {})
    setStatus(Notification.permission as Status)
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {}
    setDismissed(true)
  }

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
      setJustSubscribed(true)
      setStatus('granted')
    } catch {
      setStatus('default')
    }
  }

  if (status === 'unsupported' || status === 'denied' || dismissed) return null

  if (status === 'granted') {
    // 이미 구독한 재방문자에게는 안내 문구를 숨기고, 방금 구독한 경우에만 확인 문구를 보여준다.
    if (!justSubscribed) return null
    return (
      <p className="mb-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        🔔 매일 낮 12시 알림 설정됨
      </p>
    )
  }

  return (
    <div className="mb-6 flex justify-center items-center gap-1.5">
      <button
        onClick={subscribe}
        disabled={status === 'loading'}
        className="px-4 py-2.5 rounded-full text-xs font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'loading' ? '설정 중…' : '🔔 매일 12시 키워드 알림 받기'}
      </button>
      {status !== 'loading' && (
        <button
          onClick={dismiss}
          aria-label="알림 안내 닫기"
          title="다시 보지 않기"
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 transition-colors"
        >
          <span className="text-sm leading-none">✕</span>
        </button>
      )}
    </div>
  )
}
