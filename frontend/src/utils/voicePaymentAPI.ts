import { authFetch, newIdempotencyKey } from './apiClient';

export interface VoiceIntent {
  intent: 'SEND_PAYMENT' | 'UNKNOWN';
  amount: number | null;
  currency: string;
  recipient_name: string | null;
  confidence: number;
}

export interface PayResult {
  status: string;
  reference_id: string;
  amount: number;
  recipient: { id: number; name: string; avatar: string };
  new_balance: number;
  created_at: string;
}

export async function parseVoiceIntent(transcript: string): Promise<VoiceIntent> {
  return authFetch('/api/voice/parse-intent', { method: 'POST', body: { transcript } });
}

export async function payViaVoice(params: {
  contact_id: number;
  amount: number;
  pin: string;
  face_token: string | null;
}): Promise<PayResult> {
  return authFetch('/api/wallet/pay', {
    method: 'POST',
    body: { ...params, channel: 'voice', idempotency_key: newIdempotencyKey() },
    fallbackError: 'Payment failed. Please try again.',
  });
}
