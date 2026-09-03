export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function extractMessage(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object') {
    const d = detail as Record<string, unknown>;
    if (typeof d.blocked_reason === 'string' && d.blocked_reason === 'exceeds_limit') {
      return 'Credit card limit reached. This transaction cannot be completed because it exceeds your available credit limit.';
    }
    if (typeof d.detail === 'string') return d.detail;
  }
  if (Array.isArray(detail) && (detail[0] as { msg?: string })?.msg) {
    return (detail[0] as { msg: string }).msg;
  }
  return fallback;
}

async function parseErrorAndThrow(res: Response, fallback: string): Promise<never> {
  let detail: unknown;
  try {
    const body = await res.json();
    detail = body?.detail ?? body;
  } catch {
    // no JSON body
  }
  throw new ApiError(extractMessage(detail, fallback), res.status, detail);
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function authFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; fallbackError?: string } = {}
): Promise<T> {
  const { method = 'GET', body, fallbackError = 'Something went wrong. Please try again.' } = options;

  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) await parseErrorAndThrow(res, fallbackError);
  return res.json();
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
