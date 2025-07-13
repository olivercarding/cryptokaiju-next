// src/app/faq/page.tsx - SEO Optimized Server Component
import { generatePageMetadata } from '@/lib/seo'
import { howToSchema, createJsonLd } from '@/lib/structured-data'
import FAQPageClient from '@/components/pages/FAQPageClient'

// ✅ Server Component can export metadata
export const metadata = generatePageMetadata('/faq')

// Create FAQ-specific structured data
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is CryptoKaiju and how does it work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CryptoKaiju is a pioneering NFT project that bridges physical and digital worlds by combining high-quality collectible toys with blockchain technology. Each consists of a physical collectible with NFC chip and a digital NFT on Ethereum.'
      }
    },
    {
      '@type': 'Question',
      name: 'How many Kaiju will be minted?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CryptoKaiju are released in different batches since 2018, typically containing 100-300 Kaiju per release. Currently there are approximately 1,700 Kaiju in existence.'
      }
    },
    {
      '@type': 'Question',
      name: 'Are Some Kaiju Rarer Than Others?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Some batch sizes are smaller than others, and within most batches there are chase characters released in limited amounts. All Kaiju NFTs have different traits with varying rarity levels.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do I Need an Ethereum Address for CryptoKaiju?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To mint a Kaiju you will need an Ethereum wallet capable of storing a Non Fungible Token (NFT).'
      }
    }
  ]
}

export default function FAQPage() {
  return (
    <>
      {/* ✅ Server-side structured data for FAQ page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(faqSchema)}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={createJsonLd(howToSchema)}
      />
      
      {/* ✅ All client-side logic moved to separate component */}
      <FAQPageClient />
    </>
  )
}