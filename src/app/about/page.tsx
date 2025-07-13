// src/app/about/page.tsx - SEO Optimized Server Component
import { generatePageMetadata } from '@/lib/seo'
import { organizationSchema, createJsonLd } from '@/lib/structured-data'
import AboutPageClient from '@/components/pages/AboutPageClient'

// ✅ Server Component can export metadata
export const metadata = generatePageMetadata('/about')

export default function AboutPage() {
  return (
    <>
      {/* ✅ Server-side structured data for about page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(organizationSchema)}
      />
      
      {/* ✅ All client-side logic moved to separate component */}
      <AboutPageClient />
    </>
  )
}