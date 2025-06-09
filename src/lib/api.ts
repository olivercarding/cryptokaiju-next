// src/lib/api.ts
import axios from 'axios'

// Types from the working app
export interface UserClaim {
  nfcId: string
  tokenUri: string
  birthday: number
}

export interface ClaimResponse {
  result: Array<{
    proof: string[]
    nfcId: string
    tokenUri: string
    birthday: number
  }>
  canOpenMint: boolean
}

export interface MintedCountResponse {
  total_supply: number
}

export interface EthPriceResponse {
  ethereum: {
    usd: number
  }
}

// API endpoints
const CLAIM_ENDPOINT = 'https://us-central1-merkle-minter.cloudfunctions.net/claim'
const OPENSEA_API_URL = 'https://api.opensea.io/api/v2/collections/cryptokaiju'
const COINGECKO_ETH_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'

// Redirect URL for successful mint (from working app)
export const PLUSH_CLAIM_REDIRECT = 'https://cryptokaiju.io/plushclaim/'

/**
 * Reserve a single NFT from the backend
 * Returns the claim data needed for minting
 */
export const reserveNFT = async (): Promise<{
  claim: UserClaim
  proof: string[]
} | null> => {
  try {
    const response = await axios.get<ClaimResponse>(CLAIM_ENDPOINT)
    const { data } = response
    const { result, canOpenMint } = data

    if (!result || result.length === 0) {
      console.log('No more available for the moment...')
      return null
    }

    if (!canOpenMint) {
      console.log('Unable to open mint - try again')
      return null
    }

    const claim = result[0]
    const { proof, nfcId, tokenUri, birthday } = claim

    return {
      claim: { nfcId, tokenUri, birthday },
      proof
    }
  } catch (error) {
    console.error('Failed to reserve NFT:', error)
    return null
  }
}

/**
 * Fetch the current minted count from OpenSea
 */
export const fetchMintedCount = async (): Promise<number> => {
  try {
    const response = await axios.get<MintedCountResponse>(OPENSEA_API_URL, {
      headers: {
        "x-api-key": "a221b5fb89fb4ffeb5fbf4fa42cc6532", // This should be moved to environment variables
      },
    })

    return response.data.total_supply
  } catch (error) {
    console.error('Error fetching total supply from OpenSea:', error)
    return 0
  }
}

/**
 * Fetch current ETH price in USD
 */
export const fetchETHPriceInUSD = async (): Promise<number> => {
  try {
    const response = await axios.get<EthPriceResponse>(COINGECKO_ETH_PRICE_URL)
    
    if (!response.data || !response.data.ethereum) {
      throw new Error('Failed to fetch ETH price in USD.')
    }

    return response.data.ethereum.usd
  } catch (error) {
    console.error('Error fetching ETH price:', error)
    return 0
  }
}

/**
 * Calculate total cost in ETH for multiple NFTs
 */
export const calculateTotalCost = (pricePerNFT: number, quantity: number): number => {
  return pricePerNFT * quantity
}

/**
 * Calculate USD value from ETH amount
 */
export const calculateUSDValue = (ethAmount: number, ethPriceUSD: number): number => {
  return parseFloat((ethAmount * ethPriceUSD).toFixed(2))
}

/**
 * Format ETH amount for display
 */
export const formatETH = (amount: number, decimals: number = 3): string => {
  return amount.toFixed(decimals)
}

/**
 * Format address for display (shortened)
 */
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Validate if an address is valid Ethereum address
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Sleep utility for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i === maxRetries - 1) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, i)
      await sleep(delay)
    }
  }

  throw lastError!
}

/**
 * Error handling utilities
 */
export const handleAPIError = (error: any, context: string): void => {
  console.error(`Error in ${context}:`, error)
  
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error('Response data:', error.response.data)
      console.error('Response status:', error.response.status)
    } else if (error.request) {
      console.error('No response received:', error.request)
    } else {
      console.error('Request setup error:', error.message)
    }
  } else {
    console.error('Non-Axios error:', error.message)
  }
}

/**
 * Constants for contract interaction
 */
export const CONTRACT_CONSTANTS = {
  // Default gas limits
  MINT_GAS_LIMIT: 300000,
  MULTI_MINT_GAS_LIMIT: 500000,
  
  // Price constants (should be fetched from contract)
  DEFAULT_PRICE_ETH: 0.055,
  
  // Max NFTs per transaction
  MAX_MINT_PER_TX: 10,
  
  // Network constants
  ETHEREUM_MAINNET_ID: 1,
  ETHEREUM_TESTNET_ID: 11155111, // Sepolia
} as const

/**
 * Notification messages
 */
export const MESSAGES = {
  SUCCESS: {
    MINT: 'Successfully minted your mystery box!',
    RESERVE: 'NFT reserved successfully!',
    CONNECT: 'Wallet connected successfully!',
  },
  ERROR: {
    NO_WALLET: 'Please connect your wallet first',
    NO_RESERVES: 'Please reserve at least one NFT first',
    INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction',
    TRANSACTION_FAILED: 'Transaction failed. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    CONTRACT_ERROR: 'Contract interaction failed. Please try again.',
    NO_NFTS_AVAILABLE: 'No more NFTs available at the moment',
    RESERVATION_FAILED: 'Failed to reserve NFT. Please try again.',
  },
  INFO: {
    CONNECTING: 'Connecting wallet...',
    MINTING: 'Minting in progress...',
    RESERVING: 'Reserving NFT...',
    CONFIRMING: 'Waiting for confirmation...',
  }
} as const