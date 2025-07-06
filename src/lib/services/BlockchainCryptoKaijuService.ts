/**
   * Get OpenSea data via our secure API proxy
   * Uses our Next.js API route: /api/opensea/chain/ethereum/contract/{address}/nfts/{tokenId}
   */
private async getOpenSeaData(tokenId: string, timeoutMs: number = 10000): Promise<OpenSeaAsset | null> {
  try {
    // Use our secure API proxy instead of direct OpenSea calls
    const proxyUrl = `/api/opensea/chain/ethereum/contract/${KAIJU_NFT_ADDRESS}/nfts/${tokenId}`
    console.log(`🌊 Fetching OpenSea data via proxy: ${proxyUrl} (timeout: ${timeoutMs}ms)`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (response.status === 404) {
      console.warn(`⚠️ NFT ${tokenId} not found on OpenSea`)
      return this.createFallbackOpenSeaData(tokenId)
    }
    
    if (response.status === 503) {
      console.warn(`⚠️ OpenSea API not configured, using fallback data`)
      return this.createFallbackOpenSeaData(tokenId)
    }
    
    if (!response.ok) {
      console.warn(`⚠️ OpenSea proxy returned ${response.status}, creating fallback data`)
      return this.createFallbackOpenSeaData(tokenId)
    }
    
    const data = await response.json()
    if (data?.nft) {
      const nft = data.nft
      console.log(`✅ OpenSea data fetched successfully via proxy: ${nft.name || 'Unnamed'}`)
      return {
        identifier: nft.identifier || tokenId,
        name: nft.name || '',
        description: nft.description || '',
        image_url: nft.image_url || '',
        display_image_url: nft.display_image_url || nft.image_url || '',
        opensea_url: nft.opensea_url || `https://opensea.io/assets/ethereum/${KAIJU_NFT_ADDRESS}/${tokenId}`,
        traits: nft.traits || [],
        rarity: nft.rarity
      }
    }
    
    return this.createFallbackOpenSeaData(tokenId)
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⏰ OpenSea proxy fetch timed out after ${timeoutMs}ms, using fallback`)
    } else {
      console.warn(`⚠️ OpenSea proxy fetch failed, using fallback:`, error.message)
    }
    return this.createFallbackOpenSeaData(tokenId)
  }
}