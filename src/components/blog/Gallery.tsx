// src/components/blog/Gallery.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import type { ImageGallery, Asset } from '@/lib/contentful'
import { toStringValue, toStringArray, toAssetArray, getAssetUrl, getAssetTitle } from '@/lib/contentful'

interface GalleryProps {
  gallery: ImageGallery
  className?: string
}

interface LightboxProps {
  images: Array<{ url: string; title: string }>
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

function Lightbox({ images, currentIndex, isOpen, onClose, onNext, onPrev }: LightboxProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-kaiju-pink transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 text-white hover:text-kaiju-pink transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 text-white hover:text-kaiju-pink transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative max-w-[90vw] max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[currentIndex]?.url || ''}
            alt={images[currentIndex]?.title || 'Gallery image'}
            width={1200}
            height={800}
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
          {images[currentIndex]?.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 text-center">
              {images[currentIndex].title}
            </div>
          )}
        </motion.div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default function Gallery({ gallery, className = '' }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const fields = gallery.fields
  const title = toStringValue(fields.title)
  const galleryStyle = toStringValue(fields.galleryStyle) || 'grid'
  const images = toAssetArray(fields.images)
  const captions = toStringArray(fields.captions)

  // Prepare images for display
  const galleryImages = images.map((asset, index) => ({
    url: getAssetUrl(asset, { w: 800, h: 600, fit: 'fill' }) || '',
    originalUrl: getAssetUrl(asset, { w: 1200, h: 900, fit: 'fill' }) || '',
    title: getAssetTitle(asset) || captions[index] || '',
    asset
  })).filter(img => img.url)

  if (galleryImages.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(-1)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  // Render different gallery styles
  const renderGallery = () => {
    switch (galleryStyle) {
      case 'two-column':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                {image.title && (
                  <p className="mt-2 text-sm text-gray-600 text-center">{image.title}</p>
                )}
              </motion.div>
            ))}
          </div>
        )

      case 'carousel':
        return (
          <div className="relative">
            <div className="overflow-hidden rounded-xl">
              <motion.div
                className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 relative aspect-video cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    <Image
                      src={image.url}
                      alt={image.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Carousel controls */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots indicator */}
                <div className="flex justify-center mt-4 gap-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-kaiju-pink' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Current image caption */}
            {galleryImages[currentImageIndex]?.title && (
              <p className="mt-4 text-center text-gray-600">
                {galleryImages[currentImageIndex].title}
              </p>
            )}
          </div>
        )

      case 'masonry':
        return (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative cursor-pointer break-inside-avoid mb-4"
                onClick={() => openLightbox(index)}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src={image.url}
                    alt={image.title}
                    width={400}
                    height={0}
                    style={{ height: 'auto' }}
                    className="w-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                {image.title && (
                  <p className="mt-2 text-sm text-gray-600">{image.title}</p>
                )}
              </motion.div>
            ))}
          </div>
        )

      case 'grid':
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                {image.title && (
                  <p className="mt-2 text-sm text-gray-600 text-center">{image.title}</p>
                )}
              </motion.div>
            ))}
          </div>
        )
    }
  }

  return (
    <div className={`my-8 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-kaiju-navy mb-4 text-center">
          {title}
        </h3>
      )}
      
      {renderGallery()}

      {/* Lightbox */}
      <Lightbox
        images={galleryImages.map(img => ({ url: img.originalUrl, title: img.title }))}
        currentIndex={currentImageIndex}
        isOpen={lightboxIndex >= 0}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </div>
  )
}