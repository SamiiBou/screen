// Configuration des contrats pour World Chain
export const CONTRACTS = {
  // HODL Token address
  HODL_TOKEN: '0xCb17Da6Ded2736D480aCF93cb525d12f6f046BD4',
  
  // HODL Distributor address  
  HODL_DISTRIBUTOR: '0xb525567dE6E171936aCB95698904634DA0a548C2',
} as const

// Configuration World Chain
export const CHAIN_CONFIG = {
  CHAIN_ID: 480,
  RPC_URL: 'https://worldchain-mainnet.g.alchemy.com/public',
  BLOCK_EXPLORER: 'https://worldchain-mainnet.explorer.alchemy.com',
} as const

// Configuration EIP712 pour le distributeur
export const EIP712_DOMAIN = {
  name: 'Distributor',
  version: '1',
  chainId: CHAIN_CONFIG.CHAIN_ID,
  verifyingContract: CONTRACTS.HODL_DISTRIBUTOR,
} as const

export const EIP712_TYPES = {
  Voucher: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
} as const 