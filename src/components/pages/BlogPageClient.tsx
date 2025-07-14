// src/components/pages/BlogPageClient.tsx
'use client'

import { motion } from 'framer-motion'
import BlogList from '@/components/blog/BlogList'
import type { BlogPost } from '@/lib/contentful'

interface BlogPageClientProps {
  posts: BlogPost[]
  tags: string[]
}

export default function BlogPageClient({ posts, tags }: BlogPageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-kaiju-navy mb-6">
              CryptoKaiju Blog
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Dive into the latest news, insights, and stories from the CryptoKaiju universe. 
              Discover the intersection of digital collectibles and physical toys.
            </p>
          </motion.div>

          {/* Featured Posts Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-gray-100">
              <div className="text-3xl font-bold text-kaiju-pink mb-2">
                {posts.length}
              </div>
              <div className="text-gray-600">Articles Published</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-gray-100">
              <div className="text-3xl font-bold text-kaiju-pink mb-2">
                {tags.length}
              </div>
              <div className="text-gray-600">Topics Covered</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-gray-100">
              <div className="text-3xl font-bold text-kaiju-pink mb-2">
                {Math.floor(posts.reduce((acc, post) => acc + (Number(post.fields.readingTime) || 5), 0) / posts.length)}
              </div>
              <div className="text-gray-600">Avg. Reading Time</div>
            </div>
          </motion.div>

          {/* Blog List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BlogList posts={posts} tags={tags} />
          </motion.div>
        </div>
      </main>
    </div>
  )
}