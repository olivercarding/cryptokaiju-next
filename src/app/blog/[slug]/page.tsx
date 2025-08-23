// src/app/blog/[slug]/page.tsx - Use the right renderer
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug } from '@/lib/contentful'
import Header from '@/components/layout/Header'
import EnhancedRichTextRenderer from '@/components/blog/EnhancedRichTextRenderer' // Use the enhanced one
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toStringValue, toStringArray, getAssetUrl, getAssetTitle } from '@/lib/contentful'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug)
  
  if (!post) {
    notFound()
  }

  const fields = post.fields
  const title = toStringValue(fields.title)
  const content = fields.content
  const excerpt = toStringValue(fields.excerpt)
  const author = toStringValue(fields.author)
  const publishDate = toStringValue(fields.publishDate)
  const tags = toStringArray(fields.tags)
  const readingTime = fields.readingTime ? Number(fields.readingTime) : undefined

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Navigation */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-white hover:text-kaiju-pink transition-colors font-mono mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Featured Image */}
          {fields.featuredImage && (
            <div className="relative h-64 md:h-96 mb-8 rounded-2xl overflow-hidden">
              <Image
                src={getAssetUrl(fields.featuredImage, { w: 1200, h: 600, fit: 'fill' }) || ''}
                alt={getAssetTitle(fields.featuredImage) || title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          {/* Article Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {title}
            </h1>
            
            <p className="text-xl text-white/90 mb-6 leading-relaxed max-w-3xl mx-auto">
              {excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
              {author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{author}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(publishDate)}</span>
              </div>
              
              {readingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <article className="prose prose-lg prose-kaiju max-w-none">
            {/* CRITICAL: Use EnhancedRichTextRenderer for best results */}
            {content && <EnhancedRichTextRenderer content={content} />}
          </article>
        </div>
      </section>
    </>
  )
}