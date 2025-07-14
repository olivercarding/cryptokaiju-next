// src/components/blog/BlogCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/lib/contentful'

interface BlogCardProps {
  post: BlogPost
  index?: number
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const { title, slug, excerpt, featuredImage, author, publishDate, readingTime } = post.fields

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
    >
      <Link href={`/blog/${slug}`}>
        {/* Featured Image */}
        {featuredImage && (
          <div className="relative h-48 md:h-56 overflow-hidden">
            <Image
              src={`https:${featuredImage.fields.file?.url}?w=800&h=400&fit=fill&f=face`}
              alt={featuredImage.fields.title || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-kaiju-navy/60 mb-3">
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
          <h2 className="text-xl font-bold text-kaiju-navy mb-3 group-hover:text-kaiju-pink transition-colors line-clamp-2">
            {title}
          </h2>

          {/* Excerpt */}
          <p className="text-kaiju-navy/70 mb-4 line-clamp-3">
            {excerpt}
          </p>

          {/* Read More */}
          <div className="flex items-center gap-2 text-kaiju-pink font-medium group-hover:gap-3 transition-all">
            Read More
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

// src/components/blog/BlogList.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Tag, X } from 'lucide-react'
import BlogCard from './BlogCard'
import type { BlogPost } from '@/lib/contentful'

interface BlogListProps {
  posts: BlogPost[]
  tags: string[]
}

export default function BlogList({ posts, tags }: BlogListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.fields.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.fields.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = !selectedTag || 
      post.fields.tags?.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kaiju-pink focus:outline-none transition-colors"
            />
          </div>

          {/* Tag Filter */}
          <div className="flex gap-2 flex-wrap">
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="flex items-center gap-2 bg-kaiju-pink text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-kaiju-red transition-colors"
              >
                {selectedTag}
                <X className="w-4 h-4" />
              </button>
            )}
            
            {!selectedTag && (
              <div className="flex gap-2 flex-wrap">
                {tags.slice(0, 5).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className="flex items-center gap-1 bg-gray-100 text-kaiju-navy px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-kaiju-navy/60">
        {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
        {selectedTag && ` in "${selectedTag}"`}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Blog Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <BlogCard key={post.sys.id} post={post} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-kaiju-navy mb-2">No posts found</h3>
          <p className="text-kaiju-navy/60">
            Try adjusting your search terms or removing filters.
          </p>
        </motion.div>
      )}
    </div>
  )
}

// src/components/blog/RichTextRenderer.tsx
import { 
  documentToReactComponents, 
  Options 
} from '@contentful/rich-text-react-renderer'
import { 
  BLOCKS, 
  INLINES, 
  type Document 
} from '@contentful/rich-text-types'
import Image from 'next/image'
import Link from 'next/link'

const options: Options = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title } = node.data.target.fields
      return (
        <div className="my-8">
          <Image
            src={`https:${file.url}`}
            alt={title || ''}
            width={800}
            height={400}
            className="rounded-xl shadow-lg mx-auto"
          />
          {title && (
            <p className="text-center text-sm text-gray-600 mt-2 italic">
              {title}
            </p>
          )}
        </div>
      )
    },
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className="text-3xl font-bold text-kaiju-navy mb-6 mt-8">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-2xl font-bold text-kaiju-navy mb-4 mt-6">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-xl font-bold text-kaiju-navy mb-3 mt-5">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-kaiju-pink pl-6 my-6 italic text-gray-600 bg-gray-50 py-4 rounded-r-lg">
        {children}
      </blockquote>
    ),
    [INLINES.HYPERLINK]: (node, children) => (
      <Link 
        href={node.data.uri}
        className="text-kaiju-pink hover:text-kaiju-red underline transition-colors"
        target={node.data.uri.startsWith('http') ? '_blank' : '_self'}
        rel={node.data.uri.startsWith('http') ? 'noopener noreferrer' : ''}
      >
        {children}
      </Link>
    ),
  },
}

interface RichTextRendererProps {
  content: Document
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      {documentToReactComponents(content, options)}
    </div>
  )
}