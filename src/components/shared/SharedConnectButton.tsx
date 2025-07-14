// src/components/shared/SharedConnectButton.tsx
'use client'

import { ConnectButton } from "thirdweb/react"
import { thirdwebClient } from '@/lib/thirdweb'

interface SharedConnectButtonProps {
  className?: string
  label?: string
  variant?: 'header' | 'inline'
}

export default function SharedConnectButton({ 
  className, 
  label = "Connect Wallet",
  variant = 'inline' 
}: SharedConnectButtonProps) {
  
  // Shared configuration for all connect buttons
  const sharedConfig = {
    client: thirdwebClient,
    theme: variant === 'header' ? 'dark' : 'light',
    connectModal: {
      size: variant === 'header' ? 'compact' : 'wide',
      title: "Connect to CryptoKaiju",
      showThirdwebBranding: false,
      welcomeScreen: {
        title: "Welcome to CryptoKaiju",
        subtitle: "Connect your wallet to mint mystery boxes and view your collection"
      },
      // Disable auto-connect to prevent blank modals
      autoConnect: false
    },
    appMetadata: {
      name: "CryptoKaiju",
      description: "Collectible NFTs Linked to Toys",
      url: "https://cryptokaiju.com",
      logoUrl: "/images/cryptokaiju-logo.png",
    },
    // Custom styling for inline variant
    connectButton: variant === 'inline' ? {
      label: label,
      style: {
        background: "linear-gradient(135deg, #ff6b9d 0%, #ff8cc8 100%)",
        color: "white",
        border: "none",
        borderRadius: "12px",
        padding: "12px 24px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        minWidth: "160px"
      }
    } : undefined
  }

  return (
    <div className={className}>
      <ConnectButton {...sharedConfig} />
    </div>
  )
}