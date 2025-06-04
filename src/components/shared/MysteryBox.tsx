// src/components/shared/MysteryBox.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

interface MysteryBoxProps {
  mysteryDesigns: Array<{
    type: string
    rarity: string
    probability: string
  }>
  size?: 'small' | 'medium' | 'large'
  showBreakdown?: boolean
  className?: string
}

export default function MysteryBox({ 
  mysteryDesigns, 
  size = 'medium', 
  showBreakdown = true,
  className = '' 
}: MysteryBoxProps) {
  const sizeConfig = {
    small: {
      container: 'w-[200px] h-[240px]',
      particleCount: 4,
      particleSize: 'w-1.5 h-1.5',
      questionMarks: 2
    },
    medium: {
      container: 'w-[280px] h-[320px] md:w-[320px] md:h-[360px]',
      particleCount: 6,
      particleSize: 'w-2 h-2',
      questionMarks: 3
    },
    large: {
      container: 'w-[360px] h-[420px] md:w-[400px] md:h-[460px]',
      particleCount: 8,
      particleSize: 'w-3 h-3',
      questionMarks: 4
    }
  }

  const config = sizeConfig[size]

  const [isHovered, setIsHovered] = useState(false)
  const [currentSilhouette, setCurrentSilhouette] = useState(0)
  const [showPeek, setShowPeek] = useState(false)
  const [particlePositions, setParticlePositions] = useState<Array<{top: string, left: string}>>([])
  const [isMounted, setIsMounted] = useState(false)

  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [0, 300], [8, -8])
  const rotateY = useTransform(mouseX, [0, 300], [-8, 8])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSilhouette(prev => (prev + 1) % mysteryDesigns.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [mysteryDesigns.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPeek(true)
      setTimeout(() => setShowPeek(false), 800)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setIsMounted(true)
    const positions = Array.from({ length: config.particleCount }, (_, i) => ({
      top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 150}px`,
      left: `${160 + Math.cos(i * 60 * Math.PI / 180) * 120}px`,
    }))
    setParticlePositions(positions)
  }, [config.particleCount])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) {
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative h-[400px] md:h-[500px] flex items-center justify-center ${className} bg-kaiju-light-pink`}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className={`relative ${config.container}`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {isMounted && particlePositions.map((position, i) => (
          <motion.div
            key={i}
            className={`absolute ${config.particleSize} rounded-full blur-sm`}
            style={{
              top: position.top,
              left: position.left,
              backgroundColor: ['#FF69B4', '#F8CB36', '#C39BD3'][i % 3]
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.6, 1.1, 0.6],
              y: [0, -12, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}

        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          animate={{ scale: isHovered ? [1, 1.05, 1] : 1 }}
          transition={{ scale: { duration: 0.6, repeat: isHovered ? Infinity : 0 } }}
        >
          <div className="absolute bottom-8 w-52 h-8 bg-black/10 rounded-full blur-sm"></div>

          <div className="relative w-48 h-48 bg-[#E33232] border-[3px] border-[#222] shadow-lg">
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-[36px] bg-[#F8CB36] z-10 rounded-sm"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[36px] h-full bg-[#F8CB36] z-10 rounded-sm"></div>

            <motion.div
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-[208px] h-12 bg-[#E33232] border-[3px] border-[#222] shadow-sm z-20"
              animate={isHovered ? { rotate: [0, -2, 2, 0], y: [-1, 1, -1] } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.4 }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSilhouette}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl text-white/60 font-bold"
                >
                  ?
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            className="absolute bottom-0 bg-kaiju-pink px-6 py-3 rounded-full text-white text-sm font-bold shadow-xl border border-kaiju-navy"
            animate={{ opacity: [0.9, 1, 0.9], scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {mysteryDesigns[currentSilhouette]?.probability} chance
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
