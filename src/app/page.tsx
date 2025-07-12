// src/app/page.tsx (NEW - Server Component)
import { generatePageMetadata } from '@/lib/seo'
import { collectionSchema, howToSchema, createJsonLd } from '@/lib/structured-data'
import HomePageClient from '@/components/pages/HomePageClient'

// ✅ This now works because it's a Server Component
export const metadata = generatePageMetadata('/')

export default function HomePage() {
  return (
    <>
      {/* ✅ Server-side structured data for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(collectionSchema)}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(howToSchema)}
      />

      {/* ✅ All client-side logic moved to separate component */}
      <HomePageClient />
    </>
  )
}