// src/components/pages/FAQPageClient.tsx - Client Component for FAQ Page
'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Zap, Shield, Package, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Header from '@/components/layout/Header'

interface FAQItem {
  question: string
  answer: string | JSX.Element
}

interface FAQSection {
  title: string
  icon: JSX.Element
  items: FAQItem[]
}

export default function FAQPageClient() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const faqSections: FAQSection[] = [
    {
      title: "How CryptoKaiju Work",
      icon: <HelpCircle className="w-5 h-5" />,
      items: [
        {
          question: "What is CryptoKaiju and how does it work?",
          answer: (
            <div className="space-y-3">
              <p>CryptoKaiju is a pioneering NFT project launched in 2018 that bridges the physical and digital worlds by combining high-quality collectible toys with blockchain technology.</p>
              
              <p><strong>Each CryptoKaiju consists of two interconnected parts:</strong></p>
              
              <p><strong>Physical Collectible:</strong> High-quality vinyl or plush toys containing a tamper-resistant NFC (Near Field Communication) chip embedded in the foot. These aren't cheap 3D printed toys – they're properly molded collectibles made from premium materials with a 3-4 month development process.</p>
              
              <p><strong>Digital NFT:</strong> An ERC-721 token on Ethereum containing unique metadata like name, traits, batch, and description. The NFT stores all the characteristics that make each Kaiju special.</p>
              
              <p><strong>The Connection:</strong> The NFC chip's unique serial number is locked to the physical toy and referenced in the NFT's metadata, creating an unbreakable link between the two. You can scan the chip with your smartphone to verify authenticity and view the Kaiju's blockchain record.</p>
              
              <p><strong>Why It Matters:</strong> This solves major problems in collectibles – proving authenticity and preventing counterfeiting. The blockchain provides immutable proof of provenance and ownership.</p>
              
              <p>Released in limited batches of 100-300 pieces since 2018, there are approximately 1,400 Kaiju in existence. Each is unique with varying rarity levels. Beyond collecting, Kaiju holders get early access to new releases, Sandbox gaming assets, and exclusive community experiences.</p>
              
            </div>
          )
        },
        {
          question: "What Happens if I Remove the tag from my Kaiju?",
          answer: (
            <div className="space-y-3">
              <p>The physical tag on the foot of the Kaiju collectible serves as a smart certificate of authenticity (COA) and links to a smart contract and the corresponding non-fungible token.</p>
              <p>The tags have been purposely built to be tamper resistant and thus removal or cutting of the tag will stop it from being "scannable" and hinder your ability to prove the provenance and authenticity of your collectible.</p>
              <p>We've only ever had one person do this and they were a Bitcoin SV fan, so it says it all!</p>
            </div>
          )
        },
        {
          question: "What do I Need to Interact With my Kaiju?",
          answer: (
            <div className="space-y-3">
              <p>To use all features of CryptoKaiju you will need to be able to scan the NFC tag on the bottom of the Kaiju's foot and will need:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>An NFC enabled device such as a smart phone, or tablet</li>
                <li>An internet connection to access the Kaiju explorer/ an Ethereum block explorer</li>
              </ul>
            </div>
          )
        },
        {
          question: "Do I Need an Ethereum Address for CryptoKaiju?",
          answer: "To mint a Kaiju you will need an Ethereum wallet capable of storing a Non Fungible Token (NFT)."
        }
      ]
    },
    {
      title: "Collecting & Trading",
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          question: "How many Kaiju will be minted?",
          answer: (
            <div className="space-y-3">
              <p>CryptoKaiju have been released in different batches since 2018, typically a batch contains 2 different designs or colour ways, there tends to be 100 - 300 Kaiju in each release.</p>
              <p>At the moment, there is no fixed supply, but these toys are scarce, we do not envisage suddenly creating 10,000 anytime soon!</p>
              <p>Currently there are approximately <strong><em><a href="https://opensea.io/collection/cryptokaiju" className="text-kaiju-pink hover:text-kaiju-red underline">1,700 Kaiju in existence</a></em></strong></p>
            </div>
          )
        },
        {
          question: "Are Some Kaiju Rarer Than Others?",
          answer: (
            <div className="space-y-3">
              <p>Yes!</p>
              <p>Some batch sizes are smaller than others, for example, Genesis was limited to 125 pcs. Within most batches there tends to be a more common colourway too.</p>
              <p>As all Kaiju NFTs have different traits, some are rarer than others.</p>
              <p>There are several collaborations including CryptoKaiju produced with The Sacramento Kings as well as prototypes that are extremely rare and hard to find.</p>
            </div>
          )
        },
        {
          question: "How Do I Know if my Kaiju is Rare?",
          answer: (
            <div className="space-y-3">
              <p>Within each batch of Kaiju there are chase characters which are released in limited amounts, making them scarcer than others. For example, within the Sushi batch there were only 5 Mr Wasabi, and with our 2nd release there was a significantly smaller amount of Ethereum figures compared to the Bitcoin version.</p>
              <p>In addition to this, some traits are more unique than others.</p>
              <p>You can find out more information about the traits of your Kaiju by visiting our collection page on <a href="https://opensea.io/collection/cryptokaiju" className="text-kaiju-pink hover:text-kaiju-red underline">Opensea</a></p>
            </div>
          )
        },
        {
          question: "What Makes my Kaiju Unique?",
          answer: (
            <div className="space-y-3">
              <p>Each Kaiju is unique and is made up of several different fields which you can see in the NFT metadata:</p>
              <div className="space-y-2 ml-4">
                <p><strong>Name -</strong> Each Kaiju has a unique name. some of them are named after celebrities or people who've made important contributions to the development of encryption/ decentralised technology (Lots are named after singers in bands or rappers).</p>
                <p><strong>D.O.B -</strong> Sometimes this is unique, sometimes it's the mint date.</p>
                <p><strong>Batch -</strong> Batch refers to the batch that the Kaiju was released in (Genesis for example)</p>
                <p><strong>Colour -</strong> Refers to the colour of the figure. We use the term "Colour" pretty loosely, but it is always used to differentiate between the toy within the batch.</p>
                <p><strong>Skill/ Class -</strong> Normally used to define the personality of the Kaiju.</p>
                <p><strong>A Description</strong> - Explains the Kaiju's interests and personality.</p>
                <p><strong>NFC ID -</strong> Each NFC ID is unique (Scan the foot of your physical Kaiju to check this out.)</p>
              </div>
              </div>
          )
        },
        {
          question: "How do I Trade?",
          answer: (
            <div className="space-y-3">
              <p>Crypto Kaiju are comprised of 2 parts which link together to prove that each is authentic and unique.</p>
              <p>Currently, to trade your Kaiju You would have to trade both the physical toy and the corresponding NFT token. We recommend only trading with a party who you trust, or using a 3rd party escrow.</p>
              <p>In the future we hope to launch a platform that simplifies this process and makes trading more secure and easier for owners.</p>
              <p>The best place to trade is via our <a href="https://discord.gg/aaBERPYHJF" className="text-kaiju-pink hover:text-kaiju-red underline">Discord</a>!</p>
            </div>
          )
        }
      ]
    },
    {
      title: "Utility & Experience",
      icon: <Zap className="w-5 h-5" />,
      items: [
        {
          question: "What's the Utility?",
          answer: (
            <div className="space-y-3">
              <p>The obvious answer is that you get a super cute NFT and a great small run vinyl toy to sit on your desk/ shelf while being able to prove you actually own it!</p>
              <p>But being a Kaiju holder is so much more than that, we are constantly developing new and interesting ways to build experiences that our community will enjoy, many of our toys come with Sandbox assets which will be playable when we develop our Land and Kaiju owners always get first dibs on new releases including merch that comes with Metaverse enabled wearables.</p>
              <p>We're a small, tight-knit community that is organically growing, there's no artificial hype, no shadiness, no BS, it's all about the love of the product.</p>
            </div>
          )
        },
        {
          question: "What Else can my Kaiju do?",
          answer: (
            <div className="space-y-3">
              <p>We are committed to building new and exciting experiences that link physical toys to the digital world:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Some Kaiju include assets that let you play with/as them in decentralised worlds such as The Sandbox.</li>
                <li>Kaiju holders are given early access to new releases and merchandise</li>
              </ul>
            </div>
          )
        },
        {
          question: "Take my Money Please, Wen Mint?",
          answer: (
            <div className="space-y-3">
              <p>Woah Nelly, hold your horses! We sell a few different batches every year. Follow us on social, join our Discord and Newsletter and you'll know when we are doing a drop. When we have Kaiju available.</p>
            </div>
          )
        },
        {
          question: "Is This a rug? Sounds Too Good to be True!",
          answer: (
            <div className="space-y-3">
              <p>We get it, there's been a lot of false promises in the space and we've seen a lot of companies try to make toys and not deliver.(There are some lovely ones who have though, go check them out!)</p>
              <p>We definitely aren't going to rug you, we've been doing this since 2018 and have always delivered! We are completely doxed and have nothing to hide.</p>
            </div>
          )
        }
      ]
    },
    {
      title: "Product Quality",
      icon: <Package className="w-5 h-5" />,
      items: [
        {
          question: "Are These Just Cheap 3D Printed Toys?",
          answer: (
            <div className="space-y-3">
              <p>Nope, and we agree 3D printed stuff never looks as good! Kaiju are properly molded and made from high quality vinyl in factories that conform to proper testing and employment laws to ensure we are as ethical as possible.</p>
              <p>The same applies to our plush toys, we work with only the best factories, using the softest plush we can get our hands on.</p>
              <p>The development process for a Kaiju design takes 3-4 months and this is shown in the quality of the product.</p>
            </div>
          )
        },
        {
          question: "Are CryptoKaiju suitable for children?",
          answer: "No, CryptoKaiju are adult collectibles intended for display purposes, they are developed to be purchased and enjoyed by adults only. We do not recommend giving them to children."
        }
      ]
    },
    {
      title: "Orders & Payments",
      icon: <CreditCard className="w-5 h-5" />,
      items: [
        {
          question: "What Payment Methods are Accepted on the Site?",
          answer: (
            <div className="space-y-3">
              <p>We allow cross chain transactions and also support purchasing with credit/debit cards.</p>
            </div>
          )
        },
        {
          question: "How do I Contact the Team?",
          answer: "Email/ Discord/ Twitter or via the Contact us Page."
        },
        {
          question: "Can I get a Refund?",
          answer: (
            <div className="space-y-3">
              <p>Due to the custom nature of the item, refunds will only be available on items that are:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Not received by the customer.</li>
                <li>Are delivered faulty, or damaged during delivery.</li>
              </ul>
            </div>
          )
        },
        {
          question: "How Long Does Delivery Take?",
          answer: "Delivery depends on your location. We are based in the UK and typically expect an item to be received within 10 days of us mailing it, though this can be longer during busy periods (Holidays etc.)"
        }
      ]
    }
  ]

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
            <motion.div 
              className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_30%,theme(colors.kaiju-purple-light/30)_0%,transparent_50%)]"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4]
              }}
              transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            />
          </div>

          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-kaiju-pink rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
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
                <HelpCircle className="w-8 h-8 text-kaiju-pink" />
                <h1 className="text-4xl md:text-5xl font-black text-white">
                  Frequently Asked Questions
                </h1>
              </div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Get answers to common questions about CryptoKaiju NFTs, physical collectibles, and how it all works.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content Section */}
        <section className="bg-gradient-to-br from-kaiju-light-pink to-white py-20 px-6">
          <div className="max-w-4xl mx-auto">
            {faqSections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                className="mb-12"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-kaiju-pink">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-kaiju-navy">{section.title}</h2>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => {
                    const isOpen = openItems[`${sectionIndex}-${itemIndex}`]
                    
                    return (
                      <div
                        key={itemIndex}
                        className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(sectionIndex, itemIndex)}
                          className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-kaiju-navy pr-4">
                            {item.question}
                          </h3>
                          <div className="text-kaiju-pink flex-shrink-0">
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </button>
                        
                        <motion.div
                          initial={false}
                          animate={{
                            height: isOpen ? 'auto' : 0,
                            opacity: isOpen ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                            {typeof item.answer === 'string' ? (
                              <p>{item.answer}</p>
                            ) : (
                              item.answer
                            )}
                          </div>
                        </motion.div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-16"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
                <h3 className="text-2xl font-bold text-kaiju-navy mb-4">Ready to Start Collecting?</h3>
                <p className="text-kaiju-navy/70 mb-6">
                  Now that you know how CryptoKaiju work, explore the collection and start minting your unique Kaiju!
                </p>
                <Link
                  href="/#hero"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-kaiju-pink to-kaiju-red text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Zap className="w-5 h-5" />
                  Start Collecting
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}