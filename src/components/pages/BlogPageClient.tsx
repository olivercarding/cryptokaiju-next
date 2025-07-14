// src/components/pages/BlogPageClient.tsx
'use client'

import { motion } from 'framer-motion'
import { BookOpen, Rss, Search } from 'lucide-react'
import Link from 'next/link'
import BlogList from '@/components/blog/BlogList'
import BlogCard from '@/components/blog/BlogCard'
import type { BlogPost } from '@/lib/contentful'

interface BlogPageClientProps {
  posts: BlogPost[]
  tags: string[]
}

export default function BlogPageClient({ posts, tags }: BlogPageClientProps) {
  const featuredPosts = posts.slice(0, 3)
  const otherPosts = posts.slice(3)

  return (
    <main className="text-kaiju-navy overflow-x-hidden">
      {/* Hero Section */}
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
          <motion.div 
            className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_30%,theme(colors.kaiju-purple-light/30)_0%,transparent_50%)]"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          />
        </div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-kaiju-pink rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <BookOpen className="w-8 h-8 text-kaiju-pink" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">
                CryptoKaiju Blog
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Explore the latest news, insights, and stories from the CryptoKaiju universe. 
              Discover the intersection of digital collectibles and physical toys.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-black text-kaiju-pink mb-1">{posts.length}</div>
                <div className="text-white/80 text-sm font-medium">Articles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-black text-kaiju-pink mb-1">{tags.length}</div>
                <div className="text-white/80 text-sm font-medium">Topics</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 col-span-2 md:col-span-1">
                <div className="text-2xl font-black text-kaiju-pink mb-1">Weekly</div>
                <div className="text-white/80 text-sm font-medium">Updates</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-kaiju-navy">Featured Articles</h2>
                <Link
                  href="/blog/rss"
                  className="flex items-center gap-2 text-kaiju-pink hover:text-kaiju-red transition-colors"
                >
                  <Rss className="w-5 h-5" />
                  RSS Feed
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post, index) => (
                  <div key={post.sys.id} className="relative">
                    {index === 0 && (
                      <div className="absolute -top-2 -left-2 bg-kaiju-pink text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                        Latest
                      </div>
                    )}
                    <BlogCard post={post} index={index} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Posts with Search/Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-kaiju-navy mb-8">All Articles</h2>
            <BlogList posts={otherPosts} tags={tags} />
          </motion.div>
        </div>
      </section>
    </main>
  )
}