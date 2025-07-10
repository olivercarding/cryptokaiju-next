// src/components/shipping/ShippingFlow.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Package, CheckCircle, ExternalLink, Download } from 'lucide-react'
import ShippingDetailsForm from './ShippingDetailsForm'
import ShippingPayment from './ShippingPayment'
import { ShippingAddress, ShippingOption, OrderData } from '@/lib/services/ShippingService'

interface ShippingFlowProps {
  // NFT information from the mint
  nftTokenId: string
  nftName: string
  nfcId?: string
  mintTransactionHash: string
  onComplete?: (orderData: OrderData) => void
  onCancel?: () => void
}

type FlowStep = 'details' | 'payment' | 'confirmation'

export default function ShippingFlow({
  nftTokenId,
  nftName,
  nfcId,
  mintTransactionHash,
  onComplete,
  onCancel
}: ShippingFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('details')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null)
  const [completedOrder, setCompletedOrder] = useState<OrderData | null>(null)
  const [specialInstructions, setSpecialInstructions] = useState<string>('')

  const handleDetailsSubmit = (address: ShippingAddress, option: ShippingOption) => {
    setShippingAddress(address)
    setShippingOption(option)
    setCurrentStep('payment')
  }

  const handlePaymentSuccess = (orderData: OrderData) => {
    setCompletedOrder(orderData)
    setCurrentStep('confirmation')
    onComplete?.(orderData)
  }

  const handleBackToDetails = () => {
    setCurrentStep('details')
  }

  const handleBackToMint = () => {
    onCancel?.()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Package className="w-8 h-8 text-kaiju-pink" />
            <h1 className="text-3xl md:text-4xl font-black text-kaiju-navy">
              Claim Your Physical Collectible
            </h1>
          </div>
          <p className="text-lg text-kaiju-navy/70 max-w-2xl mx-auto">
            Your NFT <strong>{nftName}</strong> comes with a physical collectible! 
            Complete your shipping details to receive your NFC-chipped Kaiju.
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {/* Step 1 */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === 'details' ? 'bg-kaiju-pink text-white' : 
              currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-100 text-green-800' : 
              'bg-gray-100 text-gray-500'
            }`}>
              {currentStep === 'payment' || currentStep === 'confirmation' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current opacity-50" />
              )}
              <span className="font-medium text-sm">Shipping Details</span>
            </div>

            {/* Arrow */}
            <div className="w-8 h-0.5 bg-gray-300" />

            {/* Step 2 */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === 'payment' ? 'bg-kaiju-pink text-white' : 
              currentStep === 'confirmation' ? 'bg-green-100 text-green-800' : 
              'bg-gray-100 text-gray-500'
            }`}>
              {currentStep === 'confirmation' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current opacity-50" />
              )}
              <span className="font-medium text-sm">Payment</span>
            </div>

            {/* Arrow */}
            <div className="w-8 h-0.5 bg-gray-300" />

            {/* Step 3 */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {currentStep === 'confirmation' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current opacity-50" />
              )}
              <span className="font-medium text-sm">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShippingDetailsForm
                onSubmit={handleDetailsSubmit}
                onBack={handleBackToMint}
              />
            </motion.div>
          )}

          {currentStep === 'payment' && shippingAddress && shippingOption && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShippingPayment
                nftTokenId={nftTokenId}
                nftName={nftName}
                nfcId={nfcId}
                mintTransactionHash={mintTransactionHash}
                shippingAddress={shippingAddress}
                shippingOption={shippingOption}
                onSuccess={handlePaymentSuccess}
                onBack={handleBackToDetails}
                specialInstructions={specialInstructions}
              />
            </motion.div>
          )}

          {currentStep === 'confirmation' && completedOrder && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OrderConfirmation 
                orderData={completedOrder}
                onContinue={() => window.location.href = '/my-kaiju'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Order Confirmation Component
interface OrderConfirmationProps {
  orderData: OrderData
  onContinue: () => void
}

function OrderConfirmation({ orderData, onContinue }: OrderConfirmationProps) {
  const downloadOrderReceipt = () => {
    const receiptData = {
      orderNumber: orderData.orderNumber,
      nftName: orderData.nftName,
      nftTokenId: orderData.nftTokenId,
      nfcId: orderData.nfcId,
      shippingMethod: orderData.shippingOption.name,
      shippingCost: `${orderData.totalPaidETH} ETH (~$${orderData.totalPaidUSD})`,
      customerName: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
      shippingAddress: [
        orderData.shippingAddress.addressLine1,
        orderData.shippingAddress.addressLine2,
        orderData.shippingAddress.city,
        orderData.shippingAddress.stateProvince,
        orderData.shippingAddress.postalCode,
        orderData.shippingAddress.country
      ].filter(Boolean).join('\n'),
      paymentTransaction: orderData.shippingPaymentHash,
      createdAt: orderData.createdAt
    }

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cryptokaiju-order-${orderData.orderNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 15 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div className="inline-flex items-center gap-3 bg-green-100 backdrop-blur-sm rounded-full px-6 py-3 border border-green-200">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800 font-bold">Order Confirmed!</span>
          </div>
        </motion.div>

        {/* Order Details */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-kaiju-navy mb-2">
            Thank You for Your Order!
          </h2>
          <p className="text-lg text-kaiju-navy/70 mb-6">
            Your CryptoKaiju is on its way to you!
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <div className="font-medium text-gray-900 mb-1">Order Number</div>
                <div className="text-kaiju-pink font-mono">{orderData.orderNumber}</div>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 mb-1">NFT</div>
                <div className="text-gray-700">{orderData.nftName} (#{orderData.nftTokenId})</div>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 mb-1">Shipping Method</div>
                <div className="text-gray-700">{orderData.shippingOption.name}</div>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 mb-1">Estimated Delivery</div>
                <div className="text-gray-700">{orderData.shippingOption.estimatedDays}</div>
              </div>
            </div>
          </div>

          {orderData.shippingPaymentHash && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Payment Transaction</h4>
              <div className="flex items-center gap-2 justify-center">
                <span className="font-mono text-sm text-blue-700">
                  {orderData.shippingPaymentHash.slice(0, 10)}...{orderData.shippingPaymentHash.slice(-8)}
                </span>
                <a
                  href={`https://etherscan.io/tx/${orderData.shippingPaymentHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* What Happens Next */}
        <div className="mb-8 p-6 bg-gradient-to-r from-kaiju-navy to-kaiju-purple-dark text-white rounded-lg">
          <h3 className="font-bold text-lg mb-4">What Happens Next?</h3>
          <div className="text-left space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-kaiju-pink rounded-full flex items-center justify-center text-white font-bold text-xs mt-0.5">1</div>
              <div>
                <div className="font-medium">Order Processing</div>
                <div className="text-white/80">We'll prepare your CryptoKaiju for shipping (1-2 business days)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-kaiju-pink rounded-full flex items-center justify-center text-white font-bold text-xs mt-0.5">2</div>
              <div>
                <div className="font-medium">Shipping Notification</div>
                <div className="text-white/80">You'll receive tracking information via email</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-kaiju-pink rounded-full flex items-center justify-center text-white font-bold text-xs mt-0.5">3</div>
              <div>
                <div className="font-medium">Delivery</div>
                <div className="text-white/80">Your NFC-chipped collectible arrives at your door!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadOrderReceipt}
            className="bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            View My Collection
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
          <p className="text-sm text-gray-600">
            If you have any questions about your order, please keep your order number <strong>{orderData.orderNumber}</strong> handy 
            and contact us through our Discord community or social media channels.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ---

// src/pages/shipping/[nftId].tsx (Page wrapper for the shipping flow)
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import ShippingFlow from '@/components/shipping/ShippingFlow'

function ShippingPageContent() {
  const searchParams = useSearchParams()
  
  const nftTokenId = searchParams.get('tokenId') || ''
  const nftName = searchParams.get('name') || 'Unknown Kaiju'
  const nfcId = searchParams.get('nfcId') || undefined
  const mintTransactionHash = searchParams.get('mintTx') || ''

  const handleComplete = () => {
    // Redirect to collection or success page
    window.location.href = '/my-kaiju'
  }

  const handleCancel = () => {
    // Go back to the main page or collection
    window.location.href = '/'
  }

  return (
    <>
      <Header />
      <ShippingFlow
        nftTokenId={nftTokenId}
        nftName={nftName}
        nfcId={nfcId}
        mintTransactionHash={mintTransactionHash}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </>
  )
}

export default function ShippingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-kaiju-light-pink to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-kaiju-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-kaiju-navy font-bold">Loading shipping details...</div>
        </div>
      </div>
    }>
      <ShippingPageContent />
    </Suspense>
  )
}