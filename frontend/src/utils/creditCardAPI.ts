import { authFetch, newIdempotencyKey } from './apiClient';

export interface CreditSummary {
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  utilization_pct: number;
  card_number_masked: string;
}

export interface CreditCheckResult {
  allowed: boolean;
  blocked_reason: string | null;
  warning: boolean;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  utilization_after_pct: number;
  threshold_pct: number;
}

export async function getCreditSummary(): Promise<CreditSummary> {
  return authFetch('/api/creditcard/summary');
}

export async function checkCharge(amount: number): Promise<CreditCheckResult> {
  return authFetch('/api/creditcard/check', { method: 'POST', body: { amount } });
}

export async function chargeCard(
  amount: number,
  merchant: string
): Promise<{ status: string; warning: boolean } & CreditSummary> {
  return authFetch('/api/creditcard/charge', {
    method: 'POST',
    body: { amount, merchant, idempotency_key: newIdempotencyKey() },
  });
}
