'use client'

import { useEffect, useRef } from 'react'

interface Props {
  adUnit: string
  width: number
  height: number
}

const isPlaceholder = (adUnit: string) => !adUnit || adUnit.includes('XXX')

export default function AdFitBanner({ adUnit, width, height }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    if (isPlaceholder(adUnit)) return

    const ins = document.createElement('ins')
    ins.className = 'kakao_ad_area'
    ins.style.display = 'none'
    ins.setAttribute('data-ad-unit', adUnit)
    ins.setAttribute('data-ad-width', String(width))
    ins.setAttribute('data-ad-height', String(height))
    host.appendChild(ins)

    const script = document.createElement('script')
    script.src = '//t1.kakaocdn.net/kas/static/ba.min.js'
    script.async = true
    host.appendChild(script)

    // 광고 단위/크기가 바뀌거나 언마운트될 때 중복 주입을 막는다.
    return () => {
      host.replaceChildren()
    }
  }, [adUnit, width, height])

  if (isPlaceholder(adUnit)) return null

  return (
    <div
      ref={ref}
      className="flex justify-center my-6"
      style={{ minHeight: height }}
    />
  )
}
