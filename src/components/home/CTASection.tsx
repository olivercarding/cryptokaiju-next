// src/components/home/CTASection.tsx
'use client'

import { motion } from 'framer-motion'

interface CTASectionProps {
  title?: string
  subtitle?: string
  buttonText?: string
  stats?: {
    priceLabel: string
    price: string
    countLabel: string
    count: string | number
  }
  onAction?: () => void
  variant?: 'mystery' | 'standard'
}

export default function CTASection({
  title = "Ready to Discover Your Kaiju?",
  subtitle = "Every mystery box is a surprise. Will you uncover a rare vinyl figure or a cuddly plush companion?",
  buttonText = "Open Mystery Box",
  stats = {
    priceLabel: "Price per Box",
    price: "0.055 ETH",
    countLabel: "Mystery Boxes Left",
    count: 427
  },
  onAction,
  variant = 'mystery'
}: CTASectionProps) {
  
  const variantStyles = {
    mystery: {
      background: 'bg-kaiju-gradient',
      textColor: 'text-white',
      buttonStyle: 'bg-white text-kaiju-pink'
    },
    standard: {
      background: 'bg-kaiju-navy',
      textColor: 'text-white',
      buttonStyle: 'bg-kaiju-pink text-white'
    }
  }

  const styles = variantStyles[variant]

  return (
    <section className={`py-24 px-6 ${styles.background} ${styles.textColor}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">
          {title}
        </h2>
        <p className="mb-10 text-white/90 max-w-xl mx-auto">
          {subtitle}
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl mb-10">
          <div className="flex justify-center gap-12 md:gap-24">
            <div className="text-center">
              <p className="text-white/80 text-sm mb-1">{stats.priceLabel}</p>
              <p className="text-2xl font-bold">{stats.price}</p>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-sm mb-1">{stats.countLabel}</p>
              <p className="text-2xl font-bold">{stats.count}</p>
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className={`px-10 py-4 rounded-full ${styles.buttonStyle} font-semibold shadow-xl`}
        >
          {buttonText}
        </motion.button>
      </div>
    </section>
  )
}