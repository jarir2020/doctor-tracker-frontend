const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
      ...options,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Could not reach the Doctor Tracker API. Check the API URL and try again.", 0);
  }

  const payload = await response.json().catch(() => null) as {
    success?: boolean;
    data?: T;
    message?: string;
  } | null;

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.message || "The request could not be completed.", response.status);
  }

  return payload.data as T;
}

export function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}
