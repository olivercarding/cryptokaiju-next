'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import CrossBrowserVideo from './CrossBrowserVideo'

interface VideoPolaroidCardProps {
  step: number
  title: string
  description: string
  mediaSrc: string
  mediaType?: 'image' | 'video'
  backgroundColor: string
  rotation?: string
  size?: 'small' | 'medium' | 'large'
}

export default function VideoPolaroidCard({
  step,
  title,
  description,
  mediaSrc,
  mediaType = 'video',
  backgroundColor,
  rotation = '0deg',
  size = 'medium'
}: VideoPolaroidCardProps) {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true })
  const [shouldPlay, setShouldPlay] = useState(false)
  const [isSafari, setIsSafari] = useState(false)

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

  // Detect Safari
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const safariDetected = userAgent.includes('safari') && !userAgent.includes('chrome')
    setIsSafari(safariDetected)
  }, [])

  // Handle play timing
  useEffect(() => {
    if (isInView && mediaType === 'video') {
      const delayMap: { [key: number]: number } = {
        1: 0,
        2: 3000,
        3: 4000
      }

      const delay = delayMap[step] ?? 0

      const timeout = setTimeout(() => {
        setShouldPlay(true)
      }, delay)

      return () => clearTimeout(timeout)
    }
  }, [isInView, step, mediaType])

  // Convert WebM to MP4 for Safari compatibility
  const getVideoSources = (src: string) => {
    const basePath = src.replace(/\.[^/.]+$/, "") // Remove extension
    return {
      webm: src.endsWith('.webm') ? src : `${basePath}.webm`,
      mp4: src.endsWith('.mp4') ? src : `${basePath}.mp4`
    }
  }

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
        className={`${config.videoHeight} w-full mb-4 rounded-[12px] overflow-hidden relative`}
        style={{
          // Force background color for Safari
          background: isSafari ? 
            `linear-gradient(135deg, var(--color-kaiju-light-pink), var(--color-kaiju-purple-light))` : 
            undefined
        }}
      >
        {/* Background color layer - always visible */}
        <div 
          className={`absolute inset-0 ${backgroundColor} ${isSafari ? 'opacity-100' : ''}`}
          style={{
            // Fallback colors for Safari
            backgroundColor: isSafari ? 
              (backgroundColor.includes('pink') ? '#fff0f2' : 
               backgroundColor.includes('purple') ? '#e8d5ff' : 
               backgroundColor.includes('navy') ? '#f0f4f8' : '#fff0f2') : 
              undefined
          }}
        />

        {/* Video/Image content */}
        <div className="relative z-10 w-full h-full">
          {mediaType === 'video' ? (
            <CrossBrowserVideo
              webmSrc={getVideoSources(mediaSrc).webm}
              mp4Src={getVideoSources(mediaSrc).mp4}
              className="w-full h-full object-cover"
              autoPlay={shouldPlay}
              onCanPlay={() => console.log(`Video ${step} can play`)}
            />
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
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent h-16 rounded-b-[12px] z-20" />
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