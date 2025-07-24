// src/components/blog/EnhancedRichTextRenderer.tsx
'use client'

import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types'
import type { Document, Node } from '@contentful/rich-text-types'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Quote, Play, ShoppingCart, Sparkles, Eye, Calendar, Award } from 'lucide-react'
import Gallery from './Gallery'
import { 
  isValidDocument, 
  isValidImageGallery, 
  isValidProductShowcase, 
  isValidVideoEmbed, 
  isValidSocialEmbed,
  toStringValue,
  toStringArray,
  getAssetUrl,
  getAssetTitle
} from '@/lib/contentful'
import type { 
  ImageGallery, 
  ProductShowcase, 
  VideoEmbed, 
  SocialEmbed 
} from '@/lib/contentful'

interface EnhancedRichTextRendererProps {
  content: Document
}

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Helper function to extract Vimeo video ID
function getVimeoVideoId(url: string): string | null {
  const regex = /(?:vimeo\.com\/)([0-9]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Product Showcase Component
function ProductShowcaseBlock({ product }: { product: ProductShowcase }) {
  const fields = product.fields
  const name = toStringValue(fields.name)
  const description = toStringValue(fields.description)
  const price = toStringValue(fields.price)
  const mintPrice = toStringValue(fields.mintPrice)
  const status = toStringValue(fields.status)
  const mintUrl = toStringValue(fields.mintUrl)
  const collectionName = toStringValue(fields.collectionName)
  const rarity = toStringValue(fields.rarity)
  const edition = toStringValue(fields.edition)
  const specifications = toStringArray(fields.specifications)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'minting': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sold-out': return 'bg-red-100 text-red-800 border-red-200'
      case 'coming-soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available Now'
      case 'minting': return 'Minting Live'
      case 'sold-out': return 'Sold Out'
      case 'coming-soon': return 'Coming Soon'
      default: return status
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8 bg-gradient-to-br from-white to-kaiju-light-pink border-2 border-kaiju-pink/20 rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Product Image */}
        <div className="relative bg-gradient-to-br from-kaiju-navy/5 to-kaiju-purple-light/5">
          {fields.image && (
            <div className="aspect-square relative">
              <Image
                src={getAssetUrl(fields.image, { w: 600, h: 600, fit: 'fill' }) || ''}
                alt={getAssetTitle(fields.image) || name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(status)}`}>
              {status === 'minting' && <Sparkles className="w-4 h-4" />}
              {status === 'available' && <Eye className="w-4 h-4" />}
              {status === 'sold-out' && <Award className="w-4 h-4" />}
              {status === 'coming-soon' && <Calendar className="w-4 h-4" />}
              {getStatusText(status)}
            </span>
          </div>

          {/* Collection Badge */}
          {collectionName && (
            <div className="absolute top-4 right-4">
              <span className="bg-kaiju-navy/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                {collectionName}
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-kaiju-navy mb-2">{name}</h3>
                {rarity && (
                  <span className="inline-block bg-kaiju-pink/10 text-kaiju-pink px-2 py-1 rounded-full text-sm font-medium mb-3">
                    {rarity} Rarity
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>

            {/* Specifications */}
            {specifications.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-kaiju-navy mb-3">Features:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-kaiju-pink rounded-full" />
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edition Info */}
            {edition && (
              <div className="mb-6">
                <span className="text-sm text-gray-500">Edition: </span>
                <span className="font-medium text-kaiju-navy">{edition}</span>
              </div>
            )}
          </div>

          {/* Pricing and Actions */}
          <div className="space-y-4">
            {/* Prices */}
            <div className="flex flex-wrap items-center gap-4">
              {price && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">Market Price</div>
                  <div className="text-xl font-bold text-kaiju-navy">{price}</div>
                </div>
              )}
              {mintPrice && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">Mint Price</div>
                  <div className="text-xl font-bold text-kaiju-pink">{mintPrice}</div>
                </div>
              )}
            </div>

            {/* Action Button */}
            {mintUrl && status !== 'sold-out' && (
              <a
                href={mintUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  status === 'available' || status === 'minting'
                    ? 'bg-kaiju-pink hover:bg-kaiju-red text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                {...(status === 'coming-soon' ? { 'aria-disabled': true } : {})}
              >
                <ShoppingCart className="w-5 h-5" />
                {status === 'available' ? 'Buy Now' : 
                 status === 'minting' ? 'Mint Now' : 
                 status === 'coming-soon' ? 'Coming Soon' : 'View Details'}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Video Embed Component
function VideoEmbedBlock({ video }: { video: VideoEmbed }) {
  const fields = video.fields
  const title = toStringValue(fields.title)
  const videoUrl = toStringValue(fields.videoUrl)
  const description = toStringValue(fields.description)
  const autoplay = fields.autoplay || false

  // Extract video ID and create embed URL
  let embedUrl = ''
  const youtubeId = getYouTubeVideoId(videoUrl)
  const vimeoId = getVimeoVideoId(videoUrl)

  if (youtubeId) {
    embedUrl = `https://www.youtube.com/embed/${youtubeId}${autoplay ? '?autoplay=1' : ''}`
  } else if (vimeoId) {
    embedUrl = `https://player.vimeo.com/video/${vimeoId}${autoplay ? '?autoplay=1' : ''}`
  }

  if (!embedUrl) {
    return (
      <div className="my-8 p-6 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600">Invalid video URL. Please use YouTube or Vimeo links.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100">
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        
        {/* Video Info */}
        {(title || description) && (
          <div className="p-6">
            {title && (
              <h3 className="text-xl font-bold text-kaiju-navy mb-2 flex items-center gap-2">
                <Play className="w-5 h-5 text-kaiju-pink" />
                {title}
              </h3>
            )}
            {description && (
              <p className="text-gray-700 leading-relaxed">{description}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Social Embed Component
function SocialEmbedBlock({ social }: { social: SocialEmbed }) {
  const fields = social.fields
  const platform = toStringValue(fields.platform)
  const embedUrl = toStringValue(fields.embedUrl)
  const caption = toStringValue(fields.caption)
  const showCaption = fields.showCaption !== false

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100">
        {/* Platform Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-kaiju-pink rounded-full" />
            <span className="font-medium text-gray-700 capitalize">{platform} Post</span>
          </div>
        </div>
        
        {/* Embed Container */}
        <div className="p-6">
          {platform === 'twitter' && (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: `<blockquote class="twitter-tweet"><a href="${embedUrl}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>` 
              }} 
            />
          )}
          
          {platform === 'instagram' && (
            <div className="flex justify-center">
              <iframe
                src={`${embedUrl}/embed`}
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
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-kaiju-pink hover:text-kaiju-red font-medium"
              >
                View on {platform}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
          
          {/* Caption */}
          {showCaption && caption && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700 italic">{caption}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function EnhancedRichTextRenderer({ content }: EnhancedRichTextRendererProps) {
  // Validate content before rendering
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
        // Check for alignment data in the node
        const alignment = node.data?.align || 'left'
        const alignmentClass = alignment === 'center' ? 'text-center' : 
                              alignment === 'right' ? 'text-right' : 
                              alignment === 'justify' ? 'text-justify' : 'text-left'
        
        return (
          <p className={`mb-6 leading-relaxed text-gray-700 text-lg ${alignmentClass}`}>
            {children}
          </p>
        )
      },
      [BLOCKS.HEADING_1]: (node: Node, children: React.ReactNode) => {
        const alignment = node.data?.align || 'left'
        const alignmentClass = alignment === 'center' ? 'text-center' : 
                              alignment === 'right' ? 'text-right' : 'text-left'
        
        return (
          <h1 className={`text-4xl font-bold text-kaiju-navy mb-8 mt-12 leading-tight ${alignmentClass}`}>
            {children}
          </h1>
        )
      },
      [BLOCKS.HEADING_2]: (node: Node, children: React.ReactNode) => {
        const alignment = node.data?.align || 'left'
        const alignmentClass = alignment === 'center' ? 'text-center' : 
                              alignment === 'right' ? 'text-right' : 'text-left'
        
        return (
          <h2 className={`text-3xl font-bold text-kaiju-navy mb-6 mt-10 leading-tight ${alignmentClass}`}>
            {children}
          </h2>
        )
      },
      [BLOCKS.HEADING_3]: (node: Node, children: React.ReactNode) => {
        const alignment = node.data?.align || 'left'
        const alignmentClass = alignment === 'center' ? 'text-center' : 
                              alignment === 'right' ? 'text-right' : 'text-left'
        
        return (
          <h3 className={`text-2xl font-bold text-kaiju-navy mb-4 mt-8 leading-tight ${alignmentClass}`}>
            {children}
          </h3>
        )
      },
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
      [BLOCKS.QUOTE]: (node: Node, children: React.ReactNode) => {
        const alignment = node.data?.align || 'left'
        const alignmentClass = alignment === 'center' ? 'mx-auto' : 
                              alignment === 'right' ? 'ml-auto' : ''
        
        return (
          <motion.blockquote
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`border-l-4 border-kaiju-pink bg-kaiju-light-pink p-6 my-8 rounded-r-lg max-w-2xl ${alignmentClass}`}
          >
            <div className="flex items-start gap-3">
              <Quote className="w-6 h-6 text-kaiju-pink mt-1 flex-shrink-0" />
              <div className="text-kaiju-navy font-medium italic text-lg leading-relaxed">
                {children}
              </div>
            </div>
          </motion.blockquote>
        )
      },
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

          // Handle unresolved asset links
          if (asset.sys && asset.sys.type === 'Link') {
            return (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-6">
                <p className="text-gray-600">Asset is not fully loaded</p>
              </div>
            )
          }

          const { file, title, description } = asset.fields
          const isImage = file?.contentType?.startsWith('image/')
          
          // Get alignment from node data
          const alignment = node.data?.align || 'center'
          
          if (isImage && file?.url) {
            const alignmentClass = alignment === 'left' ? 'mr-auto' : 
                                 alignment === 'right' ? 'ml-auto' : 'mx-auto'
            
            const wrapperClass = alignment === 'left' ? 'float-left mr-6 mb-4' :
                               alignment === 'right' ? 'float-right ml-6 mb-4' : ''
            
            return (
              <motion.figure
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`my-8 ${wrapperClass}`}
              >
                <div className={`relative rounded-xl overflow-hidden shadow-lg bg-gray-100 ${alignmentClass} ${alignment === 'left' || alignment === 'right' ? 'max-w-md' : 'max-w-3xl'}`}>
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
      [BLOCKS.EMBEDDED_ENTRY]: (node: Node) => {
        try {
          const entry = node.data?.target
          if (!entry?.fields) {
            return (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-6">
                <p className="text-gray-600">Embedded content could not be loaded</p>
              </div>
            )
          }

          const contentType = entry.sys?.contentType?.sys?.id
          
          // Handle different embedded content types
          if (contentType === 'imageGallery' && isValidImageGallery(entry)) {
            return <Gallery gallery={entry} />
          }
          
          if (contentType === 'productShowcase' && isValidProductShowcase(entry)) {
            return <ProductShowcaseBlock product={entry} />
          }
          
          if (contentType === 'videoEmbed' && isValidVideoEmbed(entry)) {
            return <VideoEmbedBlock video={entry} />
          }
          
          if (contentType === 'socialEmbed' && isValidSocialEmbed(entry)) {
            return <SocialEmbedBlock social={entry} />
          }
          
          if (contentType === 'blogpost') {
            const { title, excerpt, slug } = entry.fields
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8 p-6 bg-gradient-to-r from-kaiju-light-pink to-white border-2 border-kaiju-pink/30 rounded-xl"
              >
                <h4 className="text-lg font-bold text-kaiju-navy mb-2">
                  Related Article:
                </h4>
                <h5 className="text-xl font-bold text-kaiju-navy mb-3">
                  {title}
                </h5>
                {excerpt && (
                  <p className="text-gray-700 mb-4">{excerpt}</p>
                )}
                {slug && (
                  <Link
                    href={`/blog/${slug}`}
                    className="text-kaiju-pink hover:text-kaiju-red font-medium inline-flex items-center gap-1"
                  >
                    Read More <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            )
          }
          
          // Default embedded entry fallback
          return (
            <div className="my-8 p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
              <p className="text-gray-600">Embedded content ({contentType || 'unknown type'})</p>
            </div>
          )
        } catch (error) {
          console.error('Error rendering embedded entry:', error)
          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-6">
              <p className="text-red-600">Error loading embedded content</p>
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
      [INLINES.ENTRY_HYPERLINK]: (node: Node, children: React.ReactNode) => {
        try {
          const entry = node.data?.target
          const slug = entry?.fields?.slug
          
          if (!slug) return <span>{children}</span>
          
          return (
            <Link
              href={`/blog/${slug}`}
              className="text-kaiju-pink hover:text-kaiju-red font-medium underline"
            >
              {children}
            </Link>
          )
        } catch (error) {
          console.error('Error rendering entry hyperlink:', error)
          return <span className="text-gray-500">{children}</span>
        }
      },
      [INLINES.ASSET_HYPERLINK]: (node: Node, children: React.ReactNode) => {
        try {
          const asset = node.data?.target
          const file = asset?.fields?.file
          
          if (!file?.url) return <span>{children}</span>
          
          return (
            <a
              href={`https:${file.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-kaiju-pink hover:text-kaiju-red font-medium underline inline-flex items-center gap-1"
            >
              {children}
              <ExternalLink className="w-3 h-3" />
            </a>
          )
        } catch (error) {
          console.error('Error rendering asset hyperlink:', error)
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