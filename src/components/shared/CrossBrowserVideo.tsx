// src/components/shared/CrossBrowserVideo.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface CrossBrowserVideoProps {
  webmSrc: string
  mp4Src: string
  posterSrc?: string
  className?: string
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  preload?: string
  autoPlay?: boolean
  onCanPlay?: () => void
}

export default function CrossBrowserVideo({
  webmSrc,
  mp4Src,
  posterSrc,
  className = '',
  loop = true,
  muted = true,
  playsInline = true,
  preload = 'auto',
  autoPlay = false,
  onCanPlay
}: CrossBrowserVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isSafari, setIsSafari] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Detect Safari
    const userAgent = navigator.userAgent.toLowerCase()
    const safariDetected = userAgent.includes('safari') && !userAgent.includes('chrome')
    setIsSafari(safariDetected)
  }, [])

  const handleCanPlay = () => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
    onCanPlay?.()
  }

  const handleError = () => {
    console.warn(`Video failed to load: ${isSafari ? mp4Src : webmSrc}`)
    setHasError(true)
  }

  // If there's an error and we have a poster, show that instead
  if (hasError && posterSrc) {
    return (
      <img 
        src={posterSrc} 
        alt="Video fallback" 
        className={className}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  return (
    <video
      ref={videoRef}
      className={className}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      preload={preload}
      poster={posterSrc}
      onCanPlay={handleCanPlay}
      onError={handleError}
      style={{
        // Ensure video fills container and background shows through
        backgroundColor: 'transparent',
        objectFit: 'cover'
      }}
    >
      {/* Safari prefers MP4, so put it first for Safari */}
      {isSafari ? (
        <>
          <source src={mp4Src} type="video/mp4" />
          <source src={webmSrc} type="video/webm" />
        </>
      ) : (
        <>
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </>
      )}
      
      {/* Fallback for browsers that don't support video */}
      {posterSrc && (
        <img 
          src={posterSrc} 
          alt="Video fallback" 
          className={className}
          style={{ objectFit: 'cover' }}
        />
      )}
    </video>
  )
}