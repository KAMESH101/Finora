import { authFetch } from './apiClient';

export async function getPinStatus(): Promise<{ configured: boolean }> {
  return authFetch('/api/pin/status');
}

export async function setupPin(pin: string, confirmPin: string): Promise<{ message: string }> {
  return authFetch('/api/pin/setup', { method: 'POST', body: { pin, confirm_pin: confirmPin } });
}
