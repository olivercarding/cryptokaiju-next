// src/components/shared/SharedConnectButton.tsx
'use client'

import { ConnectButton, type ConnectButtonProps } from 'thirdweb/react'
import { thirdwebClient } from '@/lib/thirdweb'

interface SharedConnectButtonProps {
  className?: string
  label?: string
  variant?: 'header' | 'inline'
}

export default function SharedConnectButton({
  className,
  label = 'Connect Wallet',
  variant = 'inline',
}: SharedConnectButtonProps) {
  /* ------------------------------------------------------------------ */
  /* Literal-typed helpers so TS does not widen to generic "string"      */
  /* ------------------------------------------------------------------ */
  const theme: 'dark' | 'light' = variant === 'header' ? 'dark' : 'light'
  const size: 'compact' | 'wide' = variant === 'header' ? 'compact' : 'wide'

  /* ------------------------------------------------------------------ */
  /* Shared config passed to <ConnectButton>                             */
  /* ------------------------------------------------------------------ */
  const sharedConfig: ConnectButtonProps = {
    client: thirdwebClient,
    theme,

    connectModal: {
      size,
      title: 'Connect to CryptoKaiju',
      showThirdwebBranding: false,
      welcomeScreen: {
        title: 'Welcome to CryptoKaiju',
        subtitle:
          'Connect your wallet to mint mystery boxes and view your collection',
      },
      autoConnect: false,
    },

    appMetadata: {
      name: 'CryptoKaiju',
      description: 'Collectible NFTs Linked to Toys',
      url: 'https://cryptokaiju.com',
      logoUrl: '/images/cryptokaiju-logo.png',
    },

    // Extra button styling only for in-page (“inline”) usage
    connectButton:
      variant === 'inline'
        ? {
            label,
            style: {
              background: 'linear-gradient(135deg, #ff6b9d 0%, #ff8cc8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: '160px',
            },
          }
        : undefined,
  }

  return (
    <div className={className}>
      <ConnectButton {...sharedConfig} />
    </div>
  )
}
