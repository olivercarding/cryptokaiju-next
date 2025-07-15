// src/lib/hooks/useVideoFormat.ts
'use client'

import { useState, useEffect } from 'react'

export function useVideoFormat() {
  const [isSafari, setIsSafari] = useState<boolean | null>(null)
  const [supportsWebm, setSupportsWebm] = useState<boolean | null>(null)

  useEffect(() => {
    // Detect Safari
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    setIsSafari(safari)

    // Test webm support - canPlayType returns "" | "maybe" | "probably"
    const video = document.createElement('video')
    const webmSupport = video.canPlayType('video/webm')
    const canPlayWebm = webmSupport !== ''
    setSupportsWebm(canPlayWebm)
    
    console.log('Browser detection:', { safari, canPlayWebm, webmSupport, userAgent: navigator.userAgent })
  }, [])

  const shouldUseWebm = (webmSrc: string, mp4Src?: string): boolean => {
    // If Safari, never use webm
    if (isSafari === true) return false
    
    // If we know it's not Safari and webm is supported, use webm
    if (isSafari === false && supportsWebm === true) return true
    
    // If still detecting or webm not supported, default to mp4
    return false
  }

  const getVideoSources = (webmSrc: string, mp4Src?: string) => {
    const mp4Source = mp4Src || webmSrc.replace(/\.webm$/, '.mp4')
    
    // Always return mp4 first for better Safari compatibility
    return {
      mp4: mp4Source,
      webm: webmSrc,
      primary: shouldUseWebm(webmSrc, mp4Src) ? webmSrc : mp4Source
    }
  }

  return { 
    isSafari, 
    supportsWebm, 
    shouldUseWebm, 
    getVideoSources 
  }
}