import { authFetch } from './apiClient';

export interface ApiContact {
  id: number;
  name: string;
  mobile: string | null;
  mobile_last4: string | null;
  upi_id: string | null;
  avatar: string;
}

export async function listContacts(): Promise<{ contacts: ApiContact[] }> {
  return authFetch('/api/contacts');
}

export async function searchContacts(query: string): Promise<{ matches: ApiContact[] }> {
  return authFetch(`/api/contacts/search?q=${encodeURIComponent(query)}`);
}

export async function createContact(data: {
  name: string;
  mobile?: string;
  upi_id?: string;
  avatar?: string;
}): Promise<{ contact: ApiContact }> {
  return authFetch('/api/contacts', { method: 'POST', body: data });
}
