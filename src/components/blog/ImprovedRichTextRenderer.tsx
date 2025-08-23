// src/components/blog/ImprovedRichTextRenderer.tsx
'use client'

import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types'
import type { Document, Node } from '@contentful/rich-text-types'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Quote, AlertTriangle, Image as ImageIcon } from 'lucide-react'
import { isValidDocument, getAssetUrl, getAssetTitle, extractLocalizedValue } from '@/lib/contentful'

interface ImprovedRichTextRendererProps {
  content: Document
  className?: string
}

// Helper function to safely extract text content from a node
function getTextContent(node: any): string {
  if (!node) return ''
  
  if (typeof node === 'string') return node
  if (node.value) return node.value
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(getTextContent).join('')
  }
  
  return ''
}

// Safe asset URL getter with fallbacks
function getSafeAssetUrl(asset: any, options?: any): string | null {
  try {
    const url = getAssetUrl(asset, options)
    if (!url) return null
    
    // Ensure HTTPS
    return url.startsWith('//') ? `https:${url}` : url
  } catch (error) {
    console.warn('Failed to get asset URL:', error)
    return null
  }
}

// Error boundary component for individual blocks
function RenderError({ error, type }: { error: string, type: string }) {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="content-error">
        <AlertTriangle className="w-4 h-4 inline mr-2" />
        <strong>Rendering Error ({type}):</strong> {error}
      </div>
    )
  }
  
  return (
    <div className="content-error">
      <AlertTriangle className="w-4 h-4 inline mr-2" />
      Content temporarily unavailable
    </div>
  )
}

// Loading placeholder
function ContentPlaceholder({ height = 'h-6' }: { height?: string }) {
  return <div className={`content-loading ${height}`} />
}

export default function ImprovedRichTextRenderer({ 
  content, 
  className = 'prose prose-lg prose-kaiju max-w-none' 
}: ImprovedRichTextRendererProps) {
  // Validate content
  if (!content) {
    return (
      <div className="content-error">
        <AlertTriangle className="w-4 h-4 inline mr-2" />
        No content provided
      </div>
    )
  }

  if (!isValidDocument(content)) {
    console.error('Invalid document structure:', content)
    return (
      <div className="content-error">
        <AlertTriangle className="w-4 h-4 inline mr-2" />
        Invalid content format. Please check your Contentful entry.
      </div>
    )
  }

  const renderOptions = {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => (
        <strong className="font-bold text-kaiju-navy">{text}</strong>
      ),
      [MARKS.ITALIC]: (text: React.ReactNode) => (
        <em className="italic">{text}</em>
      ),
      [MARKS.UNDERLINE]: (text: React.ReactNode) => (
        <u className="underline decoration-kaiju-pink">{text}</u>
      ),
      [MARKS.CODE]: (text: React.ReactNode) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-kaiju-pink font-semibold">
          {text}
        </code>
      ),
    },

    renderNode: {
      // Paragraphs with better spacing
      [BLOCKS.PARAGRAPH]: (node: Node, children: React.ReactNode) => {
        // Handle empty paragraphs
        const textContent = getTextContent(node)
        if (!textContent.trim()) {
          return <div className="h-4" /> // Spacer for empty paragraphs
        }
        
        return (
          <p className="mb-6 leading-relaxed text-gray-700 text-lg">
            {children}
          </p>
        )
      },

      // Enhanced headings with proper hierarchy
      [BLOCKS.HEADING_1]: (node: Node, children: React.ReactNode) => (
        <h1 className="text-4xl font-black text-kaiju-navy mb-8 mt-12 leading-tight">
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

      // Enhanced lists
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

      // Enhanced blockquotes
      [BLOCKS.QUOTE]: (node: Node, children: React.ReactNode) => (
        <motion.blockquote
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="border-l-4 border-kaiju-pink bg-gradient-to-r from-kaiju-light-pink to-white p-6 my-8 rounded-r-lg max-w-2xl shadow-lg"
        >
          <div className="flex items-start gap-3">
            <Quote className="w-6 h-6 text-kaiju-pink mt-1 flex-shrink-0" />
            <div className="text-kaiju-navy font-medium italic text-lg leading-relaxed">
              {children}
            </div>
          </div>
        </motion.blockquote>
      ),

      // Horizontal rules
      [BLOCKS.HR]: () => (
        <hr className="border-t-2 border-gradient bg-gradient-to-r from-transparent via-kaiju-pink to-transparent my-12 h-0.5 border-0" />
      ),

      // Enhanced asset handling with better error states
      [BLOCKS.EMBEDDED_ASSET]: (node: Node) => {
        try {
          const asset = node.data?.target
          
          if (!asset) {
            return (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 my-6 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Asset not found</p>
              </div>
            )
          }

          // Handle unresolved links
          if (asset.sys && asset.sys.type === 'Link') {
            return (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6 text-center">
                <ImageIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-yellow-800 text-sm">Asset is loading...</p>
              </div>
            )
          }

          const fields = extractLocalizedValue(asset.fields) || asset.fields
          if (!fields) {
            return <RenderError error="Asset has no fields" type="embedded-asset" />
          }

          const file = extractLocalizedValue(fields.file)
          const title = extractLocalizedValue(fields.title) || ''
          const description = extractLocalizedValue(fields.description) || ''
          
          if (!file || !file.url) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-6 text-center">
                <ImageIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-red-800 text-sm">Asset file not available</p>
              </div>
            )
          }

          const isImage = file.contentType?.startsWith('image/')
          const assetUrl = getSafeAssetUrl(asset, { w: 1000, h: 600, fit: 'fill' })
          
          if (isImage && assetUrl) {
            return (
              <motion.figure
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-8"
              >
                <div className="relative rounded-xl overflow-hidden shadow-xl bg-gray-50 max-w-4xl mx-auto">
                  <Image
                    src={assetUrl}
                    alt={title || description || 'Content image'}
                    width={1000}
                    height={600}
                    className="w-full h-auto object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const errorDiv = document.createElement('div')
                      errorDiv.className = 'bg-gray-100 p-8 text-center text-gray-500'
                      errorDiv.innerHTML = '<p>Image failed to load</p>'
                      target.parentNode?.appendChild(errorDiv)
                    }}
                  />
                </div>
                
                {(title || description) && (
                  <figcaption className="text-center text-sm text-gray-600 mt-4 italic max-w-2xl mx-auto">
                    {title || description}
                  </figcaption>
                )}
              </motion.figure>
            )
          }
          
          // Handle non-image assets
          if (file.url) {
            const fileUrl = file.url.startsWith('//') ? `https:${file.url}` : file.url
            
            return (
              <div className="my-8 p-6 border-2 border-gray-200 rounded-xl bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-kaiju-pink rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-kaiju-navy mb-2">
                    {title || 'Download File'}
                  </h3>
                  {description && (
                    <p className="text-gray-600 mb-4">{description}</p>
                  )}
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-kaiju-pink hover:bg-kaiju-red text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Download
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )
          }

          return <RenderError error="Asset could not be processed" type="embedded-asset" />
          
        } catch (error) {
          console.error('Error rendering embedded asset:', error)
          return <RenderError error={error instanceof Error ? error.message : 'Unknown error'} type="embedded-asset" />
        }
      },

      // Enhanced hyperlinks
      [INLINES.HYPERLINK]: (node: Node, children: React.ReactNode) => {
        try {
          const uri = node.data?.uri
          if (!uri) return <span className="text-gray-500">{children}</span>
          
          const isExternal = uri.startsWith('http') && !uri.includes(window.location.hostname)
          
          if (isExternal) {
            return (
              <a
                href={uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kaiju-pink hover:text-kaiju-red font-medium underline decoration-kaiju-pink/30 hover:decoration-kaiju-red transition-colors inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink className="w-3 h-3" />
              </a>
            )
          }
          
          return (
            <Link
              href={uri}
              className="text-kaiju-pink hover:text-kaiju-red font-medium underline decoration-kaiju-pink/30 hover:decoration-kaiju-red transition-colors"
            >
              {children}
            </Link>
          )
        } catch (error) {
          console.error('Error rendering hyperlink:', error)
          return <span className="text-gray-500">{children}</span>
        }
      },

      // Handle entry hyperlinks
      [INLINES.ENTRY_HYPERLINK]: (node: Node, children: React.ReactNode) => {
        try {
          const entry = node.data?.target
          const slug = extractLocalizedValue(entry?.fields?.slug)
          
          if (!slug) return <span className="text-gray-500">{children}</span>
          
          return (
            <Link
              href={`/blog/${slug}`}
              className="text-kaiju-pink hover:text-kaiju-red font-medium underline decoration-kaiju-pink/30 hover:decoration-kaiju-red transition-colors"
            >
              {children}
            </Link>
          )
        } catch (error) {
          console.error('Error rendering entry hyperlink:', error)
          return <span className="text-gray-500">{children}</span>
        }
      },

      // Handle asset hyperlinks
      [INLINES.ASSET_HYPERLINK]: (node: Node, children: React.ReactNode) => {
        try {
          const asset = node.data?.target
          const fields = extractLocalizedValue(asset?.fields)
          const file = extractLocalizedValue(fields?.file)
          
          if (!file?.url) return <span className="text-gray-500">{children}</span>
          
          const fileUrl = file.url.startsWith('//') ? `https:${file.url}` : file.url
          
          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-kaiju-pink hover:text-kaiju-red font-medium underline decoration-kaiju-pink/30 hover:decoration-kaiju-red transition-colors inline-flex items-center gap-1"
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
      <div className={className}>
        {documentToReactComponents(content, renderOptions)}
      </div>
    )
  } catch (error) {
    console.error('Critical error rendering rich text content:', error)
    
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="content-error">
          <h3 className="text-lg font-semibold mb-2">Rich Text Rendering Error</h3>
          <p className="mb-4">There was a critical error rendering this content:</p>
          <pre className="bg-red-100 p-4 rounded text-sm overflow-auto text-left">
            {error instanceof Error ? error.stack : String(error)}
          </pre>
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Content Structure</summary>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto text-left mt-2">
              {JSON.stringify(content, null, 2)}
            </pre>
          </details>
        </div>
      )
    }
    
    return (
      <div className="content-error">
        <AlertTriangle className="w-5 h-5 inline mr-2" />
        This content cannot be displayed at the moment. Please try refreshing the page.
      </div>
    )
  }
}