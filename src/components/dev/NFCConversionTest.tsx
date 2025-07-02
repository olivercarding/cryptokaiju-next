// src/components/dev/NFCConversionTest.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Copy, CheckCircle } from 'lucide-react'

export default function NFCConversionTest() {
  const [inputNFC, setInputNFC] = useState('042546AAE25680')
  const [inputBytes32, setInputBytes32] = useState('3034323534364141453235363830000000000000000000000000000000000000')
  const [copied, setCopied] = useState('')

  // Convert NFC hex string to bytes32 format (for contract calls)
  const nfcToBytes32 = (nfcHex: string): string => {
    const cleanHex = nfcHex.replace(/^0x/, '').toUpperCase()
    
    let asciiHex = ''
    for (let i = 0; i < cleanHex.length; i++) {
      asciiHex += cleanHex.charCodeAt(i).toString(16).padStart(2, '0')
    }
    
    const paddedHex = asciiHex.padEnd(64, '0')
    return paddedHex
  }

  // Convert bytes32 to readable NFC hex string
  const bytes32ToNFC = (bytes32: string): string => {
    if (!bytes32) return ''
    
    const hex = bytes32.replace(/^0x/, '')
    
    let result = ''
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substr(i, 2)
      if (hexPair === '00') break
      const charCode = parseInt(hexPair, 16)
      if (charCode > 0) {
        result += String.fromCharCode(charCode)
      }
    }
    
    return result
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const convertedBytes32 = nfcToBytes32(inputNFC)
  const convertedNFC = bytes32ToNFC(inputBytes32)

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 max-w-4xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6">NFC ID Conversion Test</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NFC to Bytes32 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">NFC Hex → Bytes32 (for contract calls)</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              NFC ID (readable format):
            </label>
            <input
              type="text"
              value={inputNFC}
              onChange={(e) => setInputNFC(e.target.value.toUpperCase())}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
              placeholder="042546AAE25680"
            />
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Converted to Bytes32:
            </label>
            <div className="relative">
              <div className="w-full bg-green-50 border border-green-200 rounded-lg px-3 py-2 font-mono text-sm break-all">
                {convertedBytes32}
              </div>
              <button
                onClick={() => copyToClipboard(convertedBytes32, 'bytes32')}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
              >
                {copied === 'bytes32' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <strong>Process:</strong>
            <br />1. Convert each character to ASCII hex
            <br />2. Pad to 64 characters (32 bytes)
            <br />
            <strong>Example:</strong> "0" → 30, "4" → 34, "2" → 32, etc.
          </div>
        </div>

        {/* Bytes32 to NFC */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Bytes32 → NFC Hex (from contract response)</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Bytes32 from contract:
            </label>
            <textarea
              value={inputBytes32}
              onChange={(e) => setInputBytes32(e.target.value.replace(/^0x/, ''))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm h-20 focus:border-blue-500 focus:outline-none"
              placeholder="3034323534364141453235363830000000000000000000000000000000000000"
            />
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Converted to readable NFC:
            </label>
            <div className="relative">
              <div className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 font-mono text-lg font-bold">
                {convertedNFC || 'Invalid input'}
              </div>
              <button
                onClick={() => copyToClipboard(convertedNFC, 'nfc')}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
              >
                {copied === 'nfc' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <strong>Process:</strong>
            <br />1. Take pairs of hex chars
            <br />2. Convert to ASCII characters
            <br />3. Stop at null bytes (00)
            <br />
            <strong>Example:</strong> 30 → "0", 34 → "4", 32 → "2", etc.
          </div>
        </div>
      </div>

      {/* Test Cases */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-semibold text-gray-800 mb-3">Test Cases:</h5>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Token 0:</strong>
              <br />NFC: 042546AAE25680
              <br />Bytes32: 3034323534364141...
            </div>
            <div>
              <strong>Common NFC format:</strong>
              <br />12-14 hex characters
              <br />Case insensitive
            </div>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-800 mb-2">✅ Verification Check:</h5>
        <p className="text-sm text-blue-700">
          Convert: {inputNFC} → bytes32 → back to NFC = {bytes32ToNFC(convertedBytes32)}
          {bytes32ToNFC(convertedBytes32) === inputNFC ? (
            <span className="text-green-600 font-bold"> ✓ MATCH</span>
          ) : (
            <span className="text-red-600 font-bold"> ✗ MISMATCH</span>
          )}
        </p>
      </div>
    </div>
  )
}