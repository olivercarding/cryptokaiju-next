// src/components/shared/PolaroidCard.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface PolaroidCardProps {
  step: number
  title: string
  description: string
  imageSrc: string
  backgroundColor: string
  rotation?: string
  size?: 'small' | 'medium' | 'large'
}

export default function PolaroidCard({
  step,
  title,
  description,
  imageSrc,
  backgroundColor,
  rotation = '0deg',
  size = 'medium'
}: PolaroidCardProps) {
  
  const sizeConfig = {
    small: {
      container: 'w-[240px] sm:w-[260px]',
      imageHeight: 'h-36',
      imageSize: 100,
      textSize: 'text-lg',
      descSize: 'text-xs'
    },
    medium: {
      container: 'w-[280px] sm:w-[300px]',
      imageHeight: 'h-48',
      imageSize: 120,
      textSize: 'text-xl',
      descSize: 'text-sm'
    },
    large: {
      container: 'w-[320px] sm:w-[340px]',
      imageHeight: 'h-56',
      imageSize: 140,
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
      className={`relative ${config.container} bg-kaiju-white border-[3px] border-kaiju-light-gray rounded-[18px] pt-6 pb-8 px-5 shadow-xl hover:shadow-2xl transition-shadow duration-300`}
    >
      {/* Step badge */}
      <span className="absolute -top-4 -left-4 w-10 h-10 flex items-center justify-center rounded-full bg-kaiju-white border-[3px] border-kaiju-light-gray text-lg font-bold z-10">
        {step}
      </span>

      {/* Image area */}
      <div
        className={`${config.imageHeight} w-full mb-6 rounded-[10px] flex items-center justify-center overflow-hidden ${backgroundColor}`}
      >
        <Image
          src={imageSrc}
          alt={title}
          width={config.imageSize}
          height={config.imageSize}
          className="object-contain"
        />
      </div>

      {/* Text content */}
      <div className="text-center">
        <h3 className={`${config.textSize} font-extrabold mb-2 uppercase tracking-tight text-kaiju-navy`}>
          {title}
        </h3>
        <p className={`${config.descSize} text-kaiju-navy/70 leading-relaxed`}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}