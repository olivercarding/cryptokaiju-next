// src/components/pages/BatchDetailPageClient.tsx
'use client'

import { useEffect, useState, useRef, type ReactNode } from 'react'
import type { ComponentType } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  Package,
  Database,
  Star,
  Palette,
  Ruler,
  Calendar,
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  Share2,
  ZoomIn,
  X,
  Camera,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types'
import type { Document as ContentfulDocument } from '@contentful/rich-text-types'
import Header from '@/components/layout/Header'
import { type LocalKaijuBatch } from '@/lib/contentful'

interface BatchDetailPageClientProps {
  batch: LocalKaijuBatch
}

/* Helpers */

const withOrdinal = (n: number) => {
  const v = n % 100
  if (v >= 11 && v <= 13) return `${n}th`
  switch (n % 10) {
    case 1: return `${n}st`
    case 2: return `${n}nd`
    case 3: return `${n}rd`
    default: return `${n}th`
  }
}

const formatDiscoveryDate = (input: string | Date) => {
  if (!input) return ''
  const raw = typeof input === 'string' ? input.trim() : input.toString()
  const normalized = typeof input === 'string' ? raw.replace(/\./g, '-').split('T')[0] : raw
  const d = new Date(normalized)
  if (isNaN(d.getTime())) return String(input)
  const day = withOrdinal(d.getDate())
  const month = d.toLocaleString('en-GB', { month: 'long' })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

/* Contentful rich text */

const richTextOptions: any = {
  renderMark: {
    [MARKS.BOLD]: (text: ReactNode) => <strong className="font-bold text-kaiju-navy">{text}</strong>,
    [MARKS.ITALIC]: (text: ReactNode) => <em className="italic text-kaiju-purple-dark">{text}</em>,
    [MARKS.UNDERLINE]: (text: ReactNode) => <u className="underline decoration-kaiju-pink">{text}</u>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: any, children: ReactNode) => (
      <p className="text-kaiju-navy/80 leading-7">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (_n: any, c: ReactNode) => <h1 className="text-3xl font-bold text-kaiju-navy mb-6 mt-8">{c}</h1>,
    [BLOCKS.HEADING_2]: (_n: any, c: ReactNode) => <h2 className="text-2xl font-bold text-kaiju-navy mb-4 mt-6">{c}</h2>,
    [BLOCKS.HEADING_3]: (_n: any, c: ReactNode) => <h3 className="text-xl font-semibold text-kaiju-navy mb-3 mt-4">{c}</h3>,
    [BLOCKS.UL_LIST]: (_n: any, c: ReactNode) => (
      <ul className="mb-4 list-disc list-outside pl-6 text-kaiju-navy/80 [&>li]:mb-2 [&>li>p]:m-0">
        {c}
      </ul>
    ),
    [BLOCKS.OL_LIST]: (_n: any, c: ReactNode) => (
      <ol className="mb-4 list-decimal list-outside pl-6 text-kaiju-navy/80 [&>li]:mb-2 [&>li>p]:m-0">
        {c}
      </ol>
    ),
    [BLOCKS.LIST_ITEM]: (_n: any, c: ReactNode) => (
      <li className="leading-relaxed">{c}</li>
    ),
    [BLOCKS.QUOTE]: (_n: any, c: ReactNode) => (
      <blockquote className="border-l-4 border-kaiju-pink pl-4 italic text-kaiju-navy/70 my-6 bg-kaiju-light-pink/30 py-4 rounded-r-lg">{c}</blockquote>
    ),
    [INLINES.HYPERLINK]: (node: any, children: ReactNode) => (
      <a href={node.data.uri} className="text-kaiju-pink hover:text-kaiju-red underline transition-colors" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
}

const renderContent = (content: string | ContentfulDocument) =>
  typeof content === 'string'
    ? <p className="text-kaiju-navy/80 leading-7 whitespace-pre-line">{content}</p>
    : documentToReactComponents(content as ContentfulDocument, richTextOptions)

/* Lightbox */

function Lightbox(props: {
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
  onNavigate: (direction: 'prev' | 'next') => void
  onJumpTo: (index: number) => void
}) {
  const { isOpen, onClose, images, currentIndex, onNavigate, onJumpTo } = props

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate('prev')
      if (e.key === 'ArrowRight') onNavigate('next')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, onNavigate])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-kaiju-pink transition-colors z-10">
          <X className="w-8 h-8" />
        </button>

        <div className="relative max-w-6xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
          <Image src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} width={1600} height={1200} className="w-full max-h-[70vh] object-contain" />

          {images.length > 1 && (
            <>
              <button onClick={() => onNavigate('prev')}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={() => onNavigate('next')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="mt-4 max-h-28 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-2">
                  {images.map((src, i) => (
                    <button key={i} onClick={() => onJumpTo(i)}
                      className={`relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border ${i === currentIndex ? 'border-kaiju-pink' : 'border-white/20'}`}>
                      <Image src={src} alt={`thumb ${i + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
                {currentIndex + 1} of {images.length}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* Hero image gallery */

function HeroImageGallery(props: {
  images: string[]
  title: string
  kind?: 'physical' | 'nft'
  onImageClick: (index: number) => void
}) {
  const { images, title, kind, onImageClick } = props
  const [currentIndex, setCurrentIndex] = useState(0)
  if (!images || images.length === 0) return null
  const labelKind = kind ?? 'physical'
  const countLabel = images.length === 1 ? '1 image' : `${images.length} images`

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 cursor-zoom-in overflow-hidden group"
        onClick={() => onImageClick(currentIndex)}>
        <Image src={images[currentIndex]} alt={`${title} ${currentIndex + 1}`} fill sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => (p - 1 + images.length) % images.length) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => (p + 1) % images.length) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold text-white ${labelKind === 'nft' ? 'bg-kaiju-pink' : 'bg-kaiju-navy'}`}>
          {labelKind === 'nft' ? 'Digital NFT' : 'Physical Product'}
        </div>
      </div>

      <div className="text-center">
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-sm text-white/70">Click to zoom • {countLabel}</p>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button key={index} onClick={() => setCurrentIndex(index)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${index === currentIndex ? 'border-kaiju-pink' : 'border-gray-200 hover:border-gray-300'}`}>
              <Image src={image} alt={`${title} thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* Inline images */

function InlineImageGallery(props: {
  images: string[]
  title: string
  onImageClick: (index: number) => void
  startIndex?: number
}) {
  const { images, title, onImageClick, startIndex = 0 } = props
  if (!images || images.length === 0) return null

  return (
    <div className="my-8">
      <h4 className="text-lg font-semibold text-kaiju-navy mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-kaiju-pink" />
        {title}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.slice(0, 6).map((image, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
            onClick={() => onImageClick(startIndex + index)}>
            <Image src={image} alt={`${title} ${index + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>
      {images.length > 6 && (
        <p className="text-sm text-kaiju-navy/60 mt-2">Showing 6 of {images.length} images • View all in Gallery tab</p>
      )}
    </div>
  )
}

/* Rarity badge */

function RarityBadge({ rarity }: { rarity: string }) {
  const rarityStyles: Record<string, string> = {
    Common: 'bg-green-100 text-green-800 border-green-200',
    Rare: 'bg-blue-100 text-blue-800 border-blue-200',
    'Ultra Rare': 'bg-purple-100 text-purple-800 border-purple-200',
    Legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  }
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${rarityStyles[rarity] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      <Star className="w-4 h-4" />
      {rarity}
    </span>
  )
}

/* InfoCard */

function InfoCard(props: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: ReactNode
  className?: string
}) {
  const { icon: Icon, title, children, className = '' } = props
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-kaiju-pink/10 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-kaiju-pink" />
        </div>
        <h3 className="font-bold text-kaiju-navy">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.div>
  )
}

/* Page */

type Category = 'physical' | 'nft' | 'lifestyle' | 'detail' | 'concept' | 'packaging'

export default function BatchDetailPageClient({ batch }: BatchDetailPageClientProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'specifications' | 'gallery'>('story')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showStickyCTA, setShowStickyCTA] = useState(false)

  const heroRef = useRef<HTMLDivElement | null>(null)
  const isHeroInView = useInView(heroRef, { once: true })

  const nftImages = Array.isArray(batch.images.nft) ? batch.images.nft : batch.images.nft ? [batch.images.nft] : []

  const allPhotos: { src: string; category: Category }[] = [
    ...batch.images.physical.map((src) => ({ src, category: 'physical' as Category })),
    ...nftImages.map((src) => ({ src, category: 'nft' as Category })),
    ...batch.images.lifestyle.map((src) => ({ src, category: 'lifestyle' as Category })),
    ...batch.images.detail.map((src) => ({ src, category: 'detail' as Category })),
    ...batch.images.concept.map((src) => ({ src, category: 'concept' as Category })),
    ...batch.images.packaging.map((src) => ({ src, category: 'packaging' as Category })),
  ]

  const allCategories: Category[] = ['physical', 'nft', 'lifestyle', 'detail', 'concept', 'packaging']
  const [enabledCats, setEnabledCats] = useState<Set<Category>>(new Set(allCategories))
  const toggleCat = (cat: Category) => {
    setEnabledCats((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }
  const filteredPhotos = allPhotos.filter((m) => enabledCats.has(m.category))

  const openLightbox = (images: string[], startIndex = 0) => {
    setLightboxImages(images)
    setLightboxIndex(startIndex)
    setLightboxOpen(true)
  }
  const navigateLightbox = (direction: 'prev' | 'next') => {
    setLightboxIndex((prev) => {
      if (lightboxImages.length === 0) return prev
      return direction === 'prev' ? (prev - 1 + lightboxImages.length) % lightboxImages.length : (prev + 1) % lightboxImages.length
    })
  }

  const tabs: { id: 'story' | 'specifications' | 'gallery'; label: string; icon: ComponentType<{ className?: string }> }[] = [
    { id: 'story', label: 'Story & Lore', icon: Sparkles },
    { id: 'specifications', label: 'Specifications', icon: Package },
    { id: 'gallery', label: 'Complete Gallery', icon: Eye },
  ]

  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Header />

      <main className="text-kaiju-navy">
        {/* Hero */}
        <section ref={heroRef} className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-24 lg:pt-32 pb-16">
          <div className="absolute inset-0">
            <motion.div className="absolute inset-0 bg-gradient-to-br from-kaiju-pink/10 via-transparent to-transparent"
              animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={isHeroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }} className="mb-8">
              <Link href="/kaijudex" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Kaijudex
              </Link>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Physical images */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={isHeroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="order-2 lg:col-span-4">
                <HeroImageGallery images={batch.images.physical} title="Physical Product" kind="physical"
                  onImageClick={(index) => openLightbox(batch.images.physical, index)} />
              </motion.div>

              {/* Info column */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={isHeroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}
                className="order-1 lg:col-span-4 space-y-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-kaiju-pink font-mono font-bold">#{batch.id}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${batch.availability === 'Mintable' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {batch.availability === 'Mintable' ? 'Available' : 'Secondary Only'}
                    </span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 handwritten">{batch.name}</h1>
                  <p className="text-2xl text-kaiju-pink font-semibold italic mb-6">"{batch.essence}"</p>

                  {batch.marketing?.tagline && <p className="text-lg text-white/90 font-medium mb-6">{batch.marketing.tagline}</p>}

                  <div className="mb-6">
                    <RarityBadge rarity={batch.rarity} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-kaiju-pink text-sm font-medium">Type</div>
                    <div className="text-white text-lg font-bold">{batch.type}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-kaiju-pink text-sm font-medium">Supply</div>
                    <div className="text-white text-lg font-bold">~{batch.estimatedSupply}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {batch.secondaryMarketUrl && (
                    <a href={batch.secondaryMarketUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <ExternalLink className="w-5 h-5" />
                      View on OpenSea
                    </a>
                  )}

                  <button className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-all">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </motion.div>

              {/* NFT images */}
              {nftImages.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 30 }} animate={isHeroInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }} className="order-3 lg:col-span-4">
                  <HeroImageGallery images={nftImages} title="Digital NFT" kind="nft"
                    onImageClick={(index) => openLightbox(nftImages, index)} />
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap gap-2 mb-12 bg-white rounded-xl p-2 shadow-lg border border-gray-100">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id ? 'bg-kaiju-pink text-white shadow-lg' : 'text-kaiju-navy hover:bg-kaiju-pink/10'}`}>
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="min-h-[500px]">
              {activeTab === 'story' && (
                <motion.div key="story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                  className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <InfoCard icon={Sparkles} title="Character Story">
                    <div className="prose prose-kaiju max-w-none prose-p:my-5 prose-p:leading-7 prose-ul:my-6 prose-ol:my-6">
                    {renderContent(batch.characterDescription)}</div>
                      {batch.images.lifestyle.length > 0 && (
                        <InlineImageGallery images={batch.images.lifestyle} title="Character in Action"
                          onImageClick={(index) => openLightbox(batch.images.lifestyle, index)} />
                      )}
                    </InfoCard>

                    <InfoCard icon={Package} title="Physical Design">
                    <div className="prose prose-kaiju max-w-none prose-p:my-5 prose-p:leading-7 prose-ul:my-6 prose-ol:my-6">
                    {renderContent(batch.physicalDescription)}</div>
                      {batch.images.detail.length > 0 && (
                        <InlineImageGallery images={batch.images.detail} title="Design Details"
                          onImageClick={(index) => openLightbox(batch.images.detail, index)} />
                      )}
                    </InfoCard>

                    {batch.habitat && (
                      <InfoCard icon={Globe} title="Habitat">
                        <div className="prose prose-kaiju max-w-none prose-p:my-5 prose-p:leading-7 prose-ul:my-6 prose-ol:my-6">
                        {renderContent(batch.habitat)}</div>
                        {batch.images.concept.length > 0 && (
                          <InlineImageGallery images={batch.images.concept} title="Concept Art & Production"
                            onImageClick={(index) => openLightbox(batch.images.concept, index)} />
                        )}
                      </InfoCard>
                    )}
                  </div>

                  <div className="space-y-6">
                    {batch.series?.isPartOfSeries && (
                      <InfoCard icon={Database} title="Series Information">
                        <div>
                          <p className="font-semibold text-kaiju-navy mb-2">{batch.series.name}</p>
                          {batch.series.position && <p className="text-sm text-kaiju-navy/70 mb-3">Position #{batch.series.position}</p>}
                          {batch.series.description && <div className="text-sm">{renderContent(batch.series.description)}</div>}
                        </div>
                      </InfoCard>
                    )}

                    {batch.colors.length > 0 && (
                      <InfoCard icon={Palette} title="Colours">
                        <div className="flex flex-wrap gap-2">
                          {batch.colors.map((color, index) => (
                            <span key={index} className="bg-kaiju-navy/10 text-kaiju-navy px-3 py-1 rounded-full text-sm font-medium">{color}</span>
                          ))}
                        </div>
                      </InfoCard>
                    )}

                    <InfoCard icon={Calendar} title="Discovery">
                      <p className="text-kaiju-navy/80">Discovered on {formatDiscoveryDate(batch.discoveredDate)}</p>
                    </InfoCard>
                  </div>
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div key="specifications" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                  className="grid md:grid-cols-2 gap-8">
                  <InfoCard icon={Ruler} title="Technical Specifications">
                    <div className="space-y-3">
                      {batch.materials && (<div><span className="font-medium text-kaiju-navy">Materials:</span><p className="text-kaiju-navy/80">{batch.materials}</p></div>)}
                      {batch.dimensions && (<div><span className="font-medium text-kaiju-navy">Dimensions:</span><p className="text-kaiju-navy/80">{batch.dimensions}</p></div>)}
                      <div><span className="font-medium text-kaiju-navy">Type:</span><p className="text-kaiju-navy/80">{batch.type} Collectible</p></div>
                      <div><span className="font-medium text-kaiju-navy">Estimated Supply:</span><p className="text-kaiju-navy/80">~{batch.estimatedSupply} units</p></div>
                    </div>

                    {batch.images.detail.length > 0 && (
                      <InlineImageGallery images={batch.images.detail} title="Technical Details"
                        onImageClick={(index) => openLightbox(batch.images.detail, index)} />
                    )}
                  </InfoCard>

                  {batch.features && batch.features.length > 0 && (
                    <InfoCard icon={Star} title="Special Features">
                      <ul className="space-y-2">
                        {batch.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-kaiju-pink rounded-full mt-2" />
                            <span className="text-kaiju-navy/80">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </InfoCard>
                  )}

                  {batch.productionNotes && (
                    <InfoCard icon={Package} title="Production Notes" className="md:col-span-2">
                      <div className="prose prose-kaiju max-w-none prose-p:my-5 prose-p:leading-7 prose-ul:my-6 prose-ol:my-6">
                      {renderContent(batch.productionNotes)}</div>
                    </InfoCard>
                  )}

                  {(batch.packagingStyle || batch.images.packaging.length > 0) && (
                    <InfoCard icon={Package} title="Packaging" className="md:col-span-2">
                      {batch.packagingStyle && <p className="text-kaiju-navy/80 mb-4">{batch.packagingStyle}</p>}
                      {batch.images.packaging.length > 0 && (
                        <InlineImageGallery images={batch.images.packaging} title="Packaging Photography"
                          onImageClick={(index) => openLightbox(batch.images.packaging, index)} />
                      )}
                    </InfoCard>
                  )}
                </motion.div>
              )}

              {activeTab === 'gallery' && (
                <motion.div key="gallery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                  className="space-y-12">
                  {batch.images.physical.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-3">
                        <div className="w-4 h-4 bg-kaiju-navy rounded-full" />
                        Physical Product ({batch.images.physical.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {batch.images.physical.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gray-100 shadow-lg hover:shadow-xl transition-shadow"
                            onClick={() => openLightbox(batch.images.physical, index)}>
                            <Image src={image} alt={`Physical product ${index + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {nftImages.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-kaiju-navy mb-6 flex items-center gap-3">
                        <div className="w-4 h-4 bg-kaiju-pink rounded-full" />
                        Digital NFT ({nftImages.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {nftImages.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gradient-to-br from-kaiju-pink/10 to-kaiju-purple-light/10 shadow-lg hover:shadow-xl transition-shadow"
                            onClick={() => openLightbox(nftImages, index)}>
                            <Image src={image} alt={`NFT ${index + 1}`} fill className="object-contain p-4 transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* All Photos, now below the information section */}
{allPhotos.length > 0 && (
  <section className="py-14 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-kaiju-navy flex items-center gap-2">
          <Eye className="w-5 h-5" /> All Photos
        </h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCat(cat)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${
              enabledCats.has(cat)
                ? 'bg-kaiju-pink text-white border-kaiju-pink'
                : 'bg-white text-kaiju-navy border-gray-200'
            }`}
            title={cat}
          >
            <Filter className="w-3.5 h-3.5" /> {cat}
          </button>
        ))}
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        {filteredPhotos.map((m, i) => (
          <div key={`${m.src}-${i}`} className="mb-4 break-inside-avoid">
            <button
              onClick={() => {
                const current = filteredPhotos.map((x) => x.src)
                const startIndex = current.findIndex((s) => s === m.src)
                openLightbox(current, Math.max(0, startIndex))
              }}
              className="relative w-full overflow-hidden rounded-xl bg-gray-100 shadow hover:shadow-lg transition-shadow"
            >
              <Image
                src={m.src}
                alt={`${batch.name} ${m.category}`}
                width={900}
                height={900}
                className="w-full h-auto object-cover"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
)}

        {/* Sticky CTA */}
        {showStickyCTA && (
          <div className="fixed bottom-4 inset-x-0 px-4 z-40">
            <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-200 p-3 flex items-center justify-center gap-3">
              <Link href="/kaijudex" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-kaiju-navy text-white font-semibold hover:opacity-90">
                <Database className="w-4 h-4" /> Browse all designs
              </Link>
              {batch.secondaryMarketUrl && (
                <a href={batch.secondaryMarketUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-kaiju-pink text-white font-semibold hover:opacity-90">
                  <ExternalLink className="w-4 h-4" /> View on OpenSea
                </a>
              )}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <section className="bg-kaiju-navy py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Discover More CryptoKaiju</h2>
              <p className="text-white/90 text-lg">Explore our complete collection of unique connected collectibles</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/kaijudex" className="inline-flex items-center gap-3 bg-white text-kaiju-navy font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Database className="w-5 h-5" />
                  Browse All Designs
                </Link>
                <Link href="/#mint" className="inline-flex items-center gap-3 bg-kaiju-pink text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Package className="w-5 h-5" />
                  Get Mystery Box
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Lightbox */}
        <Lightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onNavigate={navigateLightbox}
          onJumpTo={(i) => setLightboxIndex(i)}
        />
      </main>
    </>
  )
}
