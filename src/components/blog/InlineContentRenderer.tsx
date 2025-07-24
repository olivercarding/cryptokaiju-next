// src/components/blog/InlineContentRenderer.tsx
'use client'

import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types'
import type { Document, Node } from '@contentful/rich-text-types'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Quote, Play, ShoppingCart, Sparkles, Eye, Calendar, Award, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { useState } from 'react'
import { isValidDocument, getAssetUrl, getAssetTitle } from '@/lib/contentful'

interface InlineContentRendererProps {
  content: Document
}

// Helper functions
function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/.test(url)
}

function isVimeoUrl(url: string): boolean {
  return /(?:vimeo\.com\/)([0-9]+)/.test(url)
}

function isTwitterUrl(url: string): boolean {
  return /twitter\.com\/\w+\/status\/\d+/.test(url) || /x\.com\/\w+\/status\/\d+/.test(url)
}

function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/p\/[\w-]+/.test(url)
}

function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

function getVimeoVideoId(url: string): string | null {
  const regex = /(?:vimeo\.com\/)([0-9]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Product showcase parser
function parseProductShowcase(text: string) {
  // Look for pattern: [PRODUCT: Name | Description | Price | Status | URL]
  const productRegex = /\[PRODUCT:\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|\s*([^\]]*)\s*\]/gi
  const match = productRegex.exec(text)
  
  if (match) {
    return {
      name: match[1].trim(),
      description: match[2].trim(),
      price: match[3].trim() || undefined,
      status: match[4].trim() || 'available',
      url: match[5].trim() || undefined
    }
  }
  return null
}

// Auto Gallery Component (detects multiple consecutive images)
function AutoGallery({ images, style = 'grid' }: { images: any[], style?: string }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const galleryImages = images.map((asset, index) => ({
    url: getAssetUrl(asset, { w: 800, h: 600, fit: 'fill' }) || '',
    originalUrl: getAssetUrl(asset, { w: 1200, h: 900, fit: 'fill' }) || '',
    title: getAssetTitle(asset) || `Image ${index + 1}`,
    asset
  })).filter(img => img.url)

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxIndex(index)
  }

  const closeLightbox = () => setLightboxIndex(-1)
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)

  if (galleryImages.length <= 1) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8"
    >
      <div className={`grid gap-4 ${
        style === 'two-column' ? 'grid-cols-1 md:grid-cols-2' : 
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {galleryImages.map((image, index) => (
          <div
            key={index}
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
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-kaiju-pink transition-colors">
            <X className="w-8 h-8" />
          </button>
          
          {galleryImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 text-white hover:text-kaiju-pink transition-colors">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 text-white hover:text-kaiju-pink transition-colors">
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={galleryImages[currentImageIndex]?.originalUrl || ''}
              alt={galleryImages[currentImageIndex]?.title || 'Gallery image'}
              width={1200}
              height={800}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Inline Video Component
function InlineVideo({ url, title }: { url: string, title?: string }) {
  const youtubeId = getYouTubeVideoId(url)
  const vimeoId = getVimeoVideoId(url)
  
  let embedUrl = ''
  if (youtubeId) {
    embedUrl = `https://www.youtube.com/embed/${youtubeId}`
  } else if (vimeoId) {
    embedUrl = `https://player.vimeo.com/video/${vimeoId}`
  }

  if (!embedUrl) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100">
        <div className="relative aspect-video bg-black">
          <iframe
            src={embedUrl}
            title={title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        {title && (
          <div className="p-4">
            <h3 className="text-lg font-bold text-kaiju-navy flex items-center gap-2">
              <Play className="w-5 h-5 text-kaiju-pink" />
              {title}
            </h3>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Inline Product Showcase
function InlineProductShowcase({ product }: { product: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'minting': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sold-out': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8 bg-gradient-to-br from-white to-kaiju-light-pink border-2 border-kaiju-pink/20 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-kaiju-navy mb-2">{product.name}</h3>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(product.status)}`}>
            <Sparkles className="w-4 h-4" />
            {product.status === 'available' ? 'Available Now' : product.status}
          </span>
        </div>
        {product.price && (
          <div className="text-right">
            <div className="text-xl font-bold text-kaiju-pink">{product.price}</div>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

      {product.url && (
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-kaiju-pink hover:bg-kaiju-red text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          <ShoppingCart className="w-5 h-5" />
          Buy Now
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  )
}

// Inline Social Embed
function InlineSocialEmbed({ url, platform }: { url: string, platform: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-kaiju-pink rounded-full" />
            <span className="font-medium text-gray-700 capitalize">{platform} Post</span>
          </div>
        </div>
        
        <div className="p-6">
          {platform === 'twitter' && (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>` 
              }} 
            />
          )}
          
          {platform === 'instagram' && (
            <div className="flex justify-center">
              <iframe
                src={`${url}/embed`}
                width="400"
                height="480"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                className="max-w-full"
              />
            </div>
          )}
          
          {(platform === 'discord' || platform === 'tiktok') && (
            <div className="text-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-kaiju-pink hover:text-kaiju-red font-medium"
              >
                View on {platform}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function InlineContentRenderer({ content }: InlineContentRendererProps) {
  if (!isValidDocument(content)) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        <p className="font-semibold">Content Error</p>
        <p className="text-sm">The content for this article is not properly formatted.</p>
      </div>
    )
  }

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => (
        <strong className="font-bold text-kaiju-navy">{text}</strong>
      ),
      [MARKS.ITALIC]: (text: React.ReactNode) => (
        <em className="italic">{text}</em>
      ),
      [MARKS.UNDERLINE]: (text: React.ReactNode) => (
        <u className="underline">{text}</u>
      ),
      [MARKS.CODE]: (text: React.ReactNode) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-kaiju-pink">
          {text}
        </code>
      ),
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: Node, children: React.ReactNode) => {
        // Check if paragraph contains special patterns
        const textContent = (node as any).content
          ?.map((child: any) => child.value || '')
          .join('') || ''

        // Check for product showcase pattern
        const productData = parseProductShowcase(textContent)
        if (productData) {
          return <InlineProductShowcase product={productData} />
        }

        // Check for video URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const urls = textContent.match(urlRegex) || []
        
        for (const url of urls) {
          if (isYouTubeUrl(url) || isVimeoUrl(url)) {
            return <InlineVideo url={url} title="Video" />
          }
          
          if (isTwitterUrl(url)) {
            return <InlineSocialEmbed url={url} platform="twitter" />
          }
          
          if (isInstagramUrl(url)) {
            return <InlineSocialEmbed url={url} platform="instagram" />
          }
        }

        return (
          <p className="mb-6 leading-relaxed text-gray-700 text-lg">
            {children}
          </p>
        )
      },
      [BLOCKS.HEADING_1]: (node: Node, children: React.ReactNode) => (
        <h1 className="text-4xl font-bold text-kaiju-navy mb-8 mt-12 leading-tight">
          {children}
        </h1>
      ),
      [BLOCKS.HEADING_2]: (node: Node, children: React.ReactNode) => (
        <h2 className="text-3xl font-bold text-kaiju-navy mb-6 mt-10 leading-tight">
          {children}
        </h2>
      ),
      [BLOCKS.HEADING_3]: (node: Node, children: React.ReactNode) => (
        <h3 className="text-2xl font-bold text-kaiju-navy mb-4 mt-8 leading-tight">
          {children}
        </h3>
      ),
      [BLOCKS.HEADING_4]: (node: Node, children: React.ReactNode) => (
        <h4 className="text-xl font-bold text-kaiju-navy mb-4 mt-6 leading-tight">
          {children}
        </h4>
      ),
      [BLOCKS.HEADING_5]: (node: Node, children: React.ReactNode) => (
        <h5 className="text-lg font-bold text-kaiju-navy mb-3 mt-6 leading-tight">
          {children}
        </h5>
      ),
      [BLOCKS.HEADING_6]: (node: Node, children: React.ReactNode) => (
        <h6 className="text-base font-bold text-kaiju-navy mb-3 mt-4 leading-tight">
          {children}
        </h6>
      ),
      [BLOCKS.UL_LIST]: (node: Node, children: React.ReactNode) => (
        <ul className="mb-6 space-y-2 list-disc list-inside text-gray-700">
          {children}
        </ul>
      ),
      [BLOCKS.OL_LIST]: (node: Node, children: React.ReactNode) => (
        <ol className="mb-6 space-y-2 list-decimal list-inside text-gray-700">
          {children}
        </ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: Node, children: React.ReactNode) => (
        <li className="mb-2 leading-relaxed">
          {children}
        </li>
      ),
      [BLOCKS.QUOTE]: (node: Node, children: React.ReactNode) => (
        <motion.blockquote
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="border-l-4 border-kaiju-pink bg-kaiju-light-pink p-6 my-8 rounded-r-lg max-w-2xl"
        >
          <div className="flex items-start gap-3">
            <Quote className="w-6 h-6 text-kaiju-pink mt-1 flex-shrink-0" />
            <div className="text-kaiju-navy font-medium italic text-lg leading-relaxed">
              {children}
            </div>
          </div>
        </motion.blockquote>
      ),
      [BLOCKS.HR]: () => (
        <hr className="border-t-2 border-gray-200 my-12" />
      ),
      [BLOCKS.EMBEDDED_ASSET]: (node: Node) => {
        try {
          const asset = node.data?.target
          if (!asset?.fields) {
            return (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-6">
                <p className="text-gray-600">Asset could not be loaded</p>
              </div>
            )
          }

          if (asset.sys && asset.sys.type === 'Link') {
            return (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-6">
                <p className="text-gray-600">Asset is not fully loaded</p>
              </div>
            )
          }

          const { file, title, description } = asset.fields
          const isImage = file?.contentType?.startsWith('image/')
          
          if (isImage && file?.url) {
            // Individual images (auto-gallery detection simplified for TypeScript compatibility)
            return (
              <motion.figure
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8"
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 max-w-3xl mx-auto">
                  <Image
                    src={`https:${file.url}?w=800&fit=pad&bg=rgb:ffffff`}
                    alt={title || description || 'Blog image'}
                    width={800}
                    height={0}
                    style={{ height: 'auto', maxHeight: '500px', objectFit: 'contain' }}
                    className="w-full h-auto"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                  />
                </div>
                {(title || description) && (
                  <figcaption className="text-center text-sm text-gray-600 mt-3 italic">
                    {title || description}
                  </figcaption>
                )}
              </motion.figure>
            )
          }
          
          // For non-image assets
          if (file?.url) {
            return (
              <div className="my-8 p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-600">
                  📎 Attachment: <strong>{title || 'Download'}</strong>
                </p>
                <a
                  href={`https:${file.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kaiju-pink hover:text-kaiju-red font-medium inline-flex items-center gap-1 mt-2"
                >
                  Download <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )
          }

          return (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-6">
              <p className="text-gray-600">Asset could not be loaded</p>
            </div>
          )
        } catch (error) {
          console.error('Error rendering embedded asset:', error)
          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-6">
              <p className="text-red-600">Error loading asset</p>
            </div>
          )
        }
      },
      [INLINES.HYPERLINK]: (node: Node, children: React.ReactNode) => {
        try {
          const uri = node.data?.uri
          if (!uri) return <span>{children}</span>
          
          const isExternal = uri.startsWith('http')
          
          if (isExternal) {
            return (
              <a
                href={uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kaiju-pink hover:text-kaiju-red font-medium underline inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink className="w-3 h-3" />
              </a>
            )
          }
          
          return (
            <Link
              href={uri}
              className="text-kaiju-pink hover:text-kaiju-red font-medium underline"
            >
              {children}
            </Link>
          )
        } catch (error) {
          console.error('Error rendering hyperlink:', error)
          return <span className="text-gray-500">{children}</span>
        }
      },
    },
  }

  try {
    return (
      <div className="prose prose-lg max-w-none">
        {documentToReactComponents(content, options)}
      </div>
    )
  } catch (error) {
    console.error('Error rendering rich text content:', error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Content Rendering Error</h3>
        <p className="text-red-700">
          There was an error rendering this content. Please check the Contentful entry format.
        </p>
      </div>
    )
  }
}