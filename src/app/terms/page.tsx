// src/app/terms/page.tsx
'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Scale, Shield } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function TermsPage() {
  return (
    <>
      <Header />
      
      <main className="text-kaiju-navy overflow-x-hidden">
        {/* Dark Hero Section */}
        <section className="relative bg-gradient-to-br from-kaiju-navy via-kaiju-purple-dark to-kaiju-navy overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,theme(colors.kaiju-pink/20)_0%,transparent_50%)]"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Back Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-white hover:text-kaiju-pink transition-colors font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Scale className="w-8 h-8 text-kaiju-pink" />
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  Terms & Conditions
                </h1>
              </div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Please read these terms carefully. By using CryptoKaiju, you agree to be bound by these conditions.
              </p>
              <p className="text-sm text-white/70 mt-4">
                Last updated: July 12, 2025
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="prose prose-lg max-w-none"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 space-y-8">
                
                {/* Overview */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-kaiju-pink" />
                    Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to CryptoKaiju! This website is operated by Big Monster Ltd (trading as CryptoKaiju), a company registered in England and Wales. Throughout this site, "we," "us," and "our" refer to Big Monster Ltd. By accessing our website or purchasing our products, you agree to these Terms & Conditions, our Privacy Policy, and all applicable laws and regulations.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    <strong>Important:</strong> By minting, purchasing, or trading CryptoKaiju NFTs, you're engaging with blockchain technology and digital assets. Please ensure you understand the risks involved before proceeding.
                  </p>
                </section>

                {/* Acceptance */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing or using any part of our service, you agree to be bound by these Terms & Conditions. If you don't agree with any part of these terms, you may not access our website or use our services. You must be at least 18 years old to use our services.
                  </p>
                </section>

                {/* NFT and Digital Assets */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">2. NFTs and Digital Assets</h2>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">2.1 What You're Purchasing</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    When you purchase a CryptoKaiju, you receive:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li>A physical collectible toy with embedded NFC technology</li>
                    <li>An ERC-721 NFT on the Ethereum blockchain</li>
                    <li>Ownership rights to use, display, and transfer your specific CryptoKaiju</li>
                    <li>Access to holder benefits and future utility (subject to availability)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">2.2 What You Don't Own</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Your purchase does not grant you:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li>Intellectual property rights to the CryptoKaiju brand or artwork</li>
                    <li>Commercial usage rights beyond personal use</li>
                    <li>Any guarantee of future value or utility</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">2.3 Blockchain Transactions</h3>
                  <p className="text-gray-700 leading-relaxed">
                    All NFT transactions occur on the Ethereum blockchain. Once confirmed, transactions are irreversible. Gas fees and transaction costs are your responsibility. We cannot reverse, cancel, or refund blockchain transactions.
                  </p>
                </section>

                {/* Physical Products */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">3. Physical Products</h2>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">3.1 Product Quality</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Our physical collectibles are high-quality vinyl or plush toys manufactured to strict standards. Each contains a tamper-resistant NFC chip that links to your NFT. Removing or damaging this chip will affect the toy's authenticity verification.
                  </p>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">3.2 Adult Collectibles</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    CryptoKaiju are adult collectibles intended for display purposes only. They are not toys for children and should not be given to anyone under 18 years of age.
                  </p>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">3.3 Shipping & Delivery</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Shipping times vary by batch and location. Typical delivery is 1-2 weeks after batch release, plus transit time (usually 10 days from our UK location). You're responsible for providing accurate shipping information and any applicable customs duties.
                  </p>
                </section>

                {/* Payment Terms */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">4. Payment and Pricing</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    NFT minting requires Ethereum (ETH) plus gas fees. Merchandise can be purchased with cryptocurrency or traditional payment methods (Stripe/PayPal). Prices are subject to change without notice. All sales are final unless the product is defective or undelivered.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">4.1 Refund Policy</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Due to the unique nature of NFTs and custom products, refunds are only available for:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>Items not received by the customer</li>
                    <li>Items delivered damaged or defective</li>
                  </ul>
                </section>

                {/* User Responsibilities */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">5. Your Responsibilities</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">You agree to:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your digital wallet and private keys</li>
                    <li>Use our services lawfully and respectfully</li>
                    <li>Not attempt to manipulate, hack, or exploit our systems</li>
                    <li>Not reproduce, distribute, or misuse our intellectual property</li>
                    <li>Understand the risks associated with cryptocurrency and NFTs</li>
                  </ul>
                </section>

                {/* Risks and Disclaimers */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">6. Risks and Disclaimers</h2>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">6.1 Technology Risks</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Blockchain technology and NFTs involve inherent risks including:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li>Cryptocurrency volatility and market fluctuations</li>
                    <li>Technical failures, network congestion, or smart contract bugs</li>
                    <li>Loss of private keys or wallet access</li>
                    <li>Regulatory changes affecting digital assets</li>
                    <li>Platform or marketplace unavailability</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">6.2 No Investment Advice</h3>
                  <p className="text-gray-700 leading-relaxed">
                    CryptoKaiju are collectibles, not investments. We make no promises about future value, utility, or returns. Past performance doesn't indicate future results. Only spend what you can afford to lose.
                  </p>
                </section>

                {/* Limitation of Liability */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">7. Limitation of Liability</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To the maximum extent permitted by law, Big Monster Ltd and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Loss of profits, revenue, or data</li>
                    <li>Cryptocurrency or NFT value fluctuations</li>
                    <li>Technical failures or blockchain issues</li>
                    <li>Unauthorized access to your wallet or accounts</li>
                    <li>Third-party actions or marketplace decisions</li>
                  </ul>
                </section>

                {/* Intellectual Property */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">8. Intellectual Property</h2>
                  <p className="text-gray-700 leading-relaxed">
                    All CryptoKaiju artwork, designs, trademarks, and content remain our intellectual property. Your NFT ownership grants you personal, non-commercial usage rights only. You may display your CryptoKaiju for personal use but cannot create derivative works, sell reproductions, or use it for commercial purposes without explicit written permission.
                  </p>
                </section>

                {/* Third-Party Services */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">9. Third-Party Services</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our services integrate with third-party platforms like OpenSea, MetaMask, and others. We're not responsible for their actions, policies, or availability. Use of third-party services is subject to their own terms and conditions.
                  </p>
                </section>

                {/* Termination */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">10. Termination</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may suspend or terminate your access to our services at any time for violating these terms or for any other reason. Your NFT ownership on the blockchain remains unaffected by any account termination, but you may lose access to additional platform features.
                  </p>
                </section>

                {/* Governing Law */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">11. Governing Law</h2>
                  <p className="text-gray-700 leading-relaxed">
                    These terms are governed by the laws of England and Wales. Any disputes will be resolved in the courts of England and Wales. If any provision is deemed unenforceable, the remaining provisions remain in full effect.
                  </p>
                </section>

                {/* Changes to Terms */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">12. Changes to Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may update these terms at any time. Significant changes will be communicated via email or prominent website notice. Continued use of our services after changes indicates acceptance of the new terms.
                  </p>
                </section>

                {/* Contact */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">13. Contact Information</h2>
                  <div className="bg-kaiju-light-pink rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Questions about these Terms & Conditions? We're here to help:
                    </p>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Email:</strong> info@cryptokaiju.io</p>
                      <p><strong>Company:</strong> Big Monster Ltd (trading as CryptoKaiju)</p>
                      <p><strong>Address:</strong> 35 Sandileigh Avenue, Hale, Altrincham, WA15 8AT, United Kingdom</p>
                    </div>
                  </div>
                </section>

              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}