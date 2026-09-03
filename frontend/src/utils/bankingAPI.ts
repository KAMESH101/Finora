// Banking API Service - Sigma Open Banking Integration
// This is a mock implementation. Replace with actual Sigma API endpoints in production.

export interface BankAccount {
  id: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType: 'savings' | 'current';
  balance: number;
  linkedDate: string;
  status: 'active' | 'inactive';
  lastSynced: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit';
  amount: number;
  balance: number;
  description: string;
  category: string;
  date: string;
  upiId?: string;
  merchantName?: string;
  referenceNumber: string;
  mode: 'UPI' | 'NEFT' | 'IMPS' | 'Card' | 'ATM' | 'Cash';
}

export interface ConsentRequest {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedData: string[];
  expiresAt: string;
  createdAt: string;
}

// Mock configuration - Replace with actual API credentials
const SIGMA_CONFIG = {
  apiUrl: 'https://api.sigma.co.in/v1', // Replace with actual endpoint
  clientId: 'YOUR_SIGMA_CLIENT_ID',
  clientSecret: 'YOUR_SIGMA_CLIENT_SECRET',
  redirectUri: 'https://yourapp.com/callback',
  environment: 'sandbox' // 'sandbox' or 'production'
};

// Import centralized mock data for consistency
import { mockData } from '../mockData';

// Use centralized bank accounts from mockData
const mockBankAccounts: BankAccount[] = mockData.bankAccounts as BankAccount[];

const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    accountId: 'acc_1',
    type: 'debit',
    amount: 1250,
    balance: 125000,
    description: 'Swiggy Food Order',
    category: 'Food & Dining',
    date: '27-10-2025 20:15',
    upiId: 'swiggy@paytm',
    merchantName: 'Swiggy',
    referenceNumber: 'UPI327845612',
    mode: 'UPI'
  },
  {
    id: 'txn_2',
    accountId: 'acc_1',
    type: 'credit',
    amount: 50000,
    balance: 126250,
    description: 'Salary Credit',
    category: 'Income',
    date: '25-10-2025 10:00',
    merchantName: 'ABC Technologies Pvt Ltd',
    referenceNumber: 'NEFT987654321',
    mode: 'NEFT'
  },
  {
    id: 'txn_3',
    accountId: 'acc_1',
    type: 'debit',
    amount: 499,
    balance: 76250,
    description: 'Netflix Subscription',
    category: 'Entertainment',
    date: '26-10-2025 08:30',
    merchantName: 'Netflix',
    referenceNumber: 'CARD123456',
    mode: 'Card'
  },
  {
    id: 'txn_4',
    accountId: 'acc_1',
    type: 'debit',
    amount: 3500,
    balance: 75751,
    description: 'Uber Ride',
    category: 'Transportation',
    date: '24-10-2025 18:45',
    upiId: 'uber.india@axisbank',
    merchantName: 'Uber India',
    referenceNumber: 'UPI456789123',
    mode: 'UPI'
  },
  {
    id: 'txn_5',
    accountId: 'acc_1',
    type: 'debit',
    amount: 2800,
    balance: 72251,
    description: 'PharmEasy Medicine',
    category: 'Healthcare',
    date: '23-10-2025 14:20',
    upiId: 'pharmeasy@icici',
    merchantName: 'PharmEasy',
    referenceNumber: 'UPI789456321',
    mode: 'UPI'
  },
  {
    id: 'txn_6',
    accountId: 'acc_2',
    type: 'debit',
    amount: 15000,
    balance: 45000,
    description: 'Rent Payment',
    category: 'Housing',
    date: '01-10-2025 10:00',
    merchantName: 'Property Owner',
    referenceNumber: 'IMPS147258369',
    mode: 'IMPS'
  },
  {
    id: 'txn_7',
    accountId: 'acc_1',
    type: 'debit',
    amount: 850,
    balance: 71401,
    description: 'BookMyShow Movie Tickets',
    category: 'Entertainment',
    date: '22-10-2025 19:00',
    upiId: 'bookmyshow@paytm',
    merchantName: 'BookMyShow',
    referenceNumber: 'UPI852963741',
    mode: 'UPI'
  },
  {
    id: 'txn_8',
    accountId: 'acc_1',
    type: 'debit',
    amount: 5600,
    balance: 65801,
    description: 'BigBasket Groceries',
    category: 'Shopping',
    date: '21-10-2025 11:30',
    upiId: 'bigbasket@icici',
    merchantName: 'BigBasket',
    referenceNumber: 'UPI963852741',
    mode: 'UPI'
  }
];

// API Functions - Replace with actual API calls in production

/**
 * Initialize OAuth2 flow for bank account linking
 * In production, this would redirect to Sigma's OAuth consent page
 */
export async function initiateBankAccountLink(): Promise<string> {
  // Mock implementation
  // In production: Implement OAuth2 authorization code flow
  const authUrl = `${SIGMA_CONFIG.apiUrl}/oauth/authorize?client_id=${SIGMA_CONFIG.clientId}&redirect_uri=${SIGMA_CONFIG.redirectUri}&response_type=code&scope=accounts transactions`;
  
  console.log('Initiating bank account link:', authUrl);
  
  // For demo, return mock auth code
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('mock_auth_code_12345');
    }, 1000);
  });
}

/**
 * Exchange authorization code for access token
 * Required for RBI-AA compliance
 */
export async function exchangeAuthCode(authCode: string): Promise<string> {
  // Mock implementation
  // In production: POST to /oauth/token with auth code
  console.log('Exchanging auth code:', authCode);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('mock_access_token_' + Date.now());
    }, 500);
  });
}

/**
 * Fetch linked bank accounts
 * Endpoint: GET /accounts
 * Headers: Authorization: Bearer {access_token}
 */
export async function fetchBankAccounts(userId: string): Promise<BankAccount[]> {
  // Mock implementation
  // In production: 
  // const response = await fetch(`${SIGMA_CONFIG.apiUrl}/accounts`, {
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json'
  //   }
  // });
  // return await response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBankAccounts);
    }, 800);
  });
}

/**
 * Fetch transaction history with filters
 * Endpoint: GET /accounts/{accountId}/transactions
 * Supports: date range, category filters, pagination
 */
export async function fetchTransactions(
  accountId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: 'debit' | 'credit';
    limit?: number;
  }
): Promise<Transaction[]> {
  // Mock implementation
  // In production:
  // const queryParams = new URLSearchParams(filters);
  // const response = await fetch(
  //   `${SIGMA_CONFIG.apiUrl}/accounts/${accountId}/transactions?${queryParams}`,
  //   { headers: { 'Authorization': `Bearer ${accessToken}` } }
  // );
  // return await response.json();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredTransactions = mockTransactions;
      
      if (filters?.category) {
        filteredTransactions = filteredTransactions.filter(
          t => t.category === filters.category
        );
      }
      
      if (filters?.type) {
        filteredTransactions = filteredTransactions.filter(
          t => t.type === filters.type
        );
      }
      
      if (filters?.limit) {
        filteredTransactions = filteredTransactions.slice(0, filters.limit);
      }
      
      resolve(filteredTransactions);
    }, 600);
  });
}

/**
 * Request user consent for data access
 * Required for RBI-AA and PSD2 compliance
 */
export async function requestConsent(
  userId: string,
  dataTypes: string[]
): Promise<ConsentRequest> {
  // Mock implementation
  // In production: POST to /consent/request
  
  const consent: ConsentRequest = {
    id: 'consent_' + Date.now(),
    userId,
    status: 'approved', // In real app, user would approve via bank's interface
    requestedData: dataTypes,
    expiresAt: '28-10-2026',
    createdAt: '28-10-2025'
  };
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(consent);
    }, 1000);
  });
}

/**
 * Setup webhook for real-time transaction notifications
 * Endpoint: POST /webhooks/register
 */
export async function registerWebhook(
  webhookUrl: string,
  events: string[]
): Promise<{ webhookId: string; secret: string }> {
  // Mock implementation
  // In production: Register webhook endpoint for events like:
  // - transaction.created
  // - account.updated
  // - consent.revoked
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        webhookId: 'webhook_' + Date.now(),
        secret: 'whsec_' + Math.random().toString(36).substring(7)
      });
    }, 500);
  });
}

/**
 * Verify webhook signature for security
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Mock implementation
  // In production: Use HMAC-SHA256 to verify webhook authenticity
  // const hmac = crypto.createHmac('sha256', secret);
  // const digest = hmac.update(payload).digest('hex');
  // return digest === signature;
  
  return true;
}

/**
 * Revoke bank account access
 */
export async function unlinkBankAccount(accountId: string): Promise<void> {
  // Mock implementation
  // In production: DELETE /accounts/{accountId}/link
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Bank account unlinked:', accountId);
      resolve();
    }, 500);
  });
}

/**
 * Get audit log for compliance
 */
export async function getAuditLog(userId: string): Promise<any[]> {
  // Mock implementation
  // In production: GET /audit/logs?userId={userId}
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'audit_1',
          action: 'ACCOUNT_LINKED',
          timestamp: '15-01-2025 14:30',
          details: 'HDFC Bank account linked'
        },
        {
          id: 'audit_2',
          action: 'DATA_ACCESSED',
          timestamp: '28-10-2025 09:30',
          details: 'Transaction data fetched'
        }
      ]);
    }, 400);
  });
}

export const categoryColors: Record<string, string> = {
  'Food & Dining': '#F59E0B',
  'Shopping': '#EC4899',
  'Transportation': '#3B82F6',
  'Entertainment': '#8B5CF6',
  'Healthcare': '#10B981',
  'Housing': '#6366F1',
  'Income': '#10B981',
  'Utilities': '#F97316',
  'Education': '#06B6D4',
  'Others': '#64748B'
};
