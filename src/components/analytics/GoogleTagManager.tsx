// src/components/analytics/GoogleTagManager.tsx
'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface GTMProps {
  gtmId: string
}

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export function GoogleTagManager({ gtmId }: GTMProps) {
  useEffect(() => {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || []
  }, [])

  return (
    <>
      {/* Google Tag Manager Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  )
}

export function GoogleTagManagerNoScript({ gtmId }: GTMProps) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

// Custom event tracking functions
export const gtmEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...parameters,
    })
  }
}

// Specific event tracking functions for your CryptoKaiju site
export const trackMintEvent = (tokenId: string, nfcId: string, priceETH: number) => {
  gtmEvent('mint_nft', {
    event_category: 'NFT',
    event_label: 'CryptoKaiju Mint',
    token_id: tokenId,
    nfc_id: nfcId,
    price_eth: priceETH,
    currency: 'ETH'
  })
}

export const trackWalletConnection = (walletType: string) => {
  gtmEvent('wallet_connect', {
    event_category: 'Web3',
    event_label: 'Wallet Connected',
    wallet_type: walletType
  })
}

export const trackPageView = (pageName: string, pageTitle?: string) => {
  gtmEvent('page_view', {
    page_title: pageTitle || document.title,
    page_location: window.location.href,
    page_name: pageName
  })
}

export const trackKaijuView = (tokenId: string, kaijuName?: string) => {
  gtmEvent('view_item', {
    event_category: 'NFT',
    event_label: 'Kaiju Viewed',
    item_id: tokenId,
    item_name: kaijuName || `CryptoKaiju #${tokenId}`,
    item_category: 'CryptoKaiju'
  })
}

export const trackShippingStart = (orderNumber: string, itemCount: number) => {
  gtmEvent('begin_checkout', {
    event_category: 'Physical Fulfillment',
    event_label: 'Shipping Started',
    order_number: orderNumber,
    items: itemCount
  })
}

export const trackOrderComplete = (orderNumber: string, shippingCost: number, currency: string) => {
  gtmEvent('purchase', {
    event_category: 'Physical Fulfillment',
    event_label: 'Order Completed',
    transaction_id: orderNumber,
    value: shippingCost,
    currency: currency
  })
}