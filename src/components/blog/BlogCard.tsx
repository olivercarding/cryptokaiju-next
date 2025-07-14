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
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-kaiju-pink/30"
    >
      {/* Featured Image */}
      {fields.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={getAssetUrl(fields.featuredImage, { w: 600, h: 300, fit: 'fill' }) || ''}
            alt={getAssetTitle(fields.featuredImage) || titleStr}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <div className="p-6">
        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(publishDateStr)}
          </div>
          {readingTimeNum && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readingTimeNum} min read
            </div>
          )}
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {authorStr}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-kaiju-navy mb-3 group-hover:text-kaiju-pink transition-colors leading-tight">
          {titleStr}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
          {excerptStr}
        </p>

        {/* Tags */}
        {tagsArray && tagsArray.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tagsArray.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-kaiju-light-pink text-kaiju-navy px-2 py-1 rounded-full text-xs font-medium"
              >
                <Tag className="w-3 h-3" />
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
          className="inline-flex items-center gap-2 text-kaiju-pink hover:text-kaiju-red font-semibold group-hover:gap-3 transition-all duration-300"
        >
          Read More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  )
}