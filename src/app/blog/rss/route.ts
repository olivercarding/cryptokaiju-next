// app/blog/rss/route.ts
import { getRecentBlogPosts } from '@/lib/contentful'
import { NextResponse } from 'next/server'

// Site configuration - update these with your actual site details
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cryptokaiju.io'
const SITE_NAME = 'CryptoKaiju Blog'
const SITE_DESCRIPTION = 'Latest news, insights, and stories from the CryptoKaiju universe'

export async function GET() {
  try {
    const posts = await getRecentBlogPosts(50)
    
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <description>${SITE_DESCRIPTION}</description>
    <link>${SITE_URL}/blog</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.fields.title}]]></title>
      <description><![CDATA[${post.fields.excerpt || ''}]]></description>
      <link>${SITE_URL}/blog/${post.fields.slug}</link>
      <guid>${SITE_URL}/blog/${post.fields.slug}</guid>
      <pubDate>${new Date(post.fields.publishDate).toUTCString()}</pubDate>
      <author>${post.fields.author || 'CryptoKaiju Team'}</author>
    </item>`
      )
      .join('')}
  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}