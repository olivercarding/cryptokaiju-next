// src/components/blog/BlogCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowRight, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/lib/contentful'
import { toStringValue, toStringArray, getAssetUrl, getAssetTitle } from '@/lib/contentful'

interface BlogCardProps {
  post: BlogPost
  index: number
}

export default function BlogCard({ post, index }: BlogCardProps) {
  const fields = post.fields

  // Convert Contentful field types to strings
  const titleStr = toStringValue(fields.title)
  const excerptStr = toStringValue(fields.excerpt)
  const authorStr = toStringValue(fields.author)
  const publishDateStr = toStringValue(fields.publishDate)
  const slugStr = toStringValue(fields.slug)
  const tagsArray = toStringArray(fields.tags)
  const readingTimeNum = fields.readingTime ? Number(fields.readingTime) : undefined

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-kaiju-pink/30 h-full flex flex-col"
    >
      {/* Featured Image */}
      {fields.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={getAssetUrl(fields.featuredImage, { w: 600, h: 300, fit: 'fill' }) || ''}
            alt={getAssetTitle(fields.featuredImage) || titleStr}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Tags on Image */}
          {tagsArray && tagsArray.length > 0 && (
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1 bg-kaiju-pink text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                <Tag className="w-3 h-3" />
                {tagsArray[0]}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{formatDate(publishDateStr)}</span>
          </div>
          {readingTimeNum && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{readingTimeNum} min</span>
            </div>
          )}
          {authorStr && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{authorStr}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-kaiju-navy mb-3 group-hover:text-kaiju-pink transition-colors leading-tight line-clamp-2 flex-shrink-0">
          {titleStr}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3 flex-1">
          {excerptStr}
        </p>

        {/* Additional Tags (if more than one) */}
        {tagsArray && tagsArray.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tagsArray.slice(1, 3).map(tag => (
              <span
                key={tag}
                className="inline-block bg-kaiju-light-pink text-kaiju-navy px-2 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {tagsArray.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{tagsArray.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Read More Link */}
        <Link
          href={`/blog/${slugStr}`}
          className="inline-flex items-center gap-2 text-kaiju-pink hover:text-kaiju-red font-bold group-hover:gap-3 transition-all duration-300 mt-auto"
        >
          Read Full Article
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  )
}