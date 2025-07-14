// src/components/blog/RichTextRenderer.tsx
'use client'

import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types'
import type { Document } from '@contentful/rich-text-types'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Quote } from 'lucide-react'

interface RichTextRendererProps {
  content: Document
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
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
      [BLOCKS.PARAGRAPH]: (node: any, children: React.ReactNode) => (
        <p className="mb-6 leading-relaxed text-gray-700 text-lg">
          {children}
        </p>
      ),
      [BLOCKS.HEADING_1]: (node: any, children: React.ReactNode) => (
        <h1 className="text-4xl font-bold text-kaiju-navy mb-8 mt-12 leading-tight">
          {children}
        </h1>
      ),
      [BLOCKS.HEADING_2]: (node: any, children: React.ReactNode) => (
        <h2 className="text-3xl font-bold text-kaiju-navy mb-6 mt-10 leading-tight">
          {children}
        </h2>
      ),
      [BLOCKS.HEADING_3]: (node: any, children: React.ReactNode) => (
        <h3 className="text-2xl font-bold text-kaiju-navy mb-4 mt-8 leading-tight">
          {children}
        </h3>
      ),
      [BLOCKS.HEADING_4]: (node: any, children: React.ReactNode) => (
        <h4 className="text-xl font-bold text-kaiju-navy mb-4 mt-6 leading-tight">
          {children}
        </h4>
      ),
      [BLOCKS.HEADING_5]: (node: any, children: React.ReactNode) => (
        <h5 className="text-lg font-bold text-kaiju-navy mb-3 mt-6 leading-tight">
          {children}
        </h5>
      ),
      [BLOCKS.HEADING_6]: (node: any, children: React.ReactNode) => (
        <h6 className="text-base font-bold text-kaiju-navy mb-3 mt-4 leading-tight">
          {children}
        </h6>
      ),
      [BLOCKS.UL_LIST]: (node: any, children: React.ReactNode) => (
        <ul className="mb-6 space-y-2 list-disc list-inside text-gray-700">
          {children}
        </ul>
      ),
      [BLOCKS.OL_LIST]: (node: any, children: React.ReactNode) => (
        <ol className="mb-6 space-y-2 list-decimal list-inside text-gray-700">
          {children}
        </ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: any, children: React.ReactNode) => (
        <li className="mb-2 leading-relaxed">
          {children}
        </li>
      ),
      [BLOCKS.QUOTE]: (node: any, children: React.ReactNode) => (
        <motion.blockquote
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="border-l-4 border-kaiju-pink bg-kaiju-light-pink p-6 my-8 rounded-r-lg"
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
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        const { file, title, description } = node.data.target.fields
        const isImage = file.contentType?.startsWith('image/')
        
        if (isImage) {
          return (
            <motion.figure
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="my-8"
            >
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={`https:${file.url}?w=800&h=600&fit=fill`}
                  alt={title || description || 'Blog image'}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
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
        return (
          <div className="my-8 p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
            <p className="text-gray-600">
              📎 Attachment: <strong>{title}</strong>
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
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
        // Handle embedded entries (like other blog posts, CTAs, etc.)
        const contentType = node.data.target.sys.contentType?.sys.id
        
        if (contentType === 'blogPost') {
          const { title, excerpt, slug } = node.data.target.fields
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
              <p className="text-gray-700 mb-4">{excerpt}</p>
              <Link
                href={`/blog/${slug}`}
                className="text-kaiju-pink hover:text-kaiju-red font-medium inline-flex items-center gap-1"
              >
                Read More <ExternalLink className="w-4 h-4" />
              </Link>
            </motion.div>
          )
        }
        
        // Default embedded entry fallback
        return (
          <div className="my-8 p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
            <p className="text-gray-600">Embedded content</p>
          </div>
        )
      },
      [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { uri } = node.data
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
      },
      [INLINES.ENTRY_HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { slug } = node.data.target.fields
        return (
          <Link
            href={`/blog/${slug}`}
            className="text-kaiju-pink hover:text-kaiju-red font-medium underline"
          >
            {children}
          </Link>
        )
      },
      [INLINES.ASSET_HYPERLINK]: (node: any, children: React.ReactNode) => {
        const { file } = node.data.target.fields
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
      },
    },
  }

  return (
    <div className="prose prose-lg max-w-none">
      {documentToReactComponents(content, options)}
    </div>
  )
}