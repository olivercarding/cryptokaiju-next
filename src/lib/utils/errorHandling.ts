// src/lib/utils/errorHandling.ts - Enhanced Error Handling System

export enum ErrorType {
    NETWORK = 'NETWORK',
    CONTRACT = 'CONTRACT', 
    IPFS = 'IPFS',
    OPENSEA = 'OPENSEA',
    VALIDATION = 'VALIDATION',
    SECURITY = 'SECURITY',
    NOT_FOUND = 'NOT_FOUND',
    RATE_LIMIT = 'RATE_LIMIT',
    UNKNOWN = 'UNKNOWN'
  }
  
  export enum ErrorSeverity {
    LOW = 'LOW',       // Info/warning, doesn't block functionality
    MEDIUM = 'MEDIUM', // Partial functionality affected
    HIGH = 'HIGH',     // Core functionality blocked
    CRITICAL = 'CRITICAL' // App-breaking error
  }
  
  export interface EnhancedError {
    type: ErrorType
    severity: ErrorSeverity
    message: string
    userMessage: string
    technicalDetails?: string
    suggestions?: string[]
    retryable: boolean
    timestamp: Date
    context?: Record<string, any>
  }
  
  export class CryptoKaijuError extends Error {
    public readonly type: ErrorType
    public readonly severity: ErrorSeverity
    public readonly userMessage: string
    public readonly technicalDetails?: string
    public readonly suggestions: string[]
    public readonly retryable: boolean
    public readonly timestamp: Date
    public readonly context?: Record<string, any>
  
    constructor(config: {
      type: ErrorType
      severity: ErrorSeverity
      message: string
      userMessage: string
      technicalDetails?: string
      suggestions?: string[]
      retryable?: boolean
      context?: Record<string, any>
    }) {
      super(config.message)
      this.name = 'CryptoKaijuError'
      this.type = config.type
      this.severity = config.severity
      this.userMessage = config.userMessage
      this.technicalDetails = config.technicalDetails
      this.suggestions = config.suggestions || []
      this.retryable = config.retryable ?? false
      this.timestamp = new Date()
      this.context = config.context
    }
  
    toEnhancedError(): EnhancedError {
      return {
        type: this.type,
        severity: this.severity,
        message: this.message,
        userMessage: this.userMessage,
        technicalDetails: this.technicalDetails,
        suggestions: this.suggestions,
        retryable: this.retryable,
        timestamp: this.timestamp,
        context: this.context
      }
    }
  }
  
  /**
   * Error factory for common CryptoKaiju errors
   */
  export class ErrorFactory {
    static nftNotFound(identifier: string): CryptoKaijuError {
      return new CryptoKaijuError({
        type: ErrorType.NOT_FOUND,
        severity: ErrorSeverity.MEDIUM,
        message: `NFT not found: ${identifier}`,
        userMessage: `Could not find the requested CryptoKaiju.`,
        technicalDetails: `No NFT found with identifier: ${identifier}`,
        suggestions: [
          'Double-check the Token ID or NFC ID',
          'Make sure you\'re scanning the NFC chip correctly',
          'Try searching in the Kaijudex instead'
        ],
        retryable: false,
        context: { identifier, searchType: /^\d+$/.test(identifier) ? 'tokenId' : 'nfcId' }
      })
    }
  
    static nfcScanError(nfcId: string): CryptoKaijuError {
      return new CryptoKaijuError({
        type: ErrorType.CONTRACT,
        severity: ErrorSeverity.MEDIUM,
        message: `NFC scan failed for ID: ${nfcId}`,
        userMessage: `Unable to find a Kaiju with this NFC chip.`,
        technicalDetails: `Contract lookup failed for NFC ID: ${nfcId}`,
        suggestions: [
          'Make sure you\'re scanning the correct NFC chip on the Kaiju\'s foot',
          'Try scanning again - ensure your phone is close to the chip',
          'Check that the NFC chip hasn\'t been damaged',
          'Contact support if this Kaiju should exist'
        ],
        retryable: true,
        context: { nfcId, action: 'nfc_scan' }
      })
    }
  
    static ipfsError(ipfsHash: string): CryptoKaijuError {
      return new CryptoKaijuError({
        type: ErrorType.IPFS,
        severity: ErrorSeverity.LOW,
        message: `IPFS fetch failed: ${ipfsHash}`,
        userMessage: `Some NFT details are temporarily unavailable.`,
        technicalDetails: `Could not fetch metadata from IPFS hash: ${ipfsHash}`,
        suggestions: [
          'The core NFT data is still accessible',
          'Try refreshing the page in a few minutes',
          'IPFS networks can be slow during high traffic'
        ],
        retryable: true,
        context: { ipfsHash, service: 'ipfs' }
      })
    }
  
    static openSeaError(tokenId: string): CryptoKaijuError {
      return new CryptoKaijuError({
        type: ErrorType.OPENSEA,
        severity: ErrorSeverity.LOW,
        message: `OpenSea API error for token: ${tokenId}`,
        userMessage: `Marketplace data is temporarily unavailable.`,
        technicalDetails: `OpenSea API request failed for token: ${tokenId}`,
        suggestions: [
          'NFT details are still available from the blockchain',
          'Marketplace data will reload automatically when available',
          'Try viewing the NFT on OpenSea directly'
        ],
        retryable: true,
        context: { tokenId, service: 'opensea' }
      })
    }
  
    static networkError(): CryptoKaijuError {
      return new CryptoKaijuError({
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.HIGH,
        message: 'Network connection error',
        userMessage: `Unable to connect to the blockchain network.`,
        technicalDetails: 'Failed to connect to Ethereum network',
        suggestions: [
          'Check your internet connection',
          'Make sure your wallet is connected',
          'Try switching to a different network and back',
          'Wait a moment and try again'
        ],
        retryable: true,
        context: { network: 'ethereum' }
      })
    }
  
    static walletError(details?: string): CryptoKaijuError {
      return new CryptoKaijuError({
        type: ErrorType.CONTRACT,
        severity: ErrorSeverity.HIGH,
        message: `Wallet connection error: ${details || 'Unknown'}`,
        userMessage: `Please connect your wallet to continue.`,
        technicalDetails: details,
        suggestions: [
          'Click the "Connect Wallet" button',
          'Make sure your wallet extension is unlocked',
          'Try refreshing the page if the wallet doesn\'t respond',
          'Switch to a supported wallet if needed'
        ],
        retryable: true,
        context: { component: 'wallet' }
      })
    }
  
    static rateLimitError(service: string): CryptoKaijuError {
      return new CryptoKaijuError({
        type: ErrorType.RATE_LIMIT,
        severity: ErrorSeverity.MEDIUM,
        message: `Rate limit exceeded for ${service}`,
        userMessage: `Too many requests. Please wait a moment and try again.`,
        technicalDetails: `API rate limit exceeded for service: ${service}`,
        suggestions: [
          'Wait 30 seconds before trying again',
          'Avoid rapid successive requests',
          'Try again during off-peak hours'
        ],
        retryable: true,
        context: { service, rateLimited: true }
      })
    }
  
    static validationError(field: string, value: any): CryptoKaijuError {
      return new CryptoKaijuError({
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        message: `Validation failed for ${field}: ${value}`,
        userMessage: `Please check your input and try again.`,
        technicalDetails: `Invalid value for field ${field}: ${value}`,
        suggestions: [
          'Double-check the format of your input',
          'Make sure all required fields are filled',
          'Contact support if you believe this is correct'
        ],
        retryable: false,
        context: { field, value, validationType: 'input' }
      })
    }
  
    static securityError(details: string): CryptoKaijuError {
      return new CryptoKaijuError({
        type: ErrorType.SECURITY,
        severity: ErrorSeverity.CRITICAL,
        message: `Security validation failed: ${details}`,
        userMessage: `Security check failed. Please refresh and try again.`,
        technicalDetails: details,
        suggestions: [
          'Refresh the page completely',
          'Clear your browser cache',
          'Make sure you\'re on the official CryptoKaiju website',
          'Contact support if the issue persists'
        ],
        retryable: false,
        context: { security: true, critical: true }
      })
    }
  }
  
  /**
   * Error handler utility for consistent error processing
   */
  export class ErrorHandler {
    /**
     * Convert any error to a CryptoKaijuError
     */
    static normalize(error: any, context?: Record<string, any>): CryptoKaijuError {
      if (error instanceof CryptoKaijuError) {
        return error
      }
  
      // Detect specific error types
      const errorMessage = error?.message || error?.toString() || 'Unknown error'
      const lowerMessage = errorMessage.toLowerCase()
  
      // Network errors
      if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
        return ErrorFactory.networkError()
      }
  
      // Rate limiting
      if (lowerMessage.includes('rate limit') || lowerMessage.includes('429')) {
        return ErrorFactory.rateLimitError('unknown')
      }
  
      // Not found errors
      if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
        const identifier = context?.identifier || context?.tokenId || context?.nfcId || 'unknown'
        return ErrorFactory.nftNotFound(identifier)
      }
  
      // IPFS errors
      if (lowerMessage.includes('ipfs') || context?.service === 'ipfs') {
        return ErrorFactory.ipfsError(context?.ipfsHash || 'unknown')
      }
  
      // OpenSea errors
      if (lowerMessage.includes('opensea') || context?.service === 'opensea') {
        return ErrorFactory.openSeaError(context?.tokenId || 'unknown')
      }
  
      // Generic fallback
      return new CryptoKaijuError({
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.MEDIUM,
        message: errorMessage,
        userMessage: 'An unexpected error occurred. Please try again.',
        technicalDetails: errorMessage,
        suggestions: [
          'Try refreshing the page',
          'Check your internet connection',
          'Contact support if the issue persists'
        ],
        retryable: true,
        context: { ...context, originalError: error }
      })
    }
  
    /**
     * Log error with appropriate level
     */
    static log(error: CryptoKaijuError): void {
      const logData = {
        type: error.type,
        severity: error.severity,
        message: error.message,
        userMessage: error.userMessage,
        retryable: error.retryable,
        timestamp: error.timestamp,
        context: error.context
      }
  
      switch (error.severity) {
        case ErrorSeverity.CRITICAL:
          console.error('🚨 CRITICAL ERROR:', logData)
          break
        case ErrorSeverity.HIGH:
          console.error('❌ HIGH SEVERITY ERROR:', logData)
          break
        case ErrorSeverity.MEDIUM:
          console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData)
          break
        case ErrorSeverity.LOW:
          console.log('ℹ️ LOW SEVERITY ERROR:', logData)
          break
      }
    }
  
    /**
     * Get user-friendly error message
     */
    static getUserMessage(error: any): string {
      const normalized = ErrorHandler.normalize(error)
      return normalized.userMessage
    }
  
    /**
     * Check if error is retryable
     */
    static isRetryable(error: any): boolean {
      const normalized = ErrorHandler.normalize(error)
      return normalized.retryable
    }
  
    /**
     * Get suggestions for fixing error
     */
    static getSuggestions(error: any): string[] {
      const normalized = ErrorHandler.normalize(error)
      return normalized.suggestions
    }
  }
  
  /**
   * React hook for error handling (bonus)
   */
  export function useErrorHandler() {
    const handleError = (error: any, context?: Record<string, any>) => {
      const normalizedError = ErrorHandler.normalize(error, context)
      ErrorHandler.log(normalizedError)
      return normalizedError
    }
  
    return { handleError, ErrorFactory, ErrorHandler }
  }