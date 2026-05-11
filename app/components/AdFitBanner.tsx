'use client'

import { useEffect, useRef } from 'react'

interface Props {
  adUnit: string
  width: number
  height: number
}

export default function AdFitBanner({ adUnit, width, height }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ins = document.createElement('ins')
    ins.className = 'kakao_ad_area'
    ins.style.display = 'none'
    ins.setAttribute('data-ad-unit', adUnit)
    ins.setAttribute('data-ad-width', String(width))
    ins.setAttribute('data-ad-height', String(height))
    ref.current.appendChild(ins)

    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js'
    script.async = true
    ref.current.appendChild(script)
  }, [adUnit, width, height])

  return (
    <div
      ref={ref}
      className="flex justify-center my-6"
      style={{ minHeight: height }}
    />
  )
}
