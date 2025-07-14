// src/components/pages/BlogPostPageClient.tsx
'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowLeft, Share2, Tag, Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import RichTextRenderer from '@/components/blog/RichTextRenderer'
import BlogCard from '@/components/blog/BlogCard'
import type { BlogPost } from '@/lib/contentful'
import { toStringValue, toStringArray, isValidDocument } from '@/lib/contentful'

interface BlogPostPageClientProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export default function BlogPostPageClient({ post, relatedPosts }: BlogPostPageClientProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  // Safely extract fields from the post
  const {
    title,
    excerpt,
    content,
    featuredImage,
    author,
    publishDate,
    readingTime,
    tags,
    slug
  } = post.fields

  // Convert Contentful field types to strings/arrays
  const titleStr = toStringValue(title)
  const excerptStr = toStringValue(excerpt)
  const authorStr = toStringValue(author)
  const publishDateStr = toStringValue(publishDate)
  const slugStr = toStringValue(slug)
  const tagsArray = toStringArray(tags)
  const readingTimeNum = readingTime ? Number(readingTime) : undefined

  // Set share URL on client side
  useState(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: titleStr,
          text: excerptStr,
          url: shareUrl,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      // You could show a toast notification here
    }
  }

  // Validate content before rendering
  if (!isValidDocument(content)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
        <main className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-kaiju-navy mb-6">
              Content Error
            </h1>
            <p className="text-gray-600 mb-8">
              This blog post content is not properly formatted. Please check the Contentful entry.
            </p>
            <Link
              href="/blog"
              className="bg-kaiju-pink text-white px-6 py-3 rounded-xl hover:bg-kaiju-red transition-colors font-medium"
            >
              Back to Blog
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back to Blog Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-kaiju-navy hover:text-kaiju-pink transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            {/* Tags */}
            {tagsArray && tagsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tagsArray.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-kaiju-pink/20 text-kaiju-navy px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-kaiju-navy mb-6 leading-tight">
              {titleStr}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              {excerptStr}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{authorStr}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(publishDateStr)}</span>
              </div>
              {readingTimeNum && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{readingTimeNum} min read</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-colors ${
                  isLiked
                    ? 'bg-kaiju-pink text-white border-kaiju-pink'
                    : 'bg-white text-kaiju-navy border-gray-200 hover:border-kaiju-pink'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-kaiju-navy hover:border-kaiju-pink transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </motion.header>

          {/* Featured Image */}
          {featuredImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={`https:${featuredImage.fields.file?.url}?w=1200&h=600&fit=fill`}
                  alt={toStringValue(featuredImage.fields.title) || titleStr}
                  width={1200}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </motion.div>
          )}

          {/* Article Content */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <article className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-gray-100">
              <RichTextRenderer content={content} />
            </article>
          </motion.section>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold text-kaiju-navy mb-8">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <BlogCard
                    key={relatedPost.sys.id}
                    post={relatedPost}
                    index={index}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Newsletter CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-kaiju-navy to-kaiju-purple-dark rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Stay Updated with CryptoKaiju
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Get the latest news, insights, and stories delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-kaiju-navy focus:outline-none focus:ring-2 focus:ring-kaiju-pink"
              />
              <button className="bg-kaiju-pink hover:bg-kaiju-red px-6 py-3 rounded-xl font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}