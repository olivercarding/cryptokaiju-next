// src/components/pages/BlogPostPageClient.tsx
'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, User, Share2, Tag, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import RichTextRenderer from '@/components/blog/RichTextRenderer'
import BlogCard from '@/components/blog/BlogCard'
import type { BlogPost } from '@/lib/contentful'

interface BlogPostPageClientProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export default function BlogPostPageClient({ post, relatedPosts }: BlogPostPageClientProps) {
  const { title, excerpt, content, featuredImage, author, publishDate, readingTime, tags } = post.fields

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
          title,
          text: excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback to copying URL
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        alert('URL copied to clipboard!')
      }
    }
  }

  return (
    <main className="text-kaiju-navy overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16">
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,theme(colors.kaiju-pink/20)_0%,transparent_50%)]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-white hover:text-kaiju-pink transition-colors font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(publishDate)}
              </div>
              {readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {readingTime} min read
                </div>
              )}
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {author}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              {title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              {excerpt}
            </p>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="flex items-center gap-1 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm hover:bg-white/20 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share Button */}
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share Article
            </motion.button>
          </motion.article>
        </div>
      </section>

      {/* Featured Image */}
      {featuredImage && (
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-8">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src={`https:${featuredImage.fields.file?.url}?w=1200&h=600&fit=fill`}
                alt={featuredImage.fields.title || title}
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-gray-100"
          >
            <RichTextRenderer content={content} />
          </motion.div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-kaiju-navy mb-8 text-center">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <BlogCard key={relatedPost.sys.id} post={relatedPost} index={index} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </main>
  )
}