import { authFetch } from './apiClient';

export async function getFaceStatus(): Promise<{ enrolled: boolean }> {
  return authFetch('/api/face/status');
}

export async function enrollFace(consent: boolean): Promise<{ message: string }> {
  return authFetch('/api/face/enroll', { method: 'POST', body: { consent } });
}

export async function verifyFace(): Promise<{ matched: boolean; reason: string | null; token: string | null }> {
  return authFetch('/api/face/verify', { method: 'POST' });
}

export async function removeFaceEnrollment(): Promise<{ message: string }> {
  return authFetch('/api/face/enrollment', { method: 'DELETE' });
}
