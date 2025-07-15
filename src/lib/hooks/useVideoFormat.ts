// src/lib/hooks/useVideoFormat.ts
'use client'

import { useState, useEffect } from 'react'

export function useVideoFormat() {
  const [supportsWebm, setSupportsWebm] = useState<boolean | null>(null)

  useEffect(() => {
    const video = document.createElement('video')
    const canPlayWebm = video.canPlayType('video/webm') !== ''
    setSupportsWebm(canPlayWebm)
  }, [])

  const getVideoSrc = (webmSrc: string, mp4Src?: string): string => {
    // If we haven't detected support yet, return webm as default
    if (supportsWebm === null) return webmSrc
    
    // If webm is supported, use it
    if (supportsWebm) return webmSrc
    
    // If mp4Src is provided, use it as fallback
    if (mp4Src) return mp4Src
    
    // Otherwise, try to convert webm path to mp4
    return webmSrc.replace(/\.webm$/, '.mp4')
  }

  return { supportsWebm, getVideoSrc }
}