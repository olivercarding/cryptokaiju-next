// src/components/pages/BlogPostPageClient.tsx
'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowLeft, Share2, Tag, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import Header from '@/components/layout/Header'
import RichTextRenderer from '@/components/blog/RichTextRenderer'
import BlogCard from '@/components/blog/BlogCard'
import Gallery from '@/components/blog/Gallery'
import type { BlogPost, ImageGallery } from '@/lib/contentful'
import { toStringValue, toStringArray, isValidDocument, getAssetUrl, getAssetTitle, extractLocalizedValue } from '@/lib/contentful'

interface BlogPostPageClientProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export default function BlogPostPageClient({ post, relatedPosts }: BlogPostPageClientProps) {
  const [shareUrl, setShareUrl] = useState('')

  // Safely extract fields from the post
  const fields = post.fields
  const titleStr = toStringValue(fields.title)
  const excerptStr = toStringValue(fields.excerpt)
  const authorStr = toStringValue(fields.author)
  const publishDateStr = toStringValue(fields.publishDate)
  const slugStr = toStringValue(fields.slug)
  const tagsArray = toStringArray(fields.tags)
  const readingTimeNum = fields.readingTime ? Number(fields.readingTime) : undefined

  // Extract galleries from the post
  const galleries: ImageGallery[] = []
  if (fields.galleries) {
    // Handle localized gallery references
    const galleryData = extractLocalizedValue(fields.galleries)
    if (Array.isArray(galleryData)) {
      galleries.push(...galleryData.filter(gallery => 
        gallery && 
        gallery.fields && 
        gallery.fields.title && 
        gallery.fields.images &&
        gallery.sys &&
        gallery.sys.contentType &&
        gallery.sys.contentType.sys.id === 'imageGallery'
      ))
    }
  }

  // Set share URL on client side
  useState(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently'
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

  // Replace with your actual Substack URL
  const substackUrl = "https://cryptokaiju.substack.com/subscribe"

  // Validate content before rendering
  if (!isValidDocument(fields.content)) {
    return (
      <>
        <Header />
        <main className="text-kaiju-navy overflow-x-hidden">
          <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy pt-32 lg:pt-40 pb-16 lg:pb-20">
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
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
              
              <h1 className="text-4xl font-bold text-white mb-6">
                Content Error
              </h1>
              <p className="text-white/90 mb-8">
                This blog post content is not properly formatted. Please check the Contentful entry.
              </p>
              <Link
                href="/blog"
                className="bg-kaiju-pink text-white px-6 py-3 rounded-xl hover:bg-kaiju-red transition-colors font-medium"
              >
                Back to Blog
              </Link>
            </div>
          </section>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        {/* Dark Hero Section */}
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20">
          {/* Animated background elements */}
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
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Tags */}
              {tagsArray && tagsArray.length > 0 && (
                <div className="flex justify-center flex-wrap gap-2 mb-6">
                  {tagsArray.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-kaiju-pink/20 text-kaiju-pink px-3 py-1 rounded-full text-sm font-medium border border-kaiju-pink/30"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                {titleStr}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
                {excerptStr}
              </p>

              {/* Meta Information */}
              <div className="flex justify-center flex-wrap items-center gap-6 text-white/80 mb-6">
                {authorStr && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{authorStr}</span>
                  </div>
                )}
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

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4" />
                Share Article
              </button>
            </motion.div>
          </div>
        </section>

        {/* Light Content Section */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Featured Image */}
            {fields.featuredImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-12"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={getAssetUrl(fields.featuredImage, { w: 1200, h: 600, fit: 'fill' }) || ''}
                    alt={getAssetTitle(fields.featuredImage) || titleStr}
                    width={1200}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </motion.div>
            )}

            {/* Article Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border-2 border-gray-100 mb-16"
            >
              {/* Render Galleries before main content */}
              {galleries.length > 0 && (
                <div className="mb-8">
                  {galleries.map((gallery, index) => (
                    <Gallery key={gallery.sys.id || index} gallery={gallery} />
                  ))}
                </div>
              )}

              <div className="prose prose-lg prose-kaiju max-w-none">
                <RichTextRenderer content={fields.content} />
              </div>
            </motion.article>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold text-kaiju-navy mb-8 text-center">
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

            {/* Substack Newsletter CTA */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-r from-kaiju-navy to-kaiju-purple-dark rounded-3xl p-8 md:p-12 text-center text-white shadow-xl"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Stay Updated with CryptoKaiju
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Get the latest news, insights, and stories delivered to your inbox via our Substack newsletter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto items-center">
                <p className="text-white/80 text-sm">
                  Join our community of crypto collectors and enthusiasts
                </p>
                <a
                  href={substackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-kaiju-pink hover:bg-kaiju-red px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap"
                >
                  Subscribe on Substack
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-white/60 text-sm mt-4">
                Free • No spam • Unsubscribe anytime
              </p>
            </motion.section>
          </div>
        </section>
      </main>
    </>
  )
}