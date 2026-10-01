const apiOrigin = (
  import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000`
).replace(/\/$/, '');

/** An error response from the API: `{ code, params }`, never user-facing text. */
export class ApiError extends Error {
  readonly code: string;
  readonly params: Record<string, unknown>;
  readonly status: number;

  constructor(
    code: string,
    status: number,
    params: Record<string, unknown> = {},
  ) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.params = params;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

function isErrorBody(
  value: unknown,
): value is { code: string; params?: Record<string, unknown> } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { code?: unknown }).code === 'string'
  );
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiOrigin}/api${path}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? {} : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('network_error', 0);
  }

  if (!response.ok) {
    const parsed: unknown = await response.json().catch(() => null);
    if (isErrorBody(parsed)) {
      throw new ApiError(parsed.code, response.status, parsed.params ?? {});
    }
    throw new ApiError('unknown', response.status);
  }

  return (await response.json()) as T;
}
