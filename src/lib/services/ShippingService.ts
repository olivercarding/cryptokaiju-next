// src/lib/services/ShippingService.ts
export interface ShippingAddress {
    firstName: string
    lastName: string
    email: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    stateProvince: string
    postalCode: string
    country: string
  }
  
  export interface ShippingOption {
    id: string
    name: string
    description: string
    priceETH: number
    priceUSD: number
    estimatedDays: string
  }
  
  export interface OrderData {
    // NFT Info
    nftTokenId: string
    nftName: string
    nfcId?: string
    walletAddress: string
    mintTransactionHash: string
    
    // Shipping Info
    shippingAddress: ShippingAddress
    shippingOption: ShippingOption
    
    // Payment Info
    shippingPaymentHash?: string
    totalPaidETH: number
    totalPaidUSD: number
    
    // Order Status
    status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered'
    createdAt: string
    updatedAt: string
    
    // Additional Info
    specialInstructions?: string
    orderNumber: string
  }
  
  class ShippingService {
    private readonly AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
    private readonly AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
    private readonly SHIPPING_WALLET = process.env.NEXT_PUBLIC_SHIPPING_WALLET || '0x742d35cc2740651859dcf78ecaa5c7e6f0b53ad4'
  
    /**
     * Calculate shipping costs based on country
     */
    calculateShippingCosts(country: string): ShippingOption[] {
      const baseOptions: ShippingOption[] = []
      
      // Domestic (UK) shipping
      if (country.toLowerCase() === 'united kingdom' || country.toLowerCase() === 'uk') {
        baseOptions.push(
          {
            id: 'uk_standard',
            name: 'UK Standard Shipping',
            description: 'Royal Mail 2nd Class - Tracked',
            priceETH: 0.002, // ~$5 equivalent
            priceUSD: 5,
            estimatedDays: '3-5 business days'
          },
          {
            id: 'uk_express',
            name: 'UK Express Shipping',
            description: 'Royal Mail 1st Class - Tracked & Signed',
            priceETH: 0.004, // ~$10 equivalent
            priceUSD: 10,
            estimatedDays: '1-2 business days'
          }
        )
      }
      // EU shipping
      else if (this.isEUCountry(country)) {
        baseOptions.push(
          {
            id: 'eu_standard',
            name: 'EU Standard Shipping',
            description: 'International Tracked',
            priceETH: 0.008, // ~$20 equivalent
            priceUSD: 20,
            estimatedDays: '7-14 business days'
          },
          {
            id: 'eu_express',
            name: 'EU Express Shipping',
            description: 'DHL Express',
            priceETH: 0.016, // ~$40 equivalent
            priceUSD: 40,
            estimatedDays: '3-5 business days'
          }
        )
      }
      // Rest of World
      else {
        baseOptions.push(
          {
            id: 'intl_standard',
            name: 'International Standard',
            description: 'International Tracked (uninsured)',
            priceETH: 0.012, // ~$30 equivalent
            priceUSD: 30,
            estimatedDays: '10-21 business days'
          },
          {
            id: 'intl_express',
            name: 'International Express',
            description: 'DHL Express (insured)',
            priceETH: 0.024, // ~$60 equivalent
            priceUSD: 60,
            estimatedDays: '5-7 business days'
          }
        )
      }
  
      return baseOptions
    }
  
    /**
     * Validate shipping address
     */
    validateShippingAddress(address: ShippingAddress): { isValid: boolean; errors: string[] } {
      const errors: string[] = []
  
      if (!address.firstName?.trim()) errors.push('First name is required')
      if (!address.lastName?.trim()) errors.push('Last name is required')
      if (!address.email?.trim()) errors.push('Email is required')
      if (!address.addressLine1?.trim()) errors.push('Address line 1 is required')
      if (!address.city?.trim()) errors.push('City is required')
      if (!address.postalCode?.trim()) errors.push('Postal code is required')
      if (!address.country?.trim()) errors.push('Country is required')
  
      // Email validation
      if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
        errors.push('Please enter a valid email address')
      }
  
      // Phone validation (if provided)
      if (address.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(address.phone)) {
        errors.push('Please enter a valid phone number')
      }
  
      return {
        isValid: errors.length === 0,
        errors
      }
    }
  
    /**
     * Generate unique order number
     */
    generateOrderNumber(): string {
      const timestamp = Date.now().toString(36)
      const randomStr = Math.random().toString(36).substring(2, 8)
      return `CK-${timestamp}-${randomStr}`.toUpperCase()
    }
  
    /**
     * Submit order to Airtable
     */
    async submitOrderToAirtable(orderData: OrderData): Promise<{ success: boolean; airtableRecordId?: string; error?: string }> {
      if (!this.AIRTABLE_BASE_ID || !this.AIRTABLE_API_KEY) {
        console.warn('Airtable credentials not configured')
        return { success: false, error: 'Airtable not configured' }
      }
  
      try {
        const airtableRecord = {
          fields: {
            'Order Number': orderData.orderNumber,
            'NFT Token ID': orderData.nftTokenId,
            'NFT Name': orderData.nftName,
            'NFC ID': orderData.nfcId || '',
            'Wallet Address': orderData.walletAddress,
            'Mint Transaction': orderData.mintTransactionHash,
            
            // Customer Info
            'Customer Name': `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
            'Email': orderData.shippingAddress.email,
            'Phone': orderData.shippingAddress.phone || '',
            
            // Shipping Address (formatted for Airtable)
            'Shipping Address': [
              orderData.shippingAddress.addressLine1,
              orderData.shippingAddress.addressLine2,
              orderData.shippingAddress.city,
              orderData.shippingAddress.stateProvince,
              orderData.shippingAddress.postalCode,
              orderData.shippingAddress.country
            ].filter(Boolean).join('\n'),
            
            // Shipping Method
            'Shipping Method': orderData.shippingOption.name,
            'Shipping Cost ETH': orderData.shippingOption.priceETH,
            'Shipping Cost USD': orderData.shippingOption.priceUSD,
            'Estimated Delivery': orderData.shippingOption.estimatedDays,
            
            // Payment Info
            'Payment Transaction': orderData.shippingPaymentHash || '',
            'Total Paid ETH': orderData.totalPaidETH,
            'Total Paid USD': orderData.totalPaidUSD,
            
            // Order Status
            'Status': orderData.status,
            'Created At': orderData.createdAt,
            'Special Instructions': orderData.specialInstructions || '',
            
            // Country for filtering
            'Country': orderData.shippingAddress.country
          }
        }
  
        const response = await fetch(`https://api.airtable.com/v0/${this.AIRTABLE_BASE_ID}/Orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(airtableRecord)
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Airtable API error:', errorData)
          return { success: false, error: `Airtable error: ${response.status}` }
        }
  
        const result = await response.json()
        console.log('✅ Order submitted to Airtable:', result.id)
        
        return { 
          success: true, 
          airtableRecordId: result.id 
        }
  
      } catch (error) {
        console.error('❌ Error submitting to Airtable:', error)
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    }
  
    /**
     * Update order status in Airtable
     */
    async updateOrderStatus(
      airtableRecordId: string, 
      status: OrderData['status'], 
      transactionHash?: string
    ): Promise<boolean> {
      if (!this.AIRTABLE_BASE_ID || !this.AIRTABLE_API_KEY) {
        return false
      }
  
      try {
        const updateFields: any = {
          'Status': status,
          'Updated At': new Date().toISOString()
        }
  
        if (transactionHash) {
          updateFields['Payment Transaction'] = transactionHash
        }
  
        const response = await fetch(`https://api.airtable.com/v0/${this.AIRTABLE_BASE_ID}/Orders/${airtableRecordId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: updateFields
          })
        })
  
        return response.ok
      } catch (error) {
        console.error('Error updating order status:', error)
        return false
      }
    }
  
    /**
     * Get current ETH price for USD conversion
     */
    async getETHPriceUSD(): Promise<number> {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        const data = await response.json()
        return data.ethereum?.usd || 2500 // fallback price
      } catch (error) {
        console.warn('Could not fetch ETH price, using fallback')
        return 2500 // fallback price
      }
    }
  
    /**
     * Convert ETH to USD
     */
    async convertETHToUSD(ethAmount: number): Promise<number> {
      const ethPrice = await this.getETHPriceUSD()
      return parseFloat((ethAmount * ethPrice).toFixed(2))
    }
  
    /**
     * Check if country is in EU
     */
    private isEUCountry(country: string): boolean {
      const euCountries = [
        'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech republic',
        'denmark', 'estonia', 'finland', 'france', 'germany', 'greece',
        'hungary', 'ireland', 'italy', 'latvia', 'lithuania', 'luxembourg',
        'malta', 'netherlands', 'poland', 'portugal', 'romania', 'slovakia',
        'slovenia', 'spain', 'sweden'
      ]
      return euCountries.includes(country.toLowerCase())
    }
  
    /**
     * Get shipping wallet address
     */
    getShippingWallet(): string {
      return this.SHIPPING_WALLET
    }
  
    /**
     * Save order to local storage (backup)
     */
    saveOrderToLocalStorage(orderData: OrderData): void {
      try {
        const existingOrders = this.getOrdersFromLocalStorage()
        existingOrders.push(orderData)
        localStorage.setItem('cryptokaiju_orders', JSON.stringify(existingOrders))
      } catch (error) {
        console.warn('Could not save order to localStorage:', error)
      }
    }
  
    /**
     * Get orders from local storage
     */
    getOrdersFromLocalStorage(): OrderData[] {
      try {
        const ordersStr = localStorage.getItem('cryptokaiju_orders')
        return ordersStr ? JSON.parse(ordersStr) : []
      } catch (error) {
        console.warn('Could not read orders from localStorage:', error)
        return []
      }
    }
  }
  
  export default new ShippingService()