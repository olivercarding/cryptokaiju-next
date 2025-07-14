// app/blog/page.tsx
import { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import BlogPageClient from '@/components/pages/BlogPageClient'
import { getBlogPosts, getAllTags } from '@/lib/contentful'

// SEO metadata for the blog listing page
export const metadata: Metadata = {
  title: 'Blog | CryptoKaiju',
  description: 'Latest news, insights, and stories from the CryptoKaiju universe. Discover the intersection of digital collectibles and physical toys.',
  keywords: ['CryptoKaiju', 'blog', 'digital collectibles', 'NFT', 'blockchain', 'toys'],
  openGraph: {
    title: 'CryptoKaiju Blog',
    description: 'Latest news and insights from CryptoKaiju',
    images: ['/images/blog-og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoKaiju Blog',
    description: 'Latest news and insights from CryptoKaiju',
    images: ['/images/blog-og-image.jpg'],
  },
  alternates: {
    types: {
      'application/rss+xml': '/blog/rss',
    },
  },
}

// Loading component for better UX
function BlogLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded-lg mb-4 animate-pulse max-w-md mx-auto" />
            <div className="h-6 bg-gray-200 rounded-lg mb-8 animate-pulse max-w-2xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3" />
                  <div className="h-6 bg-gray-200 rounded mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// Error boundary component
function BlogError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-kaiju-navy mb-6">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">
            We're having trouble loading the blog posts. Please try again later.
          </p>
          <details className="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <summary className="font-semibold text-red-800 cursor-pointer">
              Error Details
            </summary>
            <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="bg-kaiju-pink text-white px-6 py-3 rounded-xl hover:bg-kaiju-red transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </main>
    </div>
  )
}

export default async function BlogPage() {
  try {
    // Fetch blog posts and tags in parallel for better performance
    const [posts, tags] = await Promise.all([
      getBlogPosts(50), // Get first 50 posts
      getAllTags(),
    ])

    // Handle case where no posts are found
    if (!posts || posts.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white">
          <Header />
          <main className="pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-kaiju-navy mb-6">
                No Blog Posts Found
              </h1>
              <p className="text-gray-600 mb-8">
                We don't have any blog posts to show right now. Check back soon!
              </p>
              <div className="text-sm text-gray-500">
                Make sure your Contentful space has published blog posts with the correct content model.
              </div>
            </div>
          </main>
        </div>
      )
    }

    return (
      <>
        <Header />
        <Suspense fallback={<BlogLoading />}>
          <BlogPageClient posts={posts} tags={tags} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error('Error loading blog page:', error)
    return <BlogError error={error as Error} />
  }
}