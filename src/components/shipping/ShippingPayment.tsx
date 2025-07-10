// src/components/shipping/ShippingPayment.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, CreditCard, AlertTriangle, CheckCircle, ExternalLink, Copy, Loader } from 'lucide-react'
import { useActiveAccount, useSendTransaction } from "thirdweb/react"
import { prepareTransaction } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient } from '@/lib/thirdweb'
import ShippingService, { ShippingAddress, ShippingOption, OrderData } from '@/lib/services/ShippingService'

interface ShippingPaymentProps {
  nftTokenId: string
  nftName: string
  nfcId?: string
  mintTransactionHash: string
  shippingAddress: ShippingAddress
  shippingOption: ShippingOption
  onSuccess: (orderData: OrderData) => void
  onBack: () => void
  specialInstructions?: string
}

export default function ShippingPayment({
  nftTokenId,
  nftName,
  nfcId,
  mintTransactionHash,
  shippingAddress,
  shippingOption,
  onSuccess,
  onBack,
  specialInstructions
}: ShippingPaymentProps) {
  const account = useActiveAccount()
  const { mutate: sendTransaction, isPending, isSuccess } = useSendTransaction()
  
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [ethPriceUSD, setEthPriceUSD] = useState<number>(2500)
  const [copiedWallet, setCopiedWallet] = useState(false)

  const shippingWallet = ShippingService.getShippingWallet()

  // Initialize ETH price
  useState(() => {
    ShippingService.getETHPriceUSD().then(setEthPriceUSD)
  }, [])

  const handlePayment = async () => {
    if (!account) {
      setError('Please connect your wallet')
      return
    }

    setPaymentStatus('processing')
    setError(null)

    try {
      // Convert ETH amount to wei
      const weiAmount = BigInt(Math.round(shippingOption.priceETH * 1e18))

      // Prepare transaction to shipping wallet
      const transaction = prepareTransaction({
        to: shippingWallet,
        chain: ethereum,
        client: thirdwebClient,
        value: weiAmount,
      })

      console.log(`💰 Sending ${shippingOption.priceETH} ETH to ${shippingWallet}`)

      // Send transaction
      sendTransaction(transaction, {
        onSuccess: async (result: any) => {
          console.log('✅ Shipping payment successful:', result.transactionHash)
          setTransactionHash(result.transactionHash)
          setPaymentStatus('submitting')

          // Generate order number
          const generatedOrderNumber = ShippingService.generateOrderNumber()
          setOrderNumber(generatedOrderNumber)

          // Calculate USD amounts
          const totalPaidUSD = await ShippingService.convertETHToUSD(shippingOption.priceETH)

          // Create order data
          const orderData: OrderData = {
            nftTokenId,
            nftName,
            nfcId,
            walletAddress: account.address,
            mintTransactionHash,
            shippingAddress,
            shippingOption,
            shippingPaymentHash: result.transactionHash,
            totalPaidETH: shippingOption.priceETH,
            totalPaidUSD,
            status: 'paid',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            orderNumber: generatedOrderNumber,
            specialInstructions
          }

          try {
            // Submit to Airtable
            const airtableResult = await ShippingService.submitOrderToAirtable(orderData)
            
            if (airtableResult.success) {
              console.log('✅ Order submitted to Airtable:', airtableResult.airtableRecordId)
              
              // Save to localStorage as backup
              ShippingService.saveOrderToLocalStorage(orderData)
              
              setPaymentStatus('success')
              onSuccess(orderData)
            } else {
              throw new Error(airtableResult.error || 'Failed to submit order')
            }

          } catch (submitError) {
            console.error('❌ Error submitting order:', submitError)
            
            // Even if Airtable fails, save locally and mark as success
            // The payment went through, so we don't want to fail the whole process
            ShippingService.saveOrderToLocalStorage(orderData)
            
            setPaymentStatus('success')
            onSuccess(orderData)
          }
        },
        onError: (error: any) => {
          console.error('❌ Shipping payment failed:', error)
          setPaymentStatus('error')
          setError(error.message || 'Payment transaction failed')
        },
      })

    } catch (error) {
      console.error('❌ Error preparing payment:', error)
      setPaymentStatus('error')
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }

  const copyWalletAddress = async () => {
    try {
      await navigator.clipboard.writeText(shippingWallet)
      setCopiedWallet(true)
      setTimeout(() => setCopiedWallet(false), 2000)
    } catch (error) {
      console.error('Failed to copy wallet address')
    }
  }

  const formatPrice = (priceETH: number, priceUSD: number) => {
    return `${priceETH.toFixed(4)} ETH (~$${priceUSD})`
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader className="w-6 h-6 animate-spin text-blue-500" />
      case 'submitting':
        return <Loader className="w-6 h-6 animate-spin text-yellow-500" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      default:
        return <CreditCard className="w-6 h-6 text-kaiju-pink" />
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing payment transaction...'
      case 'submitting':
        return 'Submitting order details...'
      case 'success':
        return `Order ${orderNumber} created successfully!`
      case 'error':
        return 'Payment failed'
      default:
        return 'Ready to process payment'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          {getStatusIcon()}
          <h2 className="text-2xl font-bold text-kaiju-navy">Payment for Shipping</h2>
        </div>

        {/* Status Message */}
        <div className={`mb-6 p-4 rounded-lg ${
          paymentStatus === 'success' ? 'bg-green-50 text-green-800' :
          paymentStatus === 'error' ? 'bg-red-50 text-red-800' :
          paymentStatus === 'processing' || paymentStatus === 'submitting' ? 'bg-blue-50 text-blue-800' :
          'bg-gray-50 text-gray-800'
        }`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusMessage()}</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border rounded-lg p-6 mb-6">
          <h3 className="font-bold text-lg text-kaiju-navy mb-4">Order Summary</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">NFT:</span>
              <span className="font-medium">{nftName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token ID:</span>
              <span className="font-medium">#{nftTokenId}</span>
            </div>
            {nfcId && (
              <div className="flex justify-between">
                <span className="text-gray-600">NFC ID:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{nfcId}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Method:</span>
                <span className="font-medium">{shippingOption.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Time:</span>
                <span className="text-gray-800">{shippingOption.estimatedDays}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border rounded-lg p-6 mb-6">
          <h3 className="font-bold text-lg text-kaiju-navy mb-4">Shipping Address</h3>
          <div className="text-sm text-gray-600">
            <div className="font-medium text-gray-900">{shippingAddress.firstName} {shippingAddress.lastName}</div>
            <div>{shippingAddress.addressLine1}</div>
            {shippingAddress.addressLine2 && <div>{shippingAddress.addressLine2}</div>}
            <div>{shippingAddress.city}, {shippingAddress.stateProvince} {shippingAddress.postalCode}</div>
            <div>{shippingAddress.country}</div>
            <div className="mt-2 text-kaiju-pink">{shippingAddress.email}</div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-gradient-to-r from-kaiju-navy to-kaiju-purple-dark text-white p-6 rounded-lg mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Amount to Pay:</span>
              <span className="font-bold text-lg">
                {formatPrice(shippingOption.priceETH, shippingOption.priceUSD)}
              </span>
            </div>
            
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between text-sm opacity-80">
                <span>Payment Method:</span>
                <span>Ethereum (ETH)</span>
              </div>
              <div className="flex justify-between text-sm opacity-80">
                <span>Network:</span>
                <span>Ethereum Mainnet</span>
              </div>
            </div>

            {/* Shipping Wallet */}
            <div className="border-t border-white/20 pt-3">
              <div className="text-sm opacity-80 mb-1">Shipping Wallet:</div>
              <div className="flex items-center gap-2 bg-white/10 p-2 rounded">
                <span className="font-mono text-sm flex-1">{shippingWallet}</span>
                <button
                  onClick={copyWalletAddress}
                  className="text-white/80 hover:text-white transition-colors"
                  title="Copy wallet address"
                >
                  {copiedWallet ? (
                    <CheckCircle className="w-4 h-4 text-green-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Hash */}
        {transactionHash && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Payment Transaction</h4>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-green-700 flex-1">{transactionHash}</span>
              <a
                href={`https://etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 transition-colors"
                title="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Payment Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {specialInstructions && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Special Instructions</h4>
            <p className="text-sm text-blue-700">{specialInstructions}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={paymentStatus === 'processing' || paymentStatus === 'submitting'}
            className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          {paymentStatus === 'success' ? (
            <button
              type="button"
              onClick={() => onSuccess}
              className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Order Complete
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePayment}
              disabled={!account || paymentStatus === 'processing' || paymentStatus === 'submitting'}
              className="flex-1 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {paymentStatus === 'processing' || paymentStatus === 'submitting' ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {paymentStatus === 'processing' ? 'Processing...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Pay {formatPrice(shippingOption.priceETH, shippingOption.priceUSD)}
                </>
              )}
            </button>
          )}
        </div>

        {/* Wallet Connection Warning */}
        {!account && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Wallet Required</h4>
                <p className="text-sm text-yellow-700">Please connect your wallet to proceed with payment.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}