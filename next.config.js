/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
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
      // IPFS gateways
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
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dweb.link',
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
    // Increase timeout for IPFS images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Add CORS headers for API routes
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
    ]
  },
  
  // Enhanced webpack configuration to handle dependency issues
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

    // Ignore specific modules that cause warnings
    config.externals = config.externals || []
    config.externals.push({
      'pino-pretty': 'pino-pretty',
      'lokijs': 'lokijs',
      'encoding': 'encoding',
    })

    // Add module resolution for problematic packages
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
    }

    // Ignore specific require() calls that cause warnings
    config.module.rules.push({
      test: /node_modules\/pino\/lib\/tools\.js$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: /require\(['"]pino-pretty['"]\)/g,
          replace: 'null',
        }
      }
    })
    
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