/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  
  // Image optimization with improved IPFS, OpenSea, and Contentful support
  images: {
    remotePatterns: [
      // ENHANCED: Contentful images - Added all Contentful CDN domains
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.ctfassets.net', // ADDED: Alternative Contentful CDN
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'downloads.ctfassets.net', // ADDED: For Contentful file downloads
        port: '',
        pathname: '/**',
      },
      
      // OpenSea domains - Your existing ones
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i2.seadn.io',
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
        hostname: 'storage.opensea.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.opensea.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      
      // IPFS gateways - Your existing configuration
      {
        protocol: 'https',
        hostname: 'cryptokaiju.mypinata.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
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
        hostname: 'dweb.link',
        port: '',
        pathname: '/**',
      },
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
      }
    ],
    
    // ENHANCED: Improved image optimization settings for rich text content
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // ENHANCED: 30 days for better caching
    formats: ['image/webp', 'image/avif'], // ADDED: AVIF support for better compression
    contentDispositionType: 'attachment',
    
    // ENHANCED: Better loader configuration for different content types
    loader: 'default',
    path: '/_next/image',
    
    // Add unoptimized flag for development debugging
    unoptimized: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_IMAGES === 'true',
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
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      {
        source: '/api/opensea/:path*',
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
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      
      // ENHANCED: Add headers for all image requests with better caching
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      
      // ADDED: Headers for Contentful assets with longer cache times
      {
        source: '/api/contentful/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300', // 5 minutes for content
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      
      // Add headers for static assets
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      
      // ADDED: Security headers for all pages
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // ENHANCED: Improved webpack configuration with better error handling and rich text optimization
  webpack: (config, { isServer, dev }) => {
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

    // ENHANCED: Ignore problematic modules and warnings
    config.ignoreWarnings = [
      { module: /node_modules\/pino\/lib\/tools\.js/ },
      { module: /node_modules\/pino-pretty/ },
      /Failed to parse source map/,
      /Critical dependency: the request of a dependency is an expression/,
      /Do not know how to serialize a BigInt/,
      // ADDED: Ignore warnings from rich text dependencies
      { module: /node_modules\/@contentful\/rich-text/ },
      /Module not found: Can't resolve 'encoding'/,
    ]
    
    // ADDED: Optimize Contentful and rich text dependencies
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use optimized builds for production
        '@contentful/rich-text-react-renderer': '@contentful/rich-text-react-renderer/dist/rich-text-react-renderer.es.js',
      }
    }
    
    // Add optimization for production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            // ADDED: Separate chunk for Contentful dependencies
            contentful: {
              test: /[\\/]node_modules[\\/](@contentful|contentful)[\\/]/,
              name: 'contentful',
              chunks: 'all',
              priority: 20,
            },
            // ADDED: Separate chunk for UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](framer-motion|lucide-react)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 15,
            },
          },
        },
      }
    }
    
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

  // ENHANCED: Experimental features for better performance and rich text support
  experimental: {
    esmExternals: 'loose',
    largePageDataBytes: 128 * 1024, // 128KB for rich content
    // ADDED: Optimize package imports for faster builds
    optimizePackageImports: [
      '@contentful/rich-text-react-renderer',
      '@contentful/rich-text-types',
      'lucide-react',
      'framer-motion',
      'contentful',
    ],
    // ADDED: Better server components support
    serverComponentsExternalPackages: ['contentful'],
  },

  // Add redirects for legacy routes
  async redirects() {
    return [
      {
        source: '/shop/:path*',
        destination: '/kaijudex',
        permanent: true,
      },
      {
        source: '/my-account/:path*',
        destination: '/my-kaiju',
        permanent: true,
      },
      // ADDED: SEO redirects for better blog URLs
      {
        source: '/posts/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/articles/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
    ]
  },

  // ENHANCED: Better rewrites for API optimization
  async rewrites() {
    return [
      // Optional: Add rewrites for better API structure
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ]
  },

  // Improve performance
  compress: true,
  poweredByHeader: false,
  
  // ENHANCED: React configuration for better rich text performance
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ADDED: Output configuration for better deployment
  output: 'standalone', // Remove this if you don't want standalone mode
  
  // ADDED: Better build configuration
  generateBuildId: async () => {
    // Use commit hash if available, otherwise use timestamp
    return process.env.VERCEL_GIT_COMMIT_SHA || `build-${Date.now()}`
  },
}

module.exports = nextConfig