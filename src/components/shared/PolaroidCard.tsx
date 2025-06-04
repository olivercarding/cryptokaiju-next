// src/components/shared/PolaroidCard.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

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

  return (
    <motion.div
      style={{ rotate: rotation }}
      whileHover={{ y: -4, rotate: '0deg' }}
      transition={{ duration: 0.3 }}
      className={`relative ${config.container} bg-kaiju-white border-[3px] border-kaiju-light-gray rounded-[18px] pt-6 pb-6 px-4 shadow-xl hover:shadow-2xl transition-shadow duration-300`}
    >
      {/* Step badge */}
      <span className="absolute -top-4 -left-4 w-12 h-12 flex items-center justify-center rounded-full bg-kaiju-white border-[3px] border-kaiju-light-gray text-lg font-bold z-10 shadow-lg">
        {step}
      </span>

      {/* Large Video/Media area - takes up most of the card */}
      <div
        className={`${config.videoHeight} w-full mb-4 rounded-[12px] overflow-hidden ${backgroundColor} relative`}
      >
        {mediaType === 'video' ? (
          <video
            src={mediaSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
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
        
        {/* Optional overlay for better text contrast on videos */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent h-16 rounded-b-[12px]" />
      </div>

      {/* Compact text content */}
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