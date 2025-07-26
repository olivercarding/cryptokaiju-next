// src/components/shared/ErrorDisplay.tsx - Enhanced Error Display Component
"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RefreshCw, ExternalLink, MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { ErrorHandler, CryptoKaijuError, ErrorSeverity, ErrorType } from '@/lib/utils/errorHandling'

interface ErrorDisplayProps {
  // The error to display.  Made optional so that the component can safely render
  // nothing when no error is provided.
  error?: any
  onRetry?: () => void
  onDismiss?: () => void
  context?: Record<string, any>
  showTechnicalDetails?: boolean
  className?: string
}

export default function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  context,
  showTechnicalDetails = false,
  className = ''
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  // If no error exists, render nothing
  if (!error) return null

  const normalizedError = ErrorHandler.normalize(error, context)

  const handleRetry = async () => {
    if (!onRetry || !normalizedError.retryable) return

    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const getSeverityStyles = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return {
          container: 'bg-red-50 border-red-200 text-red-900',
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case ErrorSeverity.HIGH:
        return {
          container: 'bg-orange-50 border-orange-200 text-orange-900',
          icon: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700 text-white'
        }
      case ErrorSeverity.MEDIUM:
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
          icon: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }
      case ErrorSeverity.LOW:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-900',
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-900',
          icon: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        }
    }
  }

  const styles = getSeverityStyles(normalizedError.severity)

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return '🌐'
      case ErrorType.CONTRACT:
        return '⛓️'
      case ErrorType.IPFS:
        return '📁'
      case ErrorType.OPENSEA:
        return '🌊'
      case ErrorType.NOT_FOUND:
        return '🔍'
      case ErrorType.RATE_LIMIT:
        return '⏰'
      case ErrorType.SECURITY:
        return '🔒'
      case ErrorType.VALIDATION:
        return '⚠️'
      default:
        return '❌'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`border-2 rounded-xl p-6 shadow-lg ${styles.container} ${className}`}
      >
        <div className="flex items-start gap-4">
          {/* Error Icon */}
          <div className={`flex-shrink-0 ${styles.icon}`}>
            <div className="text-2xl mb-2">{getErrorIcon(normalizedError.type)}</div>
            <AlertTriangle className="w-6 h-6" />
          </div>

          {/* Error Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg mb-1">
                  {normalizedError.type.replace('_', ' ')} Error
                </h3>
                <p className="text-sm opacity-75">
                  {normalizedError.severity} severity • {normalizedError.retryable ? 'Retryable' : 'Non-retryable'}
                </p>
              </div>

              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="opacity-50 hover:opacity-100 transition-opacity p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* User Message */}
            <p className="text-base mb-4 leading-relaxed">
              {normalizedError.userMessage}
            </p>

            {/* Suggestions */}
            {normalizedError.suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  💡 Suggestions:
                </h4>
                <ul className="text-sm space-y-1 opacity-90">
                  {normalizedError.suggestions.slice(0, 3).map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technical Details (Expandable) */}
            {(showTechnicalDetails || normalizedError.technicalDetails) && (
              <div className="mb-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm font-medium opacity-75 hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  🔧 Technical Details
                  <motion.div
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.div>
                </button>
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-3 bg-black/10 rounded-lg">
                        <code className="text-xs font-mono break-all">
                          {normalizedError.technicalDetails || normalizedError.message}
                        </code>
                        {normalizedError.context && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer opacity-75">Context</summary>
                            <pre className="text-xs mt-1 opacity-75">
                              {JSON.stringify(normalizedError.context, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Retry Button */}
              {normalizedError.retryable && onRetry && (
                <motion.button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${styles.button} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <motion.div
                    animate={{ rotate: isRetrying ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isRetrying ? Infinity : 0, ease: 'linear' }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </motion.button>
              )}

              {/* Help Button */}
              <motion.button
                onClick={() => window.open('https://discord.gg/aaBERPYHJF', '_blank')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Get Help
              </motion.button>

              {/* Context-specific Action */}
              {normalizedError.type === ErrorType.NOT_FOUND && (
                <motion.button
                  onClick={() => (window.location.href = '/kaijudex')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Browse All Kaiju
                </motion.button>
              )}
            </div>

            {/* Timestamp */}
            <div className="mt-4 pt-3 border-t border-current/20">
              <p className="text-xs opacity-50">
                Error occurred at {normalizedError.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Simplified error boundary wrapper
export function withErrorDisplay<T extends object>(
  Component: React.ComponentType<T>,
  fallbackProps?: Partial<ErrorDisplayProps>
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorDisplay {...fallbackProps}>
        <Component {...props} />
      </ErrorDisplay>
    )
  }
}