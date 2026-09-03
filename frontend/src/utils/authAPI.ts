export interface AuthUser {
  name: string;
  mobile: string;
  email: string;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

class AuthAPIError extends Error {}

async function parseError(res: Response, fallback: string): Promise<never> {
  try {
    const body = await res.json();
    const detail = body?.detail;
    if (typeof detail === 'string') throw new AuthAPIError(detail);
    if (Array.isArray(detail) && detail[0]?.msg) throw new AuthAPIError(detail[0].msg);
  } catch (e) {
    if (e instanceof AuthAPIError) throw e;
  }
  throw new AuthAPIError(fallback);
}

export async function loginUser(mobile: string, password: string): Promise<LoginResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, password }),
  });
  if (!res.ok) await parseError(res, 'Invalid mobile number or password. Please try again.');
  return res.json();
}

export async function signupUser(data: {
  name: string;
  email: string;
  mobile: string;
  password: string;
}): Promise<{ message: string }> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) await parseError(res, 'Signup failed. Please try again.');
  return res.json();
}
