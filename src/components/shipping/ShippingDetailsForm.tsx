// src/components/shipping/ShippingDetailsForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, User, Mail, Phone, MapPin, Globe, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'
import ShippingService, { ShippingAddress, ShippingOption } from '@/lib/services/ShippingService'

interface ShippingDetailsFormProps {
  onSubmit: (address: ShippingAddress, shippingOption: ShippingOption) => void
  onBack: () => void
  isLoading?: boolean
}

// Country list for dropdown
const COUNTRIES = [
  'United Kingdom', 'United States', 'Canada', 'Australia', 'New Zealand',
  'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Austria',
  'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Portugal', 'Poland', 'Czech Republic', 'Hungary', 'Slovakia', 'Slovenia',
  'Croatia', 'Romania', 'Bulgaria', 'Greece', 'Cyprus', 'Malta', 'Estonia',
  'Latvia', 'Lithuania', 'Luxembourg', 'Japan', 'South Korea', 'Singapore',
  'Hong Kong', 'Taiwan', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia',
  'India', 'Thailand', 'Philippines', 'Malaysia', 'Indonesia', 'Vietnam',
  'South Africa', 'Kenya', 'Nigeria', 'Egypt', 'Morocco', 'Israel', 'Turkey',
  'United Arab Emirates', 'Saudi Arabia', 'Russia', 'Ukraine'
].sort()

export default function ShippingDetailsForm({ onSubmit, onBack, isLoading }: ShippingDetailsFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: ''
  })

  const [errors, setErrors] = useState<string[]>([])
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [step, setStep] = useState<'address' | 'shipping'>('address')
  const [ethPriceUSD, setEthPriceUSD] = useState<number>(2500)

  // Fetch ETH price on mount
  useEffect(() => {
    ShippingService.getETHPriceUSD().then(setEthPriceUSD)
  }, [])

  // Update shipping options when country changes
  useEffect(() => {
    if (formData.country) {
      const options = ShippingService.calculateShippingCosts(formData.country)
      setShippingOptions(options)
      setSelectedShipping(options[0] || null) // Auto-select first option
    }
  }, [formData.country])

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const validateAddress = () => {
    const validation = ShippingService.validateShippingAddress(formData)
    setErrors(validation.errors)
    return validation.isValid
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateAddress()) {
      setStep('shipping')
    }
  }

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedShipping) {
      setErrors(['Please select a shipping option'])
      return
    }

    if (validateAddress()) {
      onSubmit(formData, selectedShipping)
    }
  }

  const formatPrice = (priceETH: number, priceUSD: number) => {
    return `${priceETH.toFixed(4)} ETH (~$${priceUSD})`
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
          <span className={step === 'address' ? 'text-kaiju-pink' : 'text-gray-400'}>
            1. Shipping Address
          </span>
          <span className={step === 'shipping' ? 'text-kaiju-pink' : 'text-gray-400'}>
            2. Shipping Method
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-kaiju-pink to-kaiju-red h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: step === 'address' ? '50%' : '100%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'address' && (
          <motion.div
            key="address"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-kaiju-pink" />
                <h2 className="text-2xl font-bold text-kaiju-navy">Shipping Address</h2>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800 mb-1">Please fix the following:</h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleAddressSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                {/* City, State, Postal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                      placeholder="London"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={formData.stateProvince}
                      onChange={(e) => handleInputChange('stateProvince', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                      placeholder="England"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                      placeholder="SW1A 1AA"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaiju-pink focus:border-transparent"
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Continue to Shipping
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'shipping' && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-kaiju-pink" />
                <h2 className="text-2xl font-bold text-kaiju-navy">Shipping Method</h2>
              </div>

              {/* Address Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Shipping to:</h3>
                <div className="text-sm text-gray-600">
                  <div>{formData.firstName} {formData.lastName}</div>
                  <div>{formData.addressLine1}</div>
                  {formData.addressLine2 && <div>{formData.addressLine2}</div>}
                  <div>{formData.city}, {formData.stateProvince} {formData.postalCode}</div>
                  <div>{formData.country}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="text-kaiju-pink text-sm font-medium mt-2 hover:underline"
                >
                  Edit Address
                </button>
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-4">
                {/* Shipping Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Shipping Method:
                  </label>
                  
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedShipping?.id === option.id
                          ? 'border-kaiju-pink bg-kaiju-pink/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping?.id === option.id}
                          onChange={() => setSelectedShipping(option)}
                          className="mt-1 text-kaiju-pink focus:ring-kaiju-pink"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">{option.name}</h4>
                            <span className="font-bold text-kaiju-pink">
                              {formatPrice(option.priceETH, option.priceUSD)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{option.description}</p>
                          <p className="text-sm text-gray-500">Delivery: {option.estimatedDays}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Error Messages */}
                {errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <ul className="text-sm text-red-700 space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Total Summary */}
                {selectedShipping && (
                  <div className="border-t pt-4">
                    <div className="bg-gradient-to-r from-kaiju-navy to-kaiju-purple-dark text-white p-4 rounded-lg">
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Summary
                      </h3>
                      <div className="flex justify-between items-center">
                        <span>Shipping Cost:</span>
                        <span className="font-bold">
                          {formatPrice(selectedShipping.priceETH, selectedShipping.priceUSD)}
                        </span>
                      </div>
                      <div className="text-sm text-white/80 mt-2">
                        ETH Price: ~${ethPriceUSD.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Address
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !selectedShipping}
                    className="flex-1 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Proceed to Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}