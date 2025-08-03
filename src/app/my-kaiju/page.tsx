// components/SimplifiedKaijuCard.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye } from 'lucide-react';

interface SimplifiedKaijuCardProps {
  tokenId: string;
  name: string;
  description: string;
  image: string;
}

export const SimplifiedKaijuCard: React.FC<SimplifiedKaijuCardProps> = ({
  tokenId,
  name,
  description,
  image
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Truncate description to keep cards consistent
  const truncatedDescription = description.length > 100 
    ? `${description.substring(0, 100)}...` 
    : description;

  // Helper function to get image source with fallback
  const getImageSrc = (): string => {
    if (imageError) return '/images/placeholder-kaiju.png'
    if (!image) return '/images/placeholder-kaiju.png'
    
    // Handle IPFS URLs
    if (image.startsWith('ipfs://')) {
      return `https://cryptokaiju.mypinata.cloud/ipfs/${image.replace('ipfs://', '')}`
    }
    
    // Handle other IPFS gateway URLs
    if (image.includes('/ipfs/')) {
      const hash = image.split('/ipfs/')[1].split('?')[0]
      return `https://cryptokaiju.mypinata.cloud/ipfs/${hash}`
    }
    
    return image
  }

  return (
    <Link href={`/kaiju/${tokenId}`} className="block">
      <div className="bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group">
        
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={getImageSrc()}
            alt={name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-kaiju-pink/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Token ID badge */}
          <div className="absolute top-2 right-2 bg-kaiju-pink text-white px-2 py-1 rounded text-xs font-bold">
            #{tokenId}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-kaiju-navy text-lg leading-tight group-hover:text-kaiju-pink transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {truncatedDescription}
            </p>
          </div>

          {/* Quick actions hint */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Click to view details</span>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>View</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}