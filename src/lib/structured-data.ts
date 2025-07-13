// src/lib/structured-data.ts
interface JsonLdSchema {
  '@context': string
  '@type': string
  [key: string]: any
}

// Helper function to create JSON-LD script content
export function createJsonLd(schema: JsonLdSchema): { __html: string } {
  return {
    __html: JSON.stringify(schema, null, 2)
  }
}

// Organization Schema for CryptoKaiju
export const organizationSchema: JsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CryptoKaiju',
  alternateName: 'Big Monster Ltd',
  url: 'https://cryptokaiju.io',
  logo: 'https://cryptokaiju.io/images/cryptokaiju-logo.png',
  description: 'World\'s first connected collectibles combining physical toys with NFTs. Each CryptoKaiju features NFC authentication linking your physical collectible to blockchain ownership.',
  foundingDate: '2018',
  founder: {
    '@type': 'Person',
    name: 'Oliver Carding'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'info@cryptokaiju.io'
  },
  sameAs: [
    'https://twitter.com/cryptokaiju',
    'https://instagram.com/cryptokaiju',
    'https://discord.gg/cryptokaiju',
    'https://opensea.io/collection/cryptokaiju'
  ],
  keywords: [
    'Physical NFTs',
    'Connected Collectibles', 
    'NFC NFTs',
    'Blockchain Toys',
    'Connected Objects'
  ]
}

// Website Schema
export const websiteSchema: JsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CryptoKaiju',
  url: 'https://cryptokaiju.io',
  description: 'World\'s first connected collectibles combining physical toys with NFTs.',
  publisher: {
    '@type': 'Organization',
    name: 'CryptoKaiju'
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://cryptokaiju.io/nft?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
}

// Collection Schema for NFT Collection
export const collectionSchema: JsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'CryptoKaiju NFT Collection',
  description: 'Unique connected collectibles combining physical toys with blockchain NFTs. Each features NFC authentication.',
  creator: {
    '@type': 'Organization',
    name: 'CryptoKaiju'
  },
  dateCreated: '2018',
  genre: ['Digital Art', 'Collectibles', 'NFT', 'Physical NFTs'],
  keywords: [
    'Physical NFTs',
    'Connected Collectibles',
    'NFC Authentication',
    'Blockchain Toys',
    'Ethereum NFTs'
  ],
  mainEntity: {
    '@type': 'ItemList',
    name: 'CryptoKaiju Collection',
    numberOfItems: '2800+',
    itemListElement: [
      {
        '@type': 'CreativeWork',
        name: 'Genesis Kaiju',
        description: 'The first CryptoKaiju design featuring dinosaur costume'
      },
      {
        '@type': 'CreativeWork', 
        name: 'Uri Ghost Kaiju',
        description: 'Phosphorescent Kaiju that glows in the dark'
      }
    ]
  }
}

// How-To Schema for the minting process
export const howToSchema: JsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Mint CryptoKaiju NFTs',
  description: 'Step-by-step guide to minting CryptoKaiju connected collectibles',
  image: 'https://cryptokaiju.io/images/how-to-mint.jpg',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'ETH',
    value: '0.055'
  },
  supply: [
    'Ethereum wallet (MetaMask recommended)',
    'ETH for minting and gas fees'
  ],
  tool: [
    'Web3 wallet',
    'Internet connection'
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Connect Wallet',
      text: 'Connect your Ethereum wallet to the CryptoKaiju website',
      image: 'https://cryptokaiju.io/images/step-1-connect.jpg'
    },
    {
      '@type': 'HowToStep', 
      name: 'Open Mystery Box',
      text: 'Mint your mystery box to reveal which design you received',
      image: 'https://cryptokaiju.io/images/step-2-mint.jpg'
    },
    {
      '@type': 'HowToStep',
      name: 'Claim Physical Collectible', 
      text: 'Enter shipping details to receive your NFC-chipped physical toy',
      image: 'https://cryptokaiju.io/images/step-3-claim.jpg'
    }
  ],
  totalTime: 'PT10M'
}

// Product Schema for individual Kaiju
export function createKaijuProductSchema(tokenId: string, name?: string): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name || `CryptoKaiju #${tokenId}`,
    description: `Unique CryptoKaiju NFT #${tokenId} with physical collectible counterpart featuring NFC authentication.`,
    sku: `CK-${tokenId}`,
    category: 'Digital Collectibles',
    brand: {
      '@type': 'Brand',
      name: 'CryptoKaiju'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'CryptoKaiju'
    },
    material: 'Digital NFT + Physical Vinyl/Plush Toy',
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Blockchain',
        value: 'Ethereum'
      },
      {
        '@type': 'PropertyValue',
        name: 'Token Standard', 
        value: 'ERC-721'
      },
      {
        '@type': 'PropertyValue',
        name: 'Authentication',
        value: 'NFC Chip'
      }
    ],
    url: `https://cryptokaiju.io/kaiju/${tokenId}`,
    image: `https://cryptokaiju.io/api/og/kaiju/${tokenId}`,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'ETH',
      seller: {
        '@type': 'Organization',
        name: 'CryptoKaiju'
      }
    }
  }
}