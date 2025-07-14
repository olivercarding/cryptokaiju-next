// app/blog/page.tsx
import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import BlogPageClient from '@/components/pages/BlogPageClient'
import { getBlogPosts, getAllTags } from '@/lib/contentful'

export const metadata: Metadata = {
  title: 'Blog | CryptoKaiju',
  description: 'Latest news, insights, and stories from the CryptoKaiju universe. Discover the intersection of digital collectibles and physical toys.',
  openGraph: {
    title: 'CryptoKaiju Blog',
    description: 'Latest news and insights from CryptoKaiju',
    images: ['/images/blog-og-image.jpg'],
  },
}

export default async function BlogPage() {
  // Fetch blog posts and tags
  const [posts, tags] = await Promise.all([
    getBlogPosts(50), // Get first 50 posts
    getAllTags(),
  ])

  return (
    <>
      <Header />
      <BlogPageClient posts={posts} tags={tags} />
    </>
  )
}