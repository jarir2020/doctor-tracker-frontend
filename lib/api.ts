/** Doctor Tracker: Centralizes credentialed API requests, response errors, and query-string encoding. */
// Keep browser API calls on the frontend origin so the administrator session stays first-party.
const API_BASE = "/api";

export class ApiError extends Error {
  status: number;

  /** Preserve the HTTP status with a user-facing request error. */
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Make a cookie-authenticated request and unwrap the API's success envelope. */
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  // JSON forms get a content type automatically; multipart callers keep their boundary.
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    // Cookies carry the server-side administrator session across the API proxy.
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

/** Serialize defined, nonempty filter values for a URL query. */
export function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}
