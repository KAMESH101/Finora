import { authFetch, newIdempotencyKey } from './apiClient';

export interface ServerTransaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  status: string;
  paymentMethod: string;
}

export async function fetchWalletSummary(): Promise<{ balance: number; currency: string }> {
  return authFetch('/api/wallet/summary');
}

export async function fetchWalletTransactions(limit = 50): Promise<{ transactions: ServerTransaction[] }> {
  return authFetch(`/api/wallet/transactions?limit=${limit}`);
}

export async function adjustWallet(params: {
  merchant: string;
  category?: string;
  amount: number;
  type: 'debit' | 'credit';
  payment_method?: string;
}): Promise<{ status: string; transaction: ServerTransaction; new_balance: number }> {
  return authFetch('/api/wallet/adjust', {
    method: 'POST',
    body: { ...params, idempotency_key: newIdempotencyKey() },
    fallbackError: 'Insufficient balance for this transaction.',
  });
}
