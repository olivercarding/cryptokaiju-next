// src/components/pages/BlogPageClient.tsx
'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BlogCard from '@/components/blog/BlogCard'
import type { BlogPost } from '@/lib/contentful'

interface BlogPageClientProps {
  posts: BlogPost[]
  tags: string[]
}

export default function BlogPageClient({ posts, tags }: BlogPageClientProps) {
  // Replace with your actual Substack URL
  const substackUrl = "https://cryptokaiju.substack.com/subscribe"

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
            {/* Back Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-white hover:text-kaiju-pink transition-colors font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-kaiju-pink" />
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  CryptoKaiju Blog
                </h1>
              </div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                Dive into the latest news, insights, and stories from the CryptoKaiju universe. 
                Discover the intersection of digital collectibles and physical toys.
              </p>
              
              {/* Newsletter CTA in Hero */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-md mx-auto">
                <p className="text-white/90 mb-4 text-sm">
                  Get updates delivered to your inbox
                </p>
                <a
                  href={substackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-kaiju-pink hover:bg-kaiju-red px-6 py-3 rounded-xl font-semibold transition-colors text-white"
                >
                  Subscribe to Newsletter
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Light Content Section */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Blog Posts Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {posts.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-8 text-center">Latest Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                      <BlogCard key={post.sys.id} post={post} index={index} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-2xl font-bold text-kaiju-navy mb-2">No Articles Yet</h3>
                  <p className="text-gray-600 mb-6">
                    We're working on some amazing content. Check back soon!
                  </p>
                  <p className="text-gray-500 text-sm">
                    Don't miss our launch - subscribe to get notified when we publish our first articles.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}