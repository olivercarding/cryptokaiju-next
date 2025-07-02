// src/components/dev/BlockchainTestPanel.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Zap, Database, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useBlockchainTest } from '@/lib/hooks/useBlockchainCryptoKaiju'
import BlockchainCryptoKaijuService from '@/lib/services/BlockchainCryptoKaijuService'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  duration?: number
}

export default function BlockchainTestPanel() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [customTokenId, setCustomTokenId] = useState('1')
  const [customNfcId, setCustomNfcId] = useState('')

  const addTest = (test: TestResult) => {
    setTests(prev => [...prev, test])
  }

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test))
  }

  const runComprehensiveTest = async () => {
    setIsRunning(true)
    setTests([])

    const testSuite = [
      {
        name: 'Smart Contract Connection',
        test: async () => {
          const stats = await BlockchainCryptoKaijuService.getCollectionStats()
          if (stats.totalSupply > 0) {
            return `✅ Connected! Total supply: ${stats.totalSupply}`
          } else {
            throw new Error('Could not fetch total supply')
          }
        }
      },
      {
        name: `Token ID Lookup (#${customTokenId})`,
        test: async () => {
          const result = await BlockchainCryptoKaijuService.getByTokenId(customTokenId)
          if (result.nft) {
            return `✅ Found: ${result.nft.ipfsData?.name || 'Unnamed'} (Owner: ${result.nft.owner.slice(0, 6)}...)`
          } else {
            throw new Error(`Token ${customTokenId} not found`)
          }
        }
      },
      {
        name: 'NFC ID Extraction',
        test: async () => {
          const result = await BlockchainCryptoKaijuService.getByTokenId(customTokenId)
          if (result.nft && result.nft.nfcId) {
            return `✅ NFC ID found: ${result.nft.nfcId}`
          } else {
            return `⚠️ No NFC ID found for token ${customTokenId}`
          }
        }
      },
      {
        name: 'Reverse NFC Lookup',
        test: async () => {
          // First get an NFC ID
          const tokenResult = await BlockchainCryptoKaijuService.getByTokenId(customTokenId)
          if (!tokenResult.nft?.nfcId) {
            return `⚠️ Skipped - Token ${customTokenId} has no NFC ID`
          }
          
          const nfcResult = await BlockchainCryptoKaijuService.getByNFCId(tokenResult.nft.nfcId)
          if (nfcResult.nft && nfcResult.nft.tokenId === customTokenId) {
            return `✅ Reverse lookup successful: ${tokenResult.nft.nfcId} -> Token ${customTokenId}`
          } else {
            throw new Error('Reverse lookup failed')
          }
        }
      }
    ]

    // Add custom NFC test if provided
    if (customNfcId.trim()) {
      testSuite.push({
        name: `Custom NFC Lookup (${customNfcId})`,
        test: async () => {
          const result = await BlockchainCryptoKaijuService.getByNFCId(customNfcId.trim())
          if (result.nft) {
            return `✅ Found: Token ${result.nft.tokenId} (${result.nft.ipfsData?.name || 'Unnamed'})`
          } else {
            throw new Error(`NFC ID ${customNfcId} not found`)
          }
        }
      })
    }

    for (let i = 0; i < testSuite.length; i++) {
      const testCase = testSuite[i]
      
      // Add test as pending
      addTest({
        name: testCase.name,
        status: 'pending',
        message: 'Waiting to run...'
      })

      // Wait a bit for UI update
      await new Promise(resolve => setTimeout(resolve, 100))

      // Update to running
      updateTest(i, {
        status: 'running',
        message: 'Running test...'
      })

      const startTime = Date.now()

      try {
        const result = await testCase.test()
        const duration = Date.now() - startTime

        updateTest(i, {
          status: 'success',
          message: result,
          duration
        })
      } catch (error) {
        const duration = Date.now() - startTime
        updateTest(i, {
          status: 'error',
          message: `❌ ${error instanceof Error ? error.message : 'Test failed'}`,
          duration
        })
      }

      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="bg-gray-900 text-white rounded-xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold">Blockchain Service Test Panel</h2>
      </div>

      {/* Test Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Test Token ID:
          </label>
          <input
            type="number"
            value={customTokenId}
            onChange={(e) => setCustomTokenId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="1"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Test NFC ID (optional):
          </label>
          <input
            type="text"
            value={customNfcId}
            onChange={(e) => setCustomNfcId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="043821FA4E6E80"
          />
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={runComprehensiveTest}
        disabled={isRunning}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mb-6"
      >
        {isRunning ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Running Tests...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Run Blockchain Tests
          </>
        )}
      </button>

      {/* Test Results */}
      <div className="space-y-3">
        <AnimatePresence>
          {tests.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getStatusIcon(test.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-white">{test.name}</h4>
                    {test.duration && (
                      <span className="text-xs text-gray-400">
                        {test.duration}ms
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    test.status === 'error' ? 'text-red-400' :
                    test.status === 'success' ? 'text-green-400' :
                    'text-gray-300'
                  }`}>
                    {test.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      {tests.length > 0 && !isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600"
        >
          <h4 className="font-medium text-white mb-2">Test Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {tests.filter(t => t.status === 'success').length}
              </div>
              <div className="text-xs text-gray-400">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {tests.filter(t => t.status === 'error').length}
              </div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {tests.filter(t => t.duration).reduce((sum, t) => sum + (t.duration || 0), 0)}ms
              </div>
              <div className="text-xs text-gray-400">Total Time</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
        <h4 className="font-medium text-blue-300 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Tests query your smart contract directly (no API dependencies)</li>
          <li>• Verifies NFC ID mapping and reverse lookup functionality</li>
          <li>• Much faster than OpenSea API (typically under 1000ms per test)</li>
          <li>• Provides real-time blockchain data</li>
        </ul>
      </div>
    </div>
  )
}