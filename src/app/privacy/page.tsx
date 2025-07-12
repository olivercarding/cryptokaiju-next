// src/app/privacy/page.tsx
'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Eye, Lock, UserCheck } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function PrivacyPage() {
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
                <Shield className="w-8 h-8 text-kaiju-pink" />
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  Privacy Policy
                </h1>
              </div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                We respect your privacy and are committed to protecting your personal information. Here's how we handle your data.
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
                    <Eye className="w-6 h-6 text-kaiju-pink" />
                    Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Big Monster Ltd (trading as CryptoKaiju) is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, share, and protect your information when you use our website, purchase our products, or interact with our services.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    We comply with the UK General Data Protection Regulation (UK GDPR) and other applicable data protection laws. As a UK-based company, we act as the data controller for your personal information.
                  </p>
                </section>

                {/* Information We Collect */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">1. Information We Collect</h2>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">1.1 Personal Information You Provide</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">When you interact with our services, you may provide:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li><strong>Contact Information:</strong> Name, email address, phone number</li>
                    <li><strong>Shipping Information:</strong> Delivery address, postal code, city, country</li>
                    <li><strong>Payment Information:</strong> Wallet addresses, transaction details (payment card data is processed by our payment providers)</li>
                    <li><strong>Account Information:</strong> Username, preferences, communication history</li>
                    <li><strong>User Content:</strong> Messages, feedback, support requests</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">1.2 Information Automatically Collected</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">When you visit our website, we automatically collect:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li><strong>Technical Information:</strong> IP address, browser type, device information, operating system</li>
                    <li><strong>Usage Information:</strong> Pages visited, time spent, referring websites, clickstream data</li>
                    <li><strong>Location Information:</strong> General location based on IP address</li>
                    <li><strong>Cookies and Tracking:</strong> See our Cookie Policy section below</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">1.3 Blockchain Information</h3>
                  <p className="text-gray-700 leading-relaxed">
                    When you interact with NFTs or blockchain transactions, certain information becomes publicly available on the Ethereum blockchain, including wallet addresses, transaction amounts, and timestamps. This information is permanent and cannot be deleted.
                  </p>
                </section>

                {/* How We Use Your Information */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">2. How We Use Your Information</h2>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">We process your personal information for the following purposes:</p>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">2.1 Service Provision (Contractual Necessity)</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li>Processing and fulfilling your orders</li>
                    <li>Delivering physical products to you</li>
                    <li>Providing customer support and responding to inquiries</li>
                    <li>Managing your account and preferences</li>
                    <li>Facilitating NFT minting and blockchain interactions</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">2.2 Legitimate Business Interests</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li>Improving our website and services</li>
                    <li>Analyzing usage patterns and user behavior</li>
                    <li>Preventing fraud and enhancing security</li>
                    <li>Conducting research and development</li>
                    <li>Managing our business operations</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">2.3 With Your Consent</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li>Sending marketing communications and newsletters</li>
                    <li>Notifying you about new releases and exclusive offers</li>
                    <li>Using cookies for analytics and personalization</li>
                    <li>Sharing success stories or testimonials (with your permission)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">2.4 Legal Compliance</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Complying with legal obligations and regulations</li>
                    <li>Responding to legal requests and court orders</li>
                    <li>Protecting our rights and preventing illegal activities</li>
                  </ul>
                </section>

                {/* Information Sharing */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">3. Information Sharing and Disclosure</h2>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">We may share your information with:</p>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">3.1 Service Providers</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li><strong>Payment Processors:</strong> Stripe, PayPal for payment processing</li>
                    <li><strong>Shipping Partners:</strong> Delivery companies for product fulfillment</li>
                    <li><strong>Cloud Services:</strong> Hosting providers, email services</li>
                    <li><strong>Analytics Providers:</strong> Google Analytics for website insights</li>
                    <li><strong>Customer Support:</strong> Help desk and communication tools</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">3.2 Business Transfers</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If we're acquired, merge with another company, or sell our assets, your information may be transferred as part of that transaction.
                  </p>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">3.3 Legal Requirements</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We may disclose information when required by law, to protect our rights, prevent fraud, or ensure user safety.
                  </p>

                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">3.4 Public Blockchain</h3>
                  <p className="text-gray-700 leading-relaxed">
                    NFT transactions and wallet interactions are recorded on public blockchains and are permanently visible to anyone.
                  </p>
                </section>

                {/* Data Security */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-kaiju-pink" />
                    4. Data Security
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We implement industry-standard security measures to protect your personal information:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li>SSL encryption for all data transmissions</li>
                    <li>Secure hosting with reputable providers</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to personal data on a need-to-know basis</li>
                    <li>Password protection and two-factor authentication where applicable</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                  </p>
                </section>

                {/* International Transfers */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">5. International Data Transfers</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Some of our service providers may be located outside the UK. When we transfer your data internationally, we ensure adequate protection through:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Adequacy decisions by the UK government</li>
                    <li>Standard contractual clauses approved by UK authorities</li>
                    <li>Certification schemes and codes of conduct</li>
                    <li>Other appropriate safeguards as required by law</li>
                  </ul>
                </section>

                {/* Data Retention */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">6. Data Retention</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">We retain your personal information for as long as necessary to:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                    <li>Provide our services and support your account</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes and enforce our agreements</li>
                    <li>Improve our services and prevent fraud</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Specific retention periods:</strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li><strong>Account data:</strong> Until account deletion or 3 years of inactivity</li>
                    <li><strong>Transaction records:</strong> 7 years for tax and legal compliance</li>
                    <li><strong>Marketing data:</strong> Until you unsubscribe or withdraw consent</li>
                    <li><strong>Analytics data:</strong> 26 months (Google Analytics default)</li>
                  </ul>
                </section>

                {/* Your Rights */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4 flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-kaiju-pink" />
                    7. Your Rights
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">Under UK GDPR, you have the following rights:</p>
                  
                  <div className="space-y-4">
                    <div className="bg-kaiju-light-pink rounded-lg p-4">
                      <h4 className="font-semibold text-kaiju-navy mb-2">🔍 Right to Access</h4>
                      <p className="text-gray-700 text-sm">Request a copy of the personal data we hold about you</p>
                    </div>
                    
                    <div className="bg-kaiju-light-pink rounded-lg p-4">
                      <h4 className="font-semibold text-kaiju-navy mb-2">✏️ Right to Rectification</h4>
                      <p className="text-gray-700 text-sm">Correct any inaccurate or incomplete personal data</p>
                    </div>
                    
                    <div className="bg-kaiju-light-pink rounded-lg p-4">
                      <h4 className="font-semibold text-kaiju-navy mb-2">🗑️ Right to Erasure</h4>
                      <p className="text-gray-700 text-sm">Request deletion of your personal data (subject to legal exceptions)</p>
                    </div>
                    
                    <div className="bg-kaiju-light-pink rounded-lg p-4">
                      <h4 className="font-semibold text-kaiju-navy mb-2">⏸️ Right to Restrict Processing</h4>
                      <p className="text-gray-700 text-sm">Limit how we use your personal data in certain circumstances</p>
                    </div>
                    
                    <div className="bg-kaiju-light-pink rounded-lg p-4">
                      <h4 className="font-semibold text-kaiju-navy mb-2">📦 Right to Data Portability</h4>
                      <p className="text-gray-700 text-sm">Receive your data in a structured, machine-readable format</p>
                    </div>
                    
                    <div className="bg-kaiju-light-pink rounded-lg p-4">
                      <h4 className="font-semibold text-kaiju-navy mb-2">❌ Right to Object</h4>
                      <p className="text-gray-700 text-sm">Object to processing based on legitimate interests or for marketing</p>
                    </div>
                    
                    <div className="bg-kaiju-light-pink rounded-lg p-4">
                      <h4 className="font-semibold text-kaiju-navy mb-2">🔄 Right to Withdraw Consent</h4>
                      <p className="text-gray-700 text-sm">Withdraw consent for processing where we rely on consent</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mt-4">
                    <strong>Important note:</strong> Some data on public blockchains cannot be deleted or modified due to the permanent nature of blockchain technology.
                  </p>
                </section>

                {/* Cookies */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">8. Cookies and Tracking</h2>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">We use cookies and similar technologies to enhance your experience:</p>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">8.1 Essential Cookies</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">Required for the website to function properly. These cannot be disabled.</p>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">8.2 Analytics Cookies</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">Help us understand how you use our website (Google Analytics). You can opt out of these.</p>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">8.3 Marketing Cookies</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">Used to show you relevant advertisements. Require your consent.</p>
                  
                  <h3 className="text-xl font-semibold text-kaiju-navy mb-3">8.4 Managing Cookies</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You can control cookies through your browser settings or our cookie banner. Note that disabling certain cookies may limit website functionality.
                  </p>
                </section>

                {/* Children's Privacy */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">9. Children's Privacy</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our services are not intended for anyone under 18 years of age. We do not knowingly collect personal information from children. If you're a parent and believe your child has provided us with personal data, please contact us immediately, and we'll take steps to remove that information.
                  </p>
                </section>

                {/* Third-Party Links */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">10. Third-Party Links and Services</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our website may contain links to third-party websites (like OpenSea, Discord, Twitter). We're not responsible for their privacy practices. We encourage you to read their privacy policies before providing any personal information.
                  </p>
                </section>

                {/* Changes to Policy */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">11. Changes to This Privacy Policy</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal requirements. Significant changes will be communicated via email or prominent website notice. The "Last updated" date at the top indicates when changes were made.
                  </p>
                </section>

                {/* Contact Information */}
                <section>
                  <h2 className="text-2xl font-bold text-kaiju-navy mb-4">12. Contact Us</h2>
                  <div className="bg-kaiju-light-pink rounded-xl p-6">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      For any privacy-related questions, to exercise your rights, or to make a complaint:
                    </p>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Data Protection Officer:</strong> info@cryptokaiju.io</p>
                      <p><strong>Email:</strong> info@cryptokaiju.io</p>
                      <p><strong>Company:</strong> Big Monster Ltd (trading as CryptoKaiju)</p>
                      <p><strong>Address:</strong> 35 Sandileigh Avenue, Hale, Altrincham, WA15 8AT, United Kingdom</p>
                    </div>
                    <div className="mt-4 p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Right to complain:</strong> You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" className="text-kaiju-pink hover:text-kaiju-red underline">ico.org.uk</a> if you believe we've mishandled your personal data.
                      </p>
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