/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // Image optimization
  images: {
    remotePatterns: [
      // Contentful images
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      },
      // OpenSea domains
      {
        protocol: 'https',
        hostname: 'i2c.seadn.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'openseauserdata.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // IPFS gateways - Updated with more reliable options
      {
        protocol: 'https',
        hostname: 'cryptokaiju.mypinata.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/**',
      },
      // Replace cloudflare-ipfs.com with cf-ipfs.com (new domain)
      {
        protocol: 'https',
        hostname: 'cf-ipfs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dweb.link',
        port: '',
        pathname: '/**',
      },
      // Add infura IPFS gateway
      {
        protocol: 'https',
        hostname: 'ipfs.infura.io',
        port: '',
        pathname: '/**',
      },
      // Add more reliable IPFS gateways
      {
        protocol: 'https',
        hostname: 'gateway.ipfs.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nftstorage.link',
        port: '',
        pathname: '/**',
      },
      // Additional OpenSea domains
      {
        protocol: 'https',
        hostname: 'opensea.mypinata.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.opensea.io',
        port: '',
        pathname: '/**',
      }
    ],
    // More lenient image optimization
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Increase timeout for IPFS images and add fallback options
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add image optimization settings for better IPFS handling
    minimumCacheTTL: 60,
    formats: ['image/webp'],
  },
  
  // Enhanced CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/ipfs/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      // Add headers for all image requests
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ]
  },
  
  // Simplified webpack configuration to handle dependency issues
  webpack: (config, { isServer }) => {
    // Handle Node.js modules that don't work in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        util: false,
        buffer: false,
        events: false,
        querystring: false,
      }
    }

    // Ignore problematic modules - simple approach
    config.ignoreWarnings = [
      { module: /node_modules\/pino\/lib\/tools\.js/ },
      { module: /node_modules\/pino-pretty/ },
      /Failed to parse source map/,
    ]
    
    return config
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Experimental features to help with Web3 compatibility
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig