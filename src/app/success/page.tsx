// src/app/success/page.tsx - Updated with ETH shipping payments
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Wallet, MapPin, User, Mail, Phone, AlertCircle } from 'lucide-react'
import { useActiveAccount, useSendTransaction } from "thirdweb/react"
import { prepareTransaction, toWei } from "thirdweb"
import { ethereum } from "thirdweb/chains"
import { thirdwebClient } from '@/lib/thirdweb'
import Header from '@/components/layout/Header'

interface MintedNFT {
  nfcId: string
  tokenUri: string
  birthday: number
  metadata?: {
    name: string
    image: string
    description: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
  }
}

interface ShippingForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
  specialInstructions: string
}

interface ShippingRate {
  country: string
  priceUSD: number
  priceETH: number
  estimatedDays: string
}

// Your wallet address for receiving payments
const PAYMENT_ADDRESS = "0x7205a1b9c5cf6494ba2ceb5adcca831c05536912"

export default function SuccessPage() {
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [ethPrice, setEthPrice] = useState<number>(3500) // Default ETH price
  
  // Thirdweb hooks
  const account = useActiveAccount()
  const { mutate: sendTransaction, isPending } = useSendTransaction()
  
  const [formData, setFormData] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    specialInstructions: ''
  })

  // Shipping rates in USD (will be converted to ETH)
  const SHIPPING_RATES_USD = [
    { country: 'US', priceUSD: 15.00, estimatedDays: '5-7 business days' },
    { country: 'CA', priceUSD: 18.00, estimatedDays: '7-10 business days' },
    { country: 'GB', priceUSD: 12.00, estimatedDays: '7-14 business days' },
    { country: 'DE', priceUSD: 14.00, estimatedDays: '7-14 business days' },
    { country: 'FR', priceUSD: 14.00, estimatedDays: '7-14 business days' },
    { country: 'AU', priceUSD: 22.00, estimatedDays: '10-14 business days' },
    { country: 'JP', priceUSD: 20.00, estimatedDays: '7-14 business days' },
    { country: 'OTHER', priceUSD: 25.00, estimatedDays: '14-21 business days' },
  ]

  const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'OTHER', name: 'Other Country' },
  ]

  // Load minted NFTs from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('mintedNFTs')
    if (stored) {
      try {
        const nfts = JSON.parse(stored)
        setMintedNFTs(nfts)
      } catch (error) {
        console.error('Error parsing stored NFTs:', error)
      }
    }
  }, [])

  // Fetch current ETH price
  useEffect(() => {
    const fetchETHPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        const data = await response.json()
        if (data.ethereum?.usd) {
          setEthPrice(data.ethereum.usd)
          console.log(`💰 ETH Price: $${data.ethereum.usd}`)
        }
      } catch (error) {
        console.warn('Failed to fetch ETH price, using default:', error)
      }
    }
    fetchETHPrice()
  }, [])

  // Calculate shipping rates with ETH conversion
  const getShippingRates = (): ShippingRate[] => {
    return SHIPPING_RATES_USD.map(rate => ({
      ...rate,
      priceETH: rate.priceUSD / ethPrice
    }))
  }

  const getShippingRate = (): ShippingRate => {
    const rates = getShippingRates()
    return rates.find(rate => rate.country === formData.country) || 
           rates.find(rate => rate.country === 'OTHER')!
  }

  const shippingRate = getShippingRate()
  const totalCostUSD = shippingRate.priceUSD * mintedNFTs.length
  const totalCostETH = shippingRate.priceETH * mintedNFTs.length

  // Form validation
  const isFormValid = (): boolean => {
    return !!(
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.address1.trim() &&
      formData.city.trim() &&
      formData.postalCode.trim() &&
      formData.country
    )
  }

  // Handle form input changes
  const handleInputChange = (field: keyof ShippingForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Submit order to Airtable with transaction hash
  const submitOrder = async (txHash: string) => {
    try {
      const orderData = {
        orderNumber: `CK-${Date.now()}`,
        mintedNFTs: mintedNFTs.map(nft => ({
          nfcId: nft.nfcId,
          name: nft.metadata?.name || 'Unknown Kaiju',
          tokenUri: nft.tokenUri
        })),
        shippingInfo: formData,
        shippingCostUSD: totalCostUSD,
        shippingCostETH: totalCostETH,
        ethPrice: ethPrice,
        paymentMethod: 'ETH',
        transactionHash: txHash,
        status: 'Payment Confirmed',
        createdAt: new Date().toISOString()
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit order')
      }

      const result = await response.json()
      setOrderNumber(result.orderNumber)
      setCurrentStep(3)

    } catch (error) {
      console.error('Error submitting order:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit order')
    }
  }

  // Handle ETH payment for shipping
  const handleETHPayment = async () => {
    if (!account) {
      setError('Please connect your wallet to pay for shipping')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log(`💸 Processing ETH payment: ${totalCostETH.toFixed(6)} ETH to ${PAYMENT_ADDRESS}`)

      // Prepare direct ETH transfer transaction
      const transaction = prepareTransaction({
        to: PAYMENT_ADDRESS,
        value: toWei(totalCostETH.toString()),
        chain: ethereum,
        client: thirdwebClient,
      })

      // Send the transaction
      sendTransaction(transaction, {
        onSuccess: async (result) => {
          console.log("✅ Shipping payment successful:", result.transactionHash)
          setTransactionHash(result.transactionHash)
          
          // Submit order to Airtable with transaction hash
          await submitOrder(result.transactionHash)
        },
        onError: (error) => {
          console.error("❌ Shipping payment failed:", error)
          setError(`Payment failed: ${error.message}`)
          setIsSubmitting(false)
        },
      })

    } catch (error) {
      console.error("❌ Error preparing shipping payment:", error)
      setError(error instanceof Error ? error.message : 'Failed to prepare payment')
      setIsSubmitting(false)
    }
  }

  if (mintedNFTs.length === 0) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-16 px-6 min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy text-white">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">No NFTs Found</h1>
            <p className="text-white/80 mb-8">
              We couldn't find your minted NFTs. Please try minting again or contact support.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-kaiju-pink text-white px-8 py-4 rounded-xl font-semibold hover:bg-kaiju-red transition-colors"
            >
              Back to Mint
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="pt-32 pb-16 px-6 min-h-screen bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy text-white">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-green-400/30 mb-6">
              <CheckCircle className="text-green-400" size={24} />
              <span className="text-green-400 font-bold text-lg">Mint Successful!</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Claim Your Physical Collectibles
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              You've minted {mintedNFTs.length} unique Kaiju{mintedNFTs.length > 1 ? 's' : ''}! 
              Complete your order to receive your physical collectible{mintedNFTs.length > 1 ? 's' : ''}.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                    currentStep >= step 
                      ? 'bg-kaiju-pink border-kaiju-pink text-white' 
                      : 'border-white/30 text-white/50'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 ${
                      currentStep > step ? 'bg-kaiju-pink' : 'bg-white/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - NFT Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 sticky top-8"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="text-kaiju-pink" size={20} />
                  Your Order
                </h3>
                
                <div className="space-y-4 mb-6">
                  {mintedNFTs.map((nft, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <img
                        src={nft.metadata?.image || '/images/placeholder-kaiju.png'}
                        alt={nft.metadata?.name || 'Kaiju'}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {nft.metadata?.name || `Kaiju #${index + 1}`}
                        </div>
                        <div className="text-xs text-white/60">
                          NFC: {nft.nfcId}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Items ({mintedNFTs.length})</span>
                    <span>Physical collectibles</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping to {COUNTRIES.find(c => c.code === formData.country)?.name}</span>
                    <div className="text-right">
                      <div>${shippingRate.priceUSD.toFixed(2)} each</div>
                      <div className="text-xs text-white/60">≈ Ξ{shippingRate.priceETH.toFixed(6)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-white/20 pt-2">
                    <span>Total</span>
                    <div className="text-right">
                      <div>Ξ{totalCostETH.toFixed(6)}</div>
                      <div className="text-sm text-white/60">${totalCostUSD.toFixed(2)} USD</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/60 text-center">
                    Estimated delivery: {shippingRate.estimatedDays}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              >
                
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <MapPin className="text-kaiju-pink" size={24} />
                      Shipping Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="John"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="john@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Street Address *</label>
                        <input
                          type="text"
                          value={formData.address1}
                          onChange={(e) => handleInputChange('address1', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="123 Main Street"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Apartment, suite, etc.</label>
                        <input
                          type="text"
                          value={formData.address2}
                          onChange={(e) => handleInputChange('address2', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="Apartment 2B"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="New York"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">State/Province</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="NY"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Postal Code *</label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="10001"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Country *</label>
                        <select
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-kaiju-pink focus:outline-none"
                          required
                        >
                          {COUNTRIES.map(country => (
                            <option key={country.code} value={country.code} className="bg-kaiju-navy">
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Special Instructions</label>
                        <textarea
                          value={formData.specialInstructions}
                          onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-kaiju-pink focus:outline-none"
                          placeholder="Leave at front door, ring bell, etc."
                          rows={3}
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentStep(2)}
                      disabled={!isFormValid()}
                      className="w-full mt-8 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg py-4 rounded-xl shadow-xl border-2 border-kaiju-pink/50 hover:shadow-kaiju-pink/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      Continue to Payment
                      <ArrowRight size={20} />
                    </motion.button>
                  </div>
                )}

                {/* Step 2: ETH Payment */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Wallet className="text-kaiju-pink" size={24} />
                      ETH Payment
                    </h2>

                    <div className="bg-white/5 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold mb-4">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{mintedNFTs.length} Physical Collectible{mintedNFTs.length > 1 ? 's' : ''}</span>
                          <span>Included with NFT</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping ({shippingRate.estimatedDays})</span>
                          <div className="text-right">
                            <div>Ξ{totalCostETH.toFixed(6)}</div>
                            <div className="text-xs text-white/60">${totalCostUSD.toFixed(2)} USD</div>
                          </div>
                        </div>
                        <div className="border-t border-white/20 pt-2 flex justify-between font-bold">
                          <span>Total Payment</span>
                          <div className="text-right">
                            <div>Ξ{totalCostETH.toFixed(6)}</div>
                            <div className="text-xs text-white/60">≈ ${totalCostUSD.toFixed(2)} USD</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Wallet className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <div className="font-semibold text-blue-400 mb-1">ETH Payment</div>
                          <div className="text-sm text-blue-200">
                            Your shipping payment will be sent directly to our wallet as ETH. 
                            Much simpler than traditional payments!
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="text-red-400" size={20} />
                          <span className="text-red-200">{error}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentStep(1)}
                        disabled={isSubmitting || isPending}
                        className="flex-1 py-4 px-6 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
                      >
                        Back to Shipping
                      </button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleETHPayment}
                        disabled={isSubmitting || isPending || !account}
                        className="flex-1 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg py-4 rounded-xl shadow-xl border-2 border-kaiju-pink/50 hover:shadow-kaiju-pink/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isSubmitting || isPending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending Payment...
                          </>
                        ) : !account ? (
                          <>
                            <Wallet size={20} />
                            Connect Wallet to Pay
                          </>
                        ) : (
                          <>
                            <Wallet size={20} />
                            Pay Ξ{totalCostETH.toFixed(6)}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && orderNumber && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="text-white" size={40} />
                    </motion.div>

                    <h2 className="text-3xl font-bold mb-4">Order Confirmed!</h2>
                    <p className="text-xl text-white/80 mb-6">
                      Your order #{orderNumber} has been submitted and payment confirmed.
                    </p>

                    {transactionHash && (
                      <div className="bg-white/5 rounded-lg p-4 mb-6">
                        <div className="text-sm text-white/70 mb-1">Transaction Hash:</div>
                        <a 
                          href={`https://etherscan.io/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-kaiju-pink hover:text-white transition-colors font-mono text-sm break-all"
                        >
                          {transactionHash}
                        </a>
                      </div>
                    )}

                    <div className="bg-white/5 rounded-lg p-6 mb-8 text-left">
                      <h3 className="font-semibold mb-4">What happens next?</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-kaiju-pink rounded-full text-white text-xs flex items-center justify-center font-bold">1</div>
                          <div>We'll prepare your physical collectible{mintedNFTs.length > 1 ? 's' : ''} for shipping</div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-kaiju-pink rounded-full text-white text-xs flex items-center justify-center font-bold">2</div>
                          <div>You'll receive a tracking number via email within 1-2 business days</div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-kaiju-pink rounded-full text-white text-xs flex items-center justify-center font-bold">3</div>
                          <div>Your package will arrive in {shippingRate.estimatedDays}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => window.location.href = '/my-kaiju'}
                      className="bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl border-2 border-kaiju-pink/50 hover:shadow-kaiju-pink/25 transition-all duration-300"
                    >
                      View My Collection
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}