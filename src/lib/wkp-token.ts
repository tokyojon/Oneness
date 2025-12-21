// WKP (Oneness Kingdom Points) Token Service
// This manages the crypto token functionality

export interface WKPWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  private_key: string; // Encrypted
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface WKPToken {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: number;
  contractAddress: string;
}

export interface TokenTransaction {
  id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  transaction_hash: string;
  type: 'transfer' | 'tip' | 'purchase' | 'donation' | 'reward';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  metadata?: any;
}

export interface LiveTokenData {
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  holders: number;
  lastUpdated: string;
}

// WKP Token Configuration
export const WKP_CONFIG: WKPToken = {
  symbol: 'WKP',
  name: 'Oneness Kingdom Points',
  decimals: 18,
  totalSupply: 1000000000, // 1 billion tokens
  contractAddress: process.env.NEXT_PUBLIC_WKP_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
};

// Mock blockchain service - in production, this would connect to real blockchain
class MockBlockchainService {
  private transactions: Map<string, TokenTransaction> = new Map();
  
  async generateWalletAddress(userId: string): Promise<string> {
    // Generate a mock wallet address
    return `0x${userId.slice(0, 8)}${Math.random().toString(16).slice(2, 18)}${userId.slice(-8)}`;
  }
  
  async generatePrivateKey(): Promise<string> {
    // Generate a mock private key
    return `0x${Math.random().toString(16).slice(2, 66)}`;
  }
  
  async sendTransaction(from: string, to: string, amount: number, type: TokenTransaction['type']): Promise<string> {
    // Mock transaction hash
    const hash = `0x${Math.random().toString(16).slice(2, 66)}`;
    return hash;
  }
  
  async getTransactionStatus(hash: string): Promise<'pending' | 'completed' | 'failed'> {
    // Mock random status for demo
    return Math.random() > 0.3 ? 'completed' : 'pending';
  }
}

export const blockchainService = new MockBlockchainService();

// Live price data service
export class LivePriceService {
  private subscribers: Set<(data: LiveTokenData) => void> = new Set();
  private currentPrice: number = 100; // Base price in JPY
  private interval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.startPriceSimulation();
  }
  
  private startPriceSimulation() {
    this.interval = setInterval(() => {
      // Simulate price fluctuations
      const change = (Math.random() - 0.5) * 2; // -1 to +1
      this.currentPrice = Math.max(50, this.currentPrice + change);
      
      const data: LiveTokenData = {
        price: this.currentPrice,
        marketCap: this.currentPrice * 1000000, // Mock market cap
        volume24h: Math.floor(Math.random() * 1000000),
        change24h: change,
        holders: Math.floor(Math.random() * 10000) + 1000,
        lastUpdated: new Date().toISOString()
      };
      
      this.notifySubscribers(data);
    }, 5000); // Update every 5 seconds
  }
  
  subscribe(callback: (data: LiveTokenData) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  private notifySubscribers(data: LiveTokenData) {
    this.subscribers.forEach(callback => callback(data));
  }
  
  getCurrentData(): LiveTokenData {
    return {
      price: this.currentPrice,
      marketCap: this.currentPrice * 1000000,
      volume24h: Math.floor(Math.random() * 1000000),
      change24h: 0,
      holders: Math.floor(Math.random() * 10000) + 1000,
      lastUpdated: new Date().toISOString()
    };
  }
  
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

export const priceService = new LivePriceService();

// Wallet management functions
export async function createWallet(userId: string): Promise<WKPWallet> {
  const walletAddress = await blockchainService.generateWalletAddress(userId);
  const privateKey = await blockchainService.generatePrivateKey();
  
  return {
    id: `wallet_${Date.now()}`,
    user_id: userId,
    wallet_address: walletAddress,
    private_key: privateKey, // In production, this should be encrypted
    balance: 100, // Welcome bonus
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function sendTip(fromWallet: WKPWallet, toWallet: WKPWallet, amount: number): Promise<TokenTransaction> {
  if (fromWallet.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  const transactionHash = await blockchainService.sendTransaction(
    fromWallet.wallet_address,
    toWallet.wallet_address,
    amount,
    'tip'
  );
  
  const transaction: TokenTransaction = {
    id: `txn_${Date.now()}`,
    from_wallet_id: fromWallet.id,
    to_wallet_id: toWallet.id,
    amount,
    transaction_hash: transactionHash,
    type: 'tip',
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  return transaction;
}

export async function purchaseWithWKP(wallet: WKPWallet, amount: number, itemId: string): Promise<TokenTransaction> {
  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  const marketplaceWallet = await getMarketplaceWallet();
  const transactionHash = await blockchainService.sendTransaction(
    wallet.wallet_address,
    marketplaceWallet.wallet_address,
    amount,
    'purchase'
  );
  
  const transaction: TokenTransaction = {
    id: `txn_${Date.now()}`,
    from_wallet_id: wallet.id,
    to_wallet_id: marketplaceWallet.id,
    amount,
    transaction_hash: transactionHash,
    type: 'purchase',
    status: 'pending',
    created_at: new Date().toISOString(),
    metadata: { itemId }
  };
  
  return transaction;
}

export async function donateWKP(fromWallet: WKPWallet, toUserId: string, amount: number): Promise<TokenTransaction> {
  if (fromWallet.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  const toWallet = await getUserWallet(toUserId);
  if (!toWallet) {
    throw new Error('Recipient wallet not found');
  }
  
  const transactionHash = await blockchainService.sendTransaction(
    fromWallet.wallet_address,
    toWallet.wallet_address,
    amount,
    'donation'
  );
  
  const transaction: TokenTransaction = {
    id: `txn_${Date.now()}`,
    from_wallet_id: fromWallet.id,
    to_wallet_id: toWallet.id,
    amount,
    transaction_hash: transactionHash,
    type: 'donation',
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  return transaction;
}

// Helper functions
async function getMarketplaceWallet(): Promise<WKPWallet> {
  return {
    id: 'marketplace_wallet',
    user_id: 'marketplace',
    wallet_address: '0xMARKETPLACEWALLETADDRESS',
    private_key: 'encrypted',
    balance: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function getUserWallet(userId: string): Promise<WKPWallet | null> {
  // In production, this would fetch from database
  return null;
}

// Format utilities
export function formatWKP(amount: number): string {
  return `${amount.toLocaleString()} WKP`;
}

export function formatPrice(amount: number, currency: string = 'JPY'): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function calculateJPYValue(wkpAmount: number, currentPrice: number): number {
  return Math.floor(wkpAmount * currentPrice);
}
