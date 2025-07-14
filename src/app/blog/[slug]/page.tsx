// app/blog/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import BlogPostPageClient from '@/components/pages/BlogPostPageClient'
import { getBlogPostBySlug, getBlogPosts } from '@/lib/contentful'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | CryptoKaiju',
    }
  }

  const { title, excerpt, featuredImage, metaDescription } = post.fields

  return {
    title: `${title} | CryptoKaiju Blog`,
    description: metaDescription || excerpt,
    openGraph: {
      title,
      description: metaDescription || excerpt,
      images: featuredImage 
        ? [`https:${featuredImage.fields.file?.url}?w=1200&h=630&fit=fill`]
        : ['/images/blog-og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription || excerpt,
      images: featuredImage 
        ? [`https:${featuredImage.fields.file?.url}?w=1200&h=630&fit=fill`]
        : ['/images/blog-og-image.jpg'],
    },
  }
}

export async function generateStaticParams() {
  const posts = await getBlogPosts(100) // Get first 100 posts for static generation
  
  return posts.map((post) => ({
    slug: post.fields.slug,
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // Get related posts (same tags, excluding current post)
  const relatedPosts = await getBlogPosts(6)
  const filteredRelatedPosts = relatedPosts
    .filter(relatedPost => relatedPost.sys.id !== post.sys.id)
    .slice(0, 3)

  return (
    <>
      <Header />
      <BlogPostPageClient post={post} relatedPosts={filteredRelatedPosts} />
    </>
  )
}