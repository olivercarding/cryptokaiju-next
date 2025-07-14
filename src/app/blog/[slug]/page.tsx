// app/blog/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import BlogPostPageClient from '@/components/pages/BlogPostPageClient'
import { getBlogPostBySlug, getBlogPosts } from '@/lib/contentful'
import type { BlogPost } from '@/lib/contentful'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

// Type guard to ensure we have a valid blog post
function isValidBlogPost(post: BlogPost | null): post is BlogPost {
  return !!(post && post.fields && post.fields.title && post.fields.content)
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const post = await getBlogPostBySlug(params.slug)
    
    if (!isValidBlogPost(post)) {
      return {
        title: 'Post Not Found | CryptoKaiju',
        description: 'The requested blog post could not be found.',
      }
    }

    const { title, excerpt, featuredImage, metaDescription, author, publishDate, tags } = post.fields
    const description = metaDescription || excerpt || 'Read the latest from CryptoKaiju blog'
    const imageUrl = featuredImage 
      ? `https:${featuredImage.fields.file?.url}?w=1200&h=630&fit=fill`
      : '/images/blog-og-image.jpg'

    return {
      title: `${title} | CryptoKaiju Blog`,
      description,
      keywords: tags ? tags.join(', ') : undefined,
      authors: [{ name: author }],
      publishedTime: publishDate,
      openGraph: {
        title,
        description,
        images: [imageUrl],
        type: 'article',
        publishedTime: publishDate,
        authors: [author],
        tags: tags,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: `@${author.toLowerCase().replace(/\s+/g, '')}`,
      },
      alternates: {
        canonical: `/blog/${params.slug}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata for blog post:', error)
    return {
      title: 'Blog Post | CryptoKaiju',
      description: 'Read the latest from CryptoKaiju blog',
    }
  }
}

// Generate static params for build-time optimization
export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts(100) // Get first 100 posts for static generation
    
    return posts
      .filter(isValidBlogPost)
      .map((post) => ({
        slug: post.fields.slug,
      }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Loading component
function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded-lg mb-8 max-w-32" />
            <div className="h-12 bg-white/20 rounded-lg mb-4" />
            <div className="h-6 bg-white/20 rounded-lg mb-8 max-w-2xl" />
            <div className="h-64 bg-white/20 rounded-lg mb-8" />
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-white/20 rounded" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    // Validate slug parameter
    if (!params.slug || typeof params.slug !== 'string') {
      console.error('Invalid slug parameter:', params.slug)
      notFound()
    }

    const post = await getBlogPostBySlug(params.slug)

    if (!isValidBlogPost(post)) {
      console.log(`Blog post not found or invalid for slug: ${params.slug}`)
      notFound()
    }

    // Get related posts (excluding current post)
    let relatedPosts: BlogPost[] = []
    try {
      const allPosts = await getBlogPosts(10)
      relatedPosts = allPosts
        .filter(relatedPost => relatedPost.sys.id !== post.sys.id)
        .filter(isValidBlogPost)
        .slice(0, 3)
    } catch (error) {
      console.warn('Error fetching related posts:', error)
      // Continue without related posts
    }

    return (
      <>
        <Header />
        <Suspense fallback={<BlogPostLoading />}>
          <BlogPostPageClient post={post} relatedPosts={relatedPosts} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error('Error loading blog post page:', error)
    
    // Check if it's a network/API error vs a missing post
    if (error instanceof Error && error.message.includes('notFound')) {
      notFound()
    }
    
    // For other errors, show a generic error page
    throw error
  }
}

// Enable static regeneration for updated content
export const revalidate = 3600 // Revalidate every hour