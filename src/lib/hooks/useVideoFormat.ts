// src/lib/hooks/useVideoFormat.ts
'use client'

/**
 * Detects Safari and WebM support immediately on the first render, avoiding
 * a brief initial state where `isSafari` is `null`. This prevents Safari from
 * momentarily receiving WebM sources before the detection effect runs.
 */
import { useMemo } from 'react'

export interface VideoSources {
  mp4: string
  webm: string
  /** The format the current browser should load first. */
  primary: string
}

function detectSafari(userAgent: string): boolean {
  // Real Safari UA strings contain "Safari" but *not* any of the other brand names below.
  // Chromium‑based browsers on iOS/macOS contain "CriOS", "EdgiOS", or "Chrome" as well.
  const isSafariLike = /Safari/i.test(userAgent) && !/Chrome|CriOS|FxiOS|Edg|OPR|Opera/i.test(userAgent)
  return isSafariLike
}

function detectWebmSupport(): boolean {
  if (typeof document === 'undefined') return false
  const video = document.createElement('video')
  return video.canPlayType('video/webm') !== ''
}

export function useVideoFormat() {
  const { isSafari, supportsWebm } = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return { isSafari: false, supportsWebm: false }
    }
    const ua = navigator.userAgent
    const safari = detectSafari(ua)
    const canPlayWebm = safari ? false : detectWebmSupport()

    return { isSafari: safari, supportsWebm: canPlayWebm }
  }, [])

  /**
   * Decide which source should appear first in the `<video>` tag for the
   * current browser.
   */
  const shouldUseWebm = (webmSrc: string): boolean => {
    return !isSafari && supportsWebm
  }

  const getVideoSources = (webmSrc: string, mp4Src?: string): VideoSources => {
    const mp4Source = mp4Src || webmSrc.replace(/\.webm$/, '.mp4')
    return {
      mp4: mp4Source,
      webm: webmSrc,
      primary: shouldUseWebm(webmSrc) ? webmSrc : mp4Source
    }
  }

  return {
    isSafari,
    supportsWebm,
    shouldUseWebm,
    getVideoSources
  }
}
