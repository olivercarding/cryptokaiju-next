// src/components/blog/BlogList.tsx
'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import BlogCard from './BlogCard'
import type { BlogPost } from '@/lib/contentful'
import { toStringValue, toStringArray } from '@/lib/contentful'

interface BlogListProps {
  posts: BlogPost[]
  tags: string[]
}

export default function BlogList({ posts, tags }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'reading-time'>('newest')

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let filtered = posts

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post => {
        const title = toStringValue(post.fields.title).toLowerCase()
        const excerpt = toStringValue(post.fields.excerpt).toLowerCase()
        const postTags = toStringArray(post.fields.tags)
        
        return title.includes(searchQuery.toLowerCase()) ||
               excerpt.includes(searchQuery.toLowerCase()) ||
               postTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      })
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post => {
        const postTags = toStringArray(post.fields.tags)
        return postTags.includes(selectedTag)
      })
    }

    // Sort posts
    switch (sortBy) {
      case 'oldest':
        filtered = [...filtered].sort((a, b) => 
          new Date(toStringValue(a.fields.publishDate)).getTime() - 
          new Date(toStringValue(b.fields.publishDate)).getTime()
        )
        break
      case 'reading-time':
        filtered = [...filtered].sort((a, b) => 
          (Number(a.fields.readingTime) || 0) - (Number(b.fields.readingTime) || 0)
        )
        break
      case 'newest':
      default:
        filtered = [...filtered].sort((a, b) => 
          new Date(toStringValue(b.fields.publishDate)).getTime() - 
          new Date(toStringValue(a.fields.publishDate)).getTime()
        )
        break
    }

    return filtered
  }, [posts, searchQuery, selectedTag, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTag('')
    setSortBy('newest')
  }

  const hasActiveFilters = searchQuery || selectedTag || sortBy !== 'newest'

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kaiju-pink focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Tag Filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-kaiju-pink transition-colors"
              >
                <Filter className="w-4 h-4" />
                {selectedTag || 'All Topics'}
                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-20 min-w-48 max-h-60 overflow-y-auto"
                  >
                    <button
                      onClick={() => {
                        setSelectedTag('')
                        setIsFilterOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-kaiju-light-pink transition-colors"
                    >
                      All Topics
                    </button>
                    {tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(tag)
                          setIsFilterOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-kaiju-light-pink transition-colors ${
                          selectedTag === tag ? 'bg-kaiju-light-pink text-kaiju-navy font-medium' : ''
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'reading-time')}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-kaiju-pink focus:outline-none transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="reading-time">By Reading Time</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-kaiju-pink hover:text-kaiju-red transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {filteredPosts.length === posts.length 
              ? `Showing all ${posts.length} articles`
              : `Showing ${filteredPosts.length} of ${posts.length} articles`
            }
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <AnimatePresence mode="wait">
        {filteredPosts.length > 0 ? (
          <motion.div
            key="posts-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post, index) => (
              <BlogCard key={post.sys.id} post={post} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-gray-100"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-kaiju-navy mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="bg-kaiju-pink text-white px-6 py-3 rounded-xl hover:bg-kaiju-red transition-colors font-medium"
            >
              Show All Articles
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}