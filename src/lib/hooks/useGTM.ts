// src/lib/hooks/useGTM.ts
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { 
  gtmEvent, 
  trackMintEvent, 
  trackWalletConnection, 
  trackPageView, 
  trackKaijuView,
  trackShippingStart,
  trackOrderComplete
} from '@/components/analytics/GoogleTagManager'

export function useGTM() {
  const pathname = usePathname()

  // Track page views automatically
  useEffect(() => {
    const pageName = pathname === '/' ? 'Home' : pathname.replace('/', '').replace('-', ' ')
    trackPageView(pageName)
  }, [pathname])

  return {
    // Generic event tracking
    trackEvent: gtmEvent,
    
    // Specific CryptoKaiju events
    trackMint: trackMintEvent,
    trackWalletConnect: trackWalletConnection,
    trackKaijuView: trackKaijuView,
    trackShippingStart: trackShippingStart,
    trackOrderComplete: trackOrderComplete,
    
    // Custom events for your specific use cases
    trackMysteryBoxOpen: (boxNumber: number, result: string) => {
      gtmEvent('mystery_box_open', {
        event_category: 'Engagement',
        event_label: 'Mystery Box Opened',
        box_number: boxNumber,
        result: result
      })
    },
    
    trackNFTSearch: (searchTerm: string, resultsCount: number) => {
      gtmEvent('search', {
        search_term: searchTerm,
        event_category: 'Search',
        event_label: 'NFT Search',
        results_count: resultsCount
      })
    },
    
    trackCollectionView: (collectionType: string) => {
      gtmEvent('view_item_list', {
        event_category: 'Collection',
        event_label: 'Collection Viewed',
        item_list_name: collectionType
      })
    },
    
    trackSocialShare: (platform: string, content: string) => {
      gtmEvent('share', {
        event_category: 'Social',
        event_label: 'Content Shared',
        method: platform,
        content_type: content
      })
    },
    
    trackNewsletterSignup: (source: string) => {
      gtmEvent('newsletter_signup', {
        event_category: 'Lead Generation',
        event_label: 'Newsletter Signup',
        source: source
      })
    },
    
    trackVideoPlay: (videoName: string, progress: number) => {
      gtmEvent('video_play', {
        event_category: 'Engagement',
        event_label: 'Video Played',
        video_title: videoName,
        video_progress: progress
      })
    },
    
    trackExternalLinkClick: (url: string, linkText: string) => {
      gtmEvent('click', {
        event_category: 'External Link',
        event_label: 'External Link Clicked',
        link_url: url,
        link_text: linkText
      })
    },
    
    trackErrorEvent: (errorType: string, errorMessage: string, page: string) => {
      gtmEvent('exception', {
        description: errorMessage,
        fatal: false,
        error_type: errorType,
        page: page
      })
    }
  }
}