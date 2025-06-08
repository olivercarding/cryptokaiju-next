// src/lib/thirdweb.ts
import { createThirdwebClient } from "thirdweb";

// Get your client ID from thirdweb dashboard
const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set");
}

export const thirdwebClient = createThirdwebClient({
  clientId: CLIENT_ID,
});

// Contract configuration for your MerkleMinter
export const MERKLE_MINTER_ADDRESS = process.env.NEXT_PUBLIC_MERKLE_MINTER_ADDRESS || "";
export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) : 1; // Default to Ethereum mainnet

// You'll need to add your MerkleMinter ABI here
export const MERKLE_MINTER_ABI = [
  // Add your MerkleMinter ABI from the previous paste here
  // For now, I'll include the key minting functions
  {
    "inputs": [
      {"internalType": "address", "name": "_recipient", "type": "address"},
      {
        "components": [
          {"internalType": "bytes32", "name": "nfcId", "type": "bytes32"},
          {"internalType": "uint256", "name": "birthday", "type": "uint256"},
          {"internalType": "string", "name": "tokenUri", "type": "string"}
        ],
        "internalType": "struct MerkleMinter.KaijuDNA",
        "name": "_dna",
        "type": "tuple"
      },
      {"internalType": "bytes32[]", "name": "_merkleProof", "type": "bytes32[]"}
    ],
    "name": "openMint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pricePerNFTInETH",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;