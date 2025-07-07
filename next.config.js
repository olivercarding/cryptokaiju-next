/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Vercel deployment
  output: 'standalone',
  
  // Reduce build time and improve stability
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
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
  
  // Webpack configuration to handle dependency issues
  webpack: (config, { isServer }) => {
    // Handle pino/pino-pretty issues
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
      }
    }
    
    // Optimize for thirdweb and web3 libraries
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push('pino-pretty')
    }
    
    // Handle React version conflicts
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    }
    
    return config
  },
  
  // TypeScript configuration
  typescript: {
    // Be more lenient during build (can be adjusted as needed)
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Be more lenient during build
    ignoreDuringBuilds: false,
  },
  
  // Build optimizations
  swcMinify: true,
  
  // Handle environment variables
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
  },
}

module.exports = nextConfig