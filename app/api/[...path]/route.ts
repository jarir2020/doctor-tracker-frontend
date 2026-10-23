/** Doctor Tracker: Proxies same-origin API requests and preserves the backend session cookie. */
type ApiRouteContext = {
  params: Promise<{ path: string[] }>;
};

// Use localhost for local demos while requiring a configured backend for hosted deployments.
const backendOrigin = (
  process.env.BACKEND_API_ORIGIN ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000")
).replace(/\/+$/, "");

/** Forward one browser request to Express without changing its same-origin cookie flow. */
async function proxyApiRequest(request: Request, context: ApiRouteContext) {
  if (!backendOrigin) {
    return Response.json(
      { success: false, message: "The Doctor Tracker API is not configured." },
      { status: 503 },
    );
  }

  try {
    const { path } = await context.params;
    const apiPath = path.map((segment) => encodeURIComponent(segment)).join("/");
    const targetUrl = `${backendOrigin}/api/${apiPath}${new URL(request.url).search}`;
    const requestHeaders = new Headers();

    // Forward the session and origin headers required by Express authentication and CSRF checks.
    for (const name of ["accept", "content-type", "cookie", "origin"]) {
      const value = request.headers.get(name);
      if (value) requestHeaders.set(name, value);
    }

    // Preserve JSON and multipart request bodies while leaving bodyless methods empty.
    const hasBody = !["GET", "HEAD", "OPTIONS"].includes(request.method);
    const body = hasBody ? await request.arrayBuffer() : undefined;
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body,
      cache: "no-store",
      redirect: "manual",
    });
    const responseHeaders = new Headers();

    // Return response metadata needed by the frontend without forwarding stale body lengths.
    for (const name of ["cache-control", "content-type", "etag", "location", "retry-after"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    // Append each cookie separately so the browser stores and replays the server session.
    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append("set-cookie", cookie);
    }

    // HTTP 204 and 304 responses must not include a response body.
    const responseBody = [204, 304].includes(upstream.status) ? null : upstream.body;
    return new Response(responseBody, { status: upstream.status, headers: responseHeaders });
  } catch {
    // Keep upstream infrastructure details out of the public API response.
    return Response.json(
      { success: false, message: "Could not reach the Doctor Tracker API. Check the backend URL and try again." },
      { status: 502 },
    );
  }
}

/** Proxy read requests through the frontend origin. */
export const GET = proxyApiRequest;

/** Proxy metadata requests through the frontend origin. */
export const HEAD = proxyApiRequest;

/** Proxy create requests through the frontend origin. */
export const POST = proxyApiRequest;

/** Proxy partial updates through the frontend origin. */
export const PATCH = proxyApiRequest;

/** Proxy deletes through the frontend origin. */
export const DELETE = proxyApiRequest;

/** Proxy browser preflight requests through the frontend origin. */
export const OPTIONS = proxyApiRequest;
