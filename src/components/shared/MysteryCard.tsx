// src/components/shared/MysteryCard.tsx
'use client'

import { motion } from 'framer-motion'

interface MysteryCardProps {
  type: string
  backgroundColor: string
  isRevealed?: boolean
  revealedName?: string
  revealedPower?: string
  revealedImage?: string
  size?: 'small' | 'medium' | 'large'
}

export default function MysteryCard({
  type,
  backgroundColor,
  isRevealed = false,
  revealedName,
  revealedPower,
  revealedImage,
  size = 'medium'
}: MysteryCardProps) {
  
  const sizeConfig = {
    small: {
      container: 'h-48 md:h-56',
      questionSize: 'text-2xl',
      imageSize: 80,
      nameSize: 'text-base',
      powerSize: 'text-xs'
    },
    medium: {
      container: 'h-40',
      questionSize: 'text-4xl',
      imageSize: 120,
      nameSize: 'text-lg',
      powerSize: 'text-sm'
    },
    large: {
      container: 'h-56 md:h-64',
      questionSize: 'text-5xl',
      imageSize: 160,
      nameSize: 'text-xl',
      powerSize: 'text-base'
    }
  }

  const config = sizeConfig[size]

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-kaiju-white border-[2px] border-kaiju-light-gray rounded-2xl shadow-lg overflow-hidden transition"
    >
      <div className={`${backgroundColor} ${config.container} flex items-center justify-center relative`}>
        {isRevealed && revealedImage ? (
          <motion.img
            src={revealedImage}
            alt={revealedName || 'Revealed Kaiju'}
            width={config.imageSize}
            height={config.imageSize}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-24 h-24 bg-black/20 rounded-lg flex items-center justify-center">
            <motion.span 
              className={`${config.questionSize} text-kaiju-navy/40`}
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ?
            </motion.span>
          </div>
        )}
        
        {/* Mystery overlay effect */}
        {!isRevealed && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"
            animate={{
              opacity: [0, 0.3, 0],
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
      </div>
      
      <div className="p-5 text-center">
        {isRevealed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className={`${config.nameSize} font-bold mb-1 text-kaiju-navy`}>
              {revealedName}
            </h3>
            <p className={`${config.powerSize} text-kaiju-navy/70`}>
              Special Power: {revealedPower}
            </p>
          </motion.div>
        ) : (
          <>
            <h3 className={`${config.nameSize} font-bold mb-1 text-kaiju-navy`}>
              {type}
            </h3>
            <p className={`${config.powerSize} text-kaiju-navy/70`}>
              Reveal to discover traits
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}