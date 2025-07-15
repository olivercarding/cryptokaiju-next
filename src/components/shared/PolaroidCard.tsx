// src/components/shared/PolaroidCard.tsx
'use client'

// This component is used to display a polaroid-style card with an image or video

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { useVideoFormat } from '@/lib/hooks/useVideoFormat'

interface VideoPolaroidCardProps {
  step: number
  title: string
  description: string
  mediaSrc: string
  mediaType?: 'image' | 'video'
  backgroundColor: string
  rotation?: string
  size?: 'small' | 'medium' | 'large'
  mp4Fallback?: string // Optional mp4 fallback path
}

export default function VideoPolaroidCard({
  step,
  title,
  description,
  mediaSrc,
  mediaType = 'video',
  backgroundColor,
  rotation = '0deg',
  size = 'medium',
  mp4Fallback
}: VideoPolaroidCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true })
  const { getVideoSources, isSafari } = useVideoFormat()

  const sizeConfig = {
    small: {
      container: 'w-[280px] sm:w-[300px]',
      videoHeight: 'h-72',
      textPadding: 'p-4',
      textSize: 'text-lg',
      descSize: 'text-sm'
    },
    medium: {
      container: 'w-[320px] sm:w-[340px]',
      videoHeight: 'h-80',
      textPadding: 'p-5',
      textSize: 'text-xl',
      descSize: 'text-sm'
    },
    large: {
      container: 'w-[360px] sm:w-[380px]',
      videoHeight: 'h-96',
      textPadding: 'p-6',
      textSize: 'text-2xl',
      descSize: 'text-base'
    }
  }

  const config = sizeConfig[size]

  // Get video sources based on browser compatibility
  const videoSources = mediaType === 'video' ? getVideoSources(mediaSrc, mp4Fallback) : null

  useEffect(() => {
    if (isInView && mediaType === 'video') {
      const delayMap: { [key: number]: number } = {
        1: 0,
        2: 3000,
        3: 4000
      }

      const delay = delayMap[step] ?? 0

      const timeout = setTimeout(() => {
        videoRef.current?.play().catch(e => {
          console.warn('Video autoplay failed:', e)
        })
      }, delay)

      return () => clearTimeout(timeout)
    }
  }, [isInView, step, mediaType])

  return (
    <motion.div
      ref={containerRef}
      style={{ rotate: rotation }}
      whileHover={{ y: -4, rotate: '0deg' }}
      transition={{ duration: 0.3 }}
      className={`relative ${config.container} bg-kaiju-white border-[3px] border-kaiju-light-gray rounded-[18px] pt-6 pb-6 px-4 shadow-xl hover:shadow-2xl transition-shadow duration-300`}
    >
      <span className="absolute -top-4 -left-4 w-12 h-12 flex items-center justify-center rounded-full bg-kaiju-white border-[3px] border-kaiju-light-gray text-lg font-bold z-10 shadow-lg">
        {step}
      </span>

      <div
        className={`${config.videoHeight} w-full mb-4 rounded-[12px] overflow-hidden ${backgroundColor} relative`}
      >
        {mediaType === 'video' && videoSources ? (
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.warn('Video failed to load, sources:', videoSources)
            }}
          >
            {/* Always put MP4 first for Safari compatibility */}
            <source src={videoSources.mp4} type="video/mp4" />
            {!isSafari && <source src={videoSources.webm} type="video/webm" />}
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image
              src={mediaSrc}
              alt={title}
              width={280}
              height={280}
              className="object-contain max-w-full max-h-full"
            />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent h-16 rounded-b-[12px]" />
      </div>

      <div className={`text-center ${config.textPadding}`}>
        <h3 className={`${config.textSize} font-extrabold mb-2 uppercase tracking-tight text-kaiju-navy leading-tight`}>
          {title}
        </h3>
        <p className={`${config.descSize} text-kaiju-navy/70 leading-relaxed`}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}