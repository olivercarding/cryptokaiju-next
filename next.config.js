/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
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
        }
      ],
    },
  }
  
  module.exports = nextConfig