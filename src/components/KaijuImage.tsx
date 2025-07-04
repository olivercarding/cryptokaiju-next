// src/components/KaijuImage.tsx
'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface KaijuImageProps {
  src?: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  onError?: () => void
  ipfsHash?: string
  openSeaImageUrl?: string
  openSeaDisplayUrl?: string
}

const KaijuImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  fill = false,
  priority = false,
  onError,
  ipfsHash,
  openSeaImageUrl,
  openSeaDisplayUrl,
  ...props
}: KaijuImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)
  const [failedSources, setFailedSources] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Build fallback chain
  const buildImageSources = useCallback(() => {
    const sources: string[] = []
    
    // Primary source
    if (src && !failedSources.has(src)) {
      sources.push(src)
    }
    
    // OpenSea sources
    if (openSeaDisplayUrl && !failedSources.has(openSeaDisplayUrl)) {
      sources.push(openSeaDisplayUrl)
    }
    if (openSeaImageUrl && !failedSources.has(openSeaImageUrl)) {
      sources.push(openSeaImageUrl)
    }
    
    // IPFS sources through our proxy
    if (ipfsHash && !failedSources.has(`/api/ipfs/${ipfsHash}`)) {
      sources.push(`/api/ipfs/${ipfsHash}`)
    }
    
    // Static fallback
    if (!failedSources.has('/images/placeholder-kaiju.png')) {
      sources.push('/images/placeholder-kaiju.png')
    }
    
    // Ultimate fallback - inline SVG
    sources.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTI3LjYxNCA1MCAxNTAgNzIuMzg1OCAxNTAgMTAwQzE1MCAxMjcuNjE0IDEyNy42MTQgMTUwIDEwMCAxNTBDNzIuMzg1OCAxNTAgNTAgMTI3LjYxNCA1MCAxMDBDNTAgNzIuMzg1OCA3Mi4zODU4IDUwIDEwMCA1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K')
    
    return sources
  }, [src, openSeaDisplayUrl, openSeaImageUrl, ipfsHash, failedSources])

  // Initialize current source
  if (!currentSrc && !isLoading) {
    const sources = buildImageSources()
    if (sources.length > 0) {
      setCurrentSrc(sources[0])
      setIsLoading(true)
    }
  }

  const handleError = useCallback(() => {
    console.log(`❌ Image failed to load: ${currentSrc}`)
    
    if (currentSrc) {
      setFailedSources(prev => new Set([...prev, currentSrc]))
    }
    
    const sources = buildImageSources()
    const nextSource = sources.find(source => !failedSources.has(source) && source !== currentSrc)
    
    if (nextSource) {
      console.log(`🔄 Trying fallback image: ${nextSource}`)
      setCurrentSrc(nextSource)
    } else {
      console.log(`⚠️ All image sources exhausted`)
      setIsLoading(false)
      onError?.()
    }
  }, [currentSrc, failedSources, buildImageSources, onError])

  const handleLoad = useCallback(() => {
    console.log(`✅ Image loaded successfully: ${currentSrc}`)
    setIsLoading(false)
  }, [currentSrc])

  // Initialize first source
  if (!currentSrc) {
    const sources = buildImageSources()
    if (sources.length > 0) {
      setCurrentSrc(sources[0])
    }
  }

  if (!currentSrc) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">No Image</div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10"
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </motion.div>
      )}
      
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        onLoadingComplete={handleLoad}
        sizes={fill ? "100vw" : undefined}
        {...props}
      />
    </div>
  )
}

export default KaijuImage   