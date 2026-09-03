// Wallet manager for Finora — backed by the backend SQLite wallet (source of
// truth). Keeps a localStorage mirror so the many existing synchronous
// `getWallet()` callers across the app keep working without every call site
// becoming async; writes go to the server first, then update the mirror from
// the server's response so the balance shown is never invented client-side.
import { adjustWallet, fetchWalletSummary, fetchWalletTransactions, ServerTransaction } from './walletAPI';

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'success' | 'pending' | 'failed';
  location?: { lat: number; lng: number; address: string };
  mood?: 'happy' | 'neutral' | 'stressed' | 'excited';
  paymentMethod: 'wallet' | 'qr' | 'upi' | 'card' | 'voice';
  merchantLogo?: string;
}

export interface WalletData {
  balance: number;
  transactions: Transaction[];
  lastUpdated: string;
}

const WALLET_KEY = 'finora_wallet';

// Demo geo-tagged transactions used only by the Geo Spending Map feature
// (the backend Transaction table has no lat/lng concept) — merged into the
// displayed list on the client, never sent to or read from the server.
export const defaultGeoTransactions: Transaction[] = [
  {
    id: 'txn_101',
    date: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    merchant: 'Phoenix Marketcity Mall',
    category: 'Shopping',
    amount: 7450,
    type: 'debit',
    status: 'success',
    paymentMethod: 'card',
    location: { lat: 19.0864, lng: 72.8890, address: 'Phoenix Mall, Kurla, Mumbai' }
  },
  {
    id: 'txn_102',
    date: new Date(Date.now() - 1000 * 3600 * 12).toISOString(),
    merchant: 'ABC Gourmet Restaurant',
    category: 'Food & Drinks',
    amount: 4820,
    type: 'debit',
    status: 'success',
    paymentMethod: 'upi',
    location: { lat: 19.0596, lng: 72.8295, address: 'Bandra Reclamation, Mumbai' }
  },
  {
    id: 'txn_103',
    date: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
    merchant: 'Nature Basket Supermarket',
    category: 'Food & Drinks',
    amount: 3640,
    type: 'debit',
    status: 'success',
    paymentMethod: 'wallet',
    location: { lat: 19.1136, lng: 72.8697, address: 'Andheri East, Mumbai' }
  },
  {
    id: 'txn_104',
    date: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
    merchant: 'Blue Tokai Coffee',
    category: 'Food & Drinks',
    amount: 520,
    type: 'debit',
    status: 'success',
    paymentMethod: 'qr',
    location: { lat: 19.0601, lng: 72.8362, address: 'Bandra West, Mumbai' }
  },
  {
    id: 'txn_105',
    date: new Date(Date.now() - 1000 * 3600 * 72).toISOString(),
    merchant: 'Shell Fuel Station',
    category: 'Travel',
    amount: 2200,
    type: 'debit',
    status: 'success',
    paymentMethod: 'card',
    location: { lat: 19.1197, lng: 72.8464, address: 'SV Road, Andheri, Mumbai' }
  },
  {
    id: 'txn_106',
    date: new Date(Date.now() - 1000 * 3600 * 96).toISOString(),
    merchant: 'High Street Phoenix Luxury',
    category: 'Shopping',
    amount: 14500,
    type: 'debit',
    status: 'success',
    paymentMethod: 'card',
    location: { lat: 19.0864, lng: 72.8890, address: 'Phoenix Mall, Kurla, Mumbai' }
  },
  {
    id: 'txn_107',
    date: new Date(Date.now() - 1000 * 3600 * 120).toISOString(),
    merchant: 'Online SaaS Subscription',
    category: 'Bills & Utilities',
    amount: 1499,
    type: 'debit',
    status: 'success',
    paymentMethod: 'card'
  },
  {
    id: 'txn_108',
    date: new Date(Date.now() - 1000 * 3600 * 150).toISOString(),
    merchant: 'Amazon Online Order',
    category: 'Shopping',
    amount: 2999,
    type: 'debit',
    status: 'success',
    paymentMethod: 'upi'
  },
  {
    id: 'txn_109',
    date: new Date(Date.now() - 1000 * 3600 * 180).toISOString(),
    merchant: 'T. Nagar Silk Saree House',
    category: 'Shopping',
    amount: 5800,
    type: 'debit',
    status: 'success',
    paymentMethod: 'upi',
    location: { lat: 13.0418, lng: 80.2341, address: 'T. Nagar, Chennai' }
  },
  {
    id: 'txn_110',
    date: new Date(Date.now() - 1000 * 3600 * 210).toISOString(),
    merchant: 'Saravana Bhavan',
    category: 'Food & Drinks',
    amount: 850,
    type: 'debit',
    status: 'success',
    paymentMethod: 'qr',
    location: { lat: 13.0418, lng: 80.2341, address: 'T. Nagar, Chennai' }
  },
  {
    id: 'txn_111',
    date: new Date(Date.now() - 1000 * 3600 * 240).toISOString(),
    merchant: 'Connaught Cafe & Bar',
    category: 'Entertainment',
    amount: 4200,
    type: 'debit',
    status: 'success',
    paymentMethod: 'card',
    location: { lat: 28.6315, lng: 77.2167, address: 'Connaught Place, New Delhi' }
  },
  {
    id: 'txn_112',
    date: new Date(Date.now() - 1000 * 3600 * 280).toISOString(),
    merchant: 'Indiranagar Craft Brewery',
    category: 'Food & Drinks',
    amount: 3800,
    type: 'debit',
    status: 'success',
    paymentMethod: 'upi',
    location: { lat: 12.9719, lng: 77.6412, address: 'Indiranagar 100ft Road, Bengaluru' }
  },
  {
    id: 'txn_113',
    date: new Date(Date.now() - 1000 * 3600 * 300).toISOString(),
    merchant: 'UB City Luxury Hub',
    category: 'Shopping',
    amount: 18900,
    type: 'debit',
    status: 'success',
    paymentMethod: 'card',
    location: { lat: 12.9716, lng: 77.5946, address: 'Vittal Mallya Road, Bengaluru' }
  },
  {
    id: 'txn_114',
    date: new Date(Date.now() - 1000 * 3600 * 340).toISOString(),
    merchant: 'Cyber Hub Food Street',
    category: 'Food & Drinks',
    amount: 2950,
    type: 'debit',
    status: 'success',
    paymentMethod: 'qr',
    location: { lat: 28.4950, lng: 77.0895, address: 'Cyber City, Gurugram' }
  },
  {
    id: 'txn_115',
    date: new Date(Date.now() - 1000 * 3600 * 380).toISOString(),
    merchant: 'Koregaon Park Bistro',
    category: 'Food & Drinks',
    amount: 2150,
    type: 'debit',
    status: 'success',
    paymentMethod: 'upi',
    location: { lat: 18.5362, lng: 73.8940, address: 'Koregaon Park, Pune' }
  },
  {
    id: 'txn_116',
    date: new Date(Date.now() - 1000 * 3600 * 420).toISOString(),
    merchant: 'Jubilee Hills Lounge',
    category: 'Entertainment',
    amount: 6400,
    type: 'debit',
    status: 'success',
    paymentMethod: 'card',
    location: { lat: 17.4319, lng: 78.4073, address: 'Jubilee Hills, Hyderabad' }
  }
];

function toClientTransaction(t: ServerTransaction): Transaction {
  return {
    id: t.id,
    date: t.date,
    merchant: t.merchant,
    category: t.category,
    amount: t.amount,
    type: t.type,
    status: t.status as Transaction['status'],
    paymentMethod: (t.paymentMethod as Transaction['paymentMethod']) || 'wallet',
  };
}

function readCache(): WalletData | null {
  const stored = localStorage.getItem(WALLET_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as WalletData;
  } catch {
    return null;
  }
}

function writeCache(data: WalletData): void {
  localStorage.setItem(WALLET_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('walletUpdate'));
}

// Synchronous read from the local cache (mirrors the last known server
// state). Call syncWalletFromServer() to refresh it from the backend.
export const getWallet = (): WalletData => {
  const cached = readCache();
  if (cached) return cached;
  const empty: WalletData = { balance: 0, transactions: [], lastUpdated: new Date().toISOString() };
  writeCache(empty);
  return empty;
};

// Fetches the authoritative balance/transactions from the backend and
// refreshes the local cache. Call on login/app mount and whenever a payment
// may have happened outside this component (e.g. voice payments).
export const syncWalletFromServer = async (): Promise<WalletData> => {
  const [summary, txns] = await Promise.all([fetchWalletSummary(), fetchWalletTransactions(50)]);
  const data: WalletData = {
    balance: summary.balance,
    transactions: txns.transactions.map(toClientTransaction),
    lastUpdated: new Date().toISOString(),
  };
  writeCache(data);
  return data;
};

// Top up wallet (adds funds via the backend, authoritative).
export const topUpWallet = async (amount: number): Promise<void> => {
  const result = await adjustWallet({
    merchant: 'Wallet Top-Up',
    category: 'Wallet',
    amount,
    type: 'credit',
    payment_method: 'upi',
  });
  const cached = getWallet();
  writeCache({
    balance: result.new_balance,
    transactions: [toClientTransaction(result.transaction), ...cached.transactions],
    lastUpdated: new Date().toISOString(),
  });
};

// Make a payment (debits via the backend, authoritative — returns null on
// insufficient balance, matching the previous localStorage-based contract).
export const makePayment = async (
  merchant: string,
  amount: number,
  category?: string,
  location?: { lat: number; lng: number; address: string },
  mood?: 'happy' | 'neutral' | 'stressed' | 'excited',
  paymentMethod: 'wallet' | 'qr' | 'upi' | 'card' | 'voice' = 'wallet'
): Promise<Transaction | null> => {
  try {
    const result = await adjustWallet({
      merchant,
      category,
      amount,
      type: 'debit',
      payment_method: paymentMethod,
    });
    const txn: Transaction = { ...toClientTransaction(result.transaction), location, mood };
    const cached = getWallet();
    writeCache({
      balance: result.new_balance,
      transactions: [txn, ...cached.transactions],
      lastUpdated: new Date().toISOString(),
    });
    return txn;
  } catch {
    return null; // Insufficient balance or request failed
  }
};

// Get spending by category (derived client-side from the cached transaction list)
export const getSpendingByCategory = (days: number = 30): { [key: string]: number } => {
  const wallet = getWallet();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const categorySpending: { [key: string]: number } = {};

  wallet.transactions
    .filter(t => t.type === 'debit' && new Date(t.date) >= cutoffDate)
    .forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

  return categorySpending;
};

// Get daily spending trend
export const getDailySpending = (days: number = 30): { date: string; amount: number }[] => {
  const wallet = getWallet();
  const result: { [key: string]: number } = {};

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = 0;
  }

  wallet.transactions
    .filter(t => t.type === 'debit')
    .forEach(t => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      if (result[dateStr] !== undefined) {
        result[dateStr] += t.amount;
      }
    });

  return Object.entries(result)
    .map(([date, amount]) => ({ date, amount }))
    .reverse();
};

// Get location-based spending (from the client-only geo-tagged demo transactions)
export const getLocationSpending = (): { location: string; amount: number; count: number }[] => {
  const wallet = getWallet();
  const locationMap: { [key: string]: { amount: number; count: number } } = {};

  wallet.transactions
    .filter(t => t.type === 'debit' && t.location)
    .forEach(t => {
      const loc = t.location!.address;
      if (!locationMap[loc]) {
        locationMap[loc] = { amount: 0, count: 0 };
      }
      locationMap[loc].amount += t.amount;
      locationMap[loc].count += 1;
    });

  return Object.entries(locationMap)
    .map(([location, data]) => ({ location, ...data }))
    .sort((a, b) => b.amount - a.amount);
};

// Reset the local cache and re-sync from the server (for demo use)
export const resetWallet = async (): Promise<void> => {
  localStorage.removeItem(WALLET_KEY);
  await syncWalletFromServer();
};
