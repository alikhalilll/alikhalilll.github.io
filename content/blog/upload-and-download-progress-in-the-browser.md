---
title: Custom fetch wrapper, and XHR for upload progress
description: Why native fetch is the right default, how to build a layered wrapper (base URL, timeouts, interceptors, retry), and when you still need XHR.
date: 2025-09-22
updatedAt: 2025-09-22
keywords:
  - fetch API
  - XMLHttpRequest
  - XHR
  - upload progress
  - download progress
  - AbortController
  - AbortSignal
  - custom HTTP client
  - interceptors
  - retry
  - exponential backoff
  - TypeScript
---

Anytime I need to talk to an HTTP API from the browser, I reach for `fetch` first. It's the right primitive: Promise-first, composable with `AbortController`, shares `Request`/`Response` with Service Workers and the Cache API, and the same signature runs in Node 18+, Bun, Deno, and Cloudflare Workers without an adapter. Most "which HTTP client should I use?" conversations end there.

But `fetch` has one gap that nobody warns you about, and it's not the kind of gap someone's going to fix. It's structural: `fetch` doesn't emit upload progress events. The `Request` body can be a `ReadableStream`, but browsers don't fire `progress` as they drain bytes out of it onto the wire. You hand the body to the network stack and it goes.

For a real upload progress bar — not a fake indeterminate spinner — you need `XMLHttpRequest`. It's the older API, but it's the only one that exposes `xhr.upload.onprogress`.

This post covers three things, in order:

1. Why native `fetch` earns its default status, and the specific benefits you're getting from it.
2. How to build a custom fetch wrapper — defaults, timeouts, interceptors, retry — without losing `fetch`'s shape.
3. The XHR gap, the progress event map, and a small XHR-backed wrapper that returns a `Response` so the rest of your code stays fetch-shaped.

If you've ever wondered why so many production codebases have a `createClient()` factory, the answer mostly lives in parts 1 and 2. Part 3 is the single thing that client still can't do on its own.

## Why native `fetch` is the default primitive

Every HTTP-client debate I've been in eventually converges on "use fetch." The reasons are worth stating outright — they're what you'd be giving up by defaulting to a different library, and they compound once you start wrapping it.

**One Promise, one Response.** `fetch(url, init)` returns a `Promise<Response>`. No state machine, no `readyState`, no event-handler wiring for the happy path. `await fetch(...)` reads like every other async call in your codebase. XHR is still event-driven under the hood; `fetch` is the Promise-shaped interface.

**Unified Request/Response primitives.** The `Response` you get from `fetch` is the same type Service Workers return, the Cache API stores, and edge runtimes accept. You can `.clone()` a response, hand it back to the browser, cache it, or pipe it elsewhere — no translation layer.

**Cancellation via `AbortController`.** One signal can cancel a whole chain of work — a fetch, a downstream computation, a retry that hasn't fired yet. `AbortSignal.any([...])` composes multiple signals into one; `AbortSignal.timeout(ms)` gives you a timeout without a `setTimeout/clearTimeout` dance. Cancellation is a platform feature, not a library concern.

**Streaming bodies.** `Response.body` is a `ReadableStream`. For downloads, you can read chunks as they arrive — enough for a bytes-loaded counter, a live parser, or handing the stream into something else (`createImageBitmap`, `new Response(stream)`, the Cache API). `Request.body` accepts streams too, though upload progress is the one place this doesn't translate.

**First-class request options.** `credentials`, `cache`, `redirect`, `mode`, `referrer`, `integrity` — all top-level `RequestInit` fields. No `xhr.withCredentials = true` side-effect, no forbidden-header workarounds. The API was designed with modern security and caching semantics in mind.

**Cross-runtime consistency.** The same `fetch` signature runs in browsers, Node 18+, Bun, Deno, Cloudflare Workers, and Service Workers. An SSR-capable client doesn't need a `typeof window` branch. Server-rendered code and client-rendered code can share one HTTP layer.

**Extensibility without class hierarchies.** `fetch` is a plain function. Your custom client is also a plain function with the same signature. Wrapping, currying, proxying, replacing — all standard techniques apply. That's what makes the next section tractable.

## Building a custom fetch wrapper

Most production codebases don't call `fetch` directly. They have a `createClient()` or `apiClient` that layers on defaults, auth headers, timeouts, retry, error normalization, and sometimes interceptors. The trick is to build it without losing `fetch`'s shape — so that swapping in a different transport (like the XHR-backed one below) doesn't force a rewrite of every consumer.

I'll walk through four layers, each small, each earning its weight.

### Layer 1: base URL, default headers, parsed JSON

Start with the shortest useful wrapper:

```typescript
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}
```

Three lines buy you two behaviors: "throw on non-2xx" and "parse JSON on success." Once you find yourself repeating those at every call site, the wrapper earns its place.

A slightly more useful shape accepts configuration:

```typescript
export function createClient(options: {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
}) {
  const { baseURL, defaultHeaders = {} } = options;

  return async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = new URL(path, baseURL).toString();
    const headers = { ...defaultHeaders, ...(init.headers as Record<string, string>) };
    const res = await fetch(url, { ...init, headers });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json() as Promise<T>;
  };
}
```

`new URL(path, baseURL)` is the piece worth stealing. It handles leading and trailing slashes correctly without the manual `${baseURL}/${path}.replace(/\/+/g, '/')` dance that every ad-hoc client eventually grows. Pass a relative path and it resolves against the base; pass an absolute URL and `URL` uses it as-is.

### Layer 2: timeouts via `AbortSignal`

The right way to do timeouts is `AbortSignal.timeout(ms)`:

```typescript
const signal = AbortSignal.timeout(30_000);
const res = await fetch(url, { signal });
```

If a caller also passes their own signal, merge them so either one can cancel the request:

```typescript
function mergeSignals(a?: AbortSignal, b?: AbortSignal): AbortSignal | undefined {
  if (!a) return b;
  if (!b) return a;
  if ('any' in AbortSignal) return AbortSignal.any([a, b]);
  // fallback for older runtimes
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a.addEventListener('abort', onAbort, { once: true });
  b.addEventListener('abort', onAbort, { once: true });
  return controller.signal;
}
```

`AbortSignal.any([...])` does the merge natively in recent browsers; the fallback manually forwards both signals into a new controller. Either way, a single signal flows into `fetch`, and a timeout _or_ a caller abort resolves to the same rejection path — which matters, because downstream `try/catch` can check `err.name === 'AbortError'` regardless of which source fired.

### Layer 3: interceptors

Three chains — request, response, error — turn a static client into an extensible one:

```typescript
type RequestInterceptor = (ctx: { url: string; init: RequestInit }) => void | Promise<void>;
type ResponseInterceptor = (res: Response) => Response | Promise<Response>;

export function createClient(options: { baseURL: string; defaultHeaders?: Record<string, string> }) {
  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const ctx = {
      url: new URL(path, options.baseURL).toString(),
      init: { ...init, headers: { ...(options.defaultHeaders ?? {}), ...(init.headers as Record<string, string>) } },
    };
    for (const fn of requestInterceptors) await fn(ctx);
    let res = await fetch(ctx.url, ctx.init);
    for (const fn of responseInterceptors) res = await fn(res);
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json() as Promise<T>;
  }

  request.useRequest = (fn: RequestInterceptor) => {
    requestInterceptors.push(fn);
    return () => void requestInterceptors.splice(requestInterceptors.indexOf(fn), 1);
  };
  request.useResponse = (fn: ResponseInterceptor) => {
    responseInterceptors.push(fn);
    return () => void responseInterceptors.splice(responseInterceptors.indexOf(fn), 1);
  };

  return request;
}
```

Each `use*` method returns an unsubscribe function, which matters when you register an interceptor from a component and want to clean up on unmount.

Auth becomes a one-liner:

```typescript
api.useRequest((ctx) => {
  ctx.init.headers = { ...(ctx.init.headers as Record<string, string>), Authorization: `Bearer ${token.value}` };
});
```

So does "refresh on 401":

```typescript
api.useResponse(async (res) => {
  if (res.status !== 401) return res;
  await refreshAuth();
  return fetch(res.url, { /* re-run options */ });
});
```

### Layer 4: retry with exponential backoff

For idempotent requests (GET, HEAD, most PUTs, DELETEs), a small retry helper absorbs transient network failures:

```typescript
async function withRetry<T>(fn: () => Promise<T>, attempts = 2, baseDelayMs = 200): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < attempts) await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
    }
  }
  throw lastError;
}
```

Three attempts with 200ms / 400ms / 800ms backoff covers most spurious 502s and DNS blips. Retry non-idempotent requests at your peril; re-sending a POST that already committed is worse than failing loudly. A small allow-list (`['GET', 'HEAD', 'PUT', 'DELETE']`) inside the wrapper is usually how this gets enforced.

### What you end up with

After those four layers, the consumer surface looks like:

```typescript
const api = createClient({
  baseURL: 'https://api.example.com',
  defaultHeaders: { Accept: 'application/json' },
});

api.useRequest((ctx) => {
  ctx.init.headers = { ...(ctx.init.headers as Record<string, string>), Authorization: `Bearer ${token.value}` };
});

const users = await api<User[]>('/users');
```

Flat call-shape, auth handled once, errors thrown as a known type, timeouts and retry applied where appropriate. Every layer is a plain function wrapping the one below. At the bottom is still `fetch`.

Which is exactly where the upload-progress gap lives.

## Why `fetch` can't show upload progress

Download progress with `fetch` works, but awkwardly. You read the response body as a stream:

```typescript
const res = await fetch('/big.zip');
const total = Number(res.headers.get('content-length')) || null;
let loaded = 0;
const reader = res.body!.getReader();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  loaded += value.byteLength;
  onProgress(loaded, total);
}
```

That's fine. You do have to keep the chunks around yourself (or pipe them into a new `Response` if you want to hand them off), but the primitives are there.

For uploads, the missing piece is that the `Request` body is consumed by the browser's network stack, not by your code. You can pass a `ReadableStream`, but there's no event that fires as the browser drains it. Some Chromium versions support `Request.duplex: 'half'` which opens the door to upload streaming, but there's still no `progress` event — you'd have to instrument your own stream's `pull()` to count bytes, and even then you're measuring what the stream emits, not what the socket has sent.

In practice, if you want a progress bar for uploads in 2026, you use XHR.

## The five XHR events you actually care about

Every XHR fires a predictable cluster of events. The ones that matter for progress UIs are:

```typescript
xhr.upload.onprogress = (e: ProgressEvent) => { /* upload bytes */ };
xhr.onprogress        = (e: ProgressEvent) => { /* download bytes */ };
xhr.onload            = () => { /* request completed successfully */ };
xhr.onerror           = () => { /* network error */ };
xhr.onabort           = () => { /* xhr.abort() was called */ };
xhr.ontimeout         = () => { /* xhr.timeout exceeded */ };
```

Two things are easy to miss.

First, `xhr.upload` is a separate `XMLHttpRequestUpload` object with its own event target. It fires `progress` as the request body is sent; `xhr` itself fires `progress` as the response body is received. They're the two phases of the same request and they use the same event shape.

Second, `xhr.onload` fires on any completed request, including one that returned HTTP 500. "Request completed" here means "the server replied." If you want "the request succeeded," check `xhr.status` yourself inside `onload`.

There are other events (`loadstart`, `loadend`, `readystatechange`) but for a progress UI the five above cover everything you need.

## The `ProgressEvent` shape, and `lengthComputable`

Both `onprogress` callbacks receive a `ProgressEvent` with three fields:

```typescript
interface ProgressEvent {
  lengthComputable: boolean;
  loaded: number;   // bytes transferred so far
  total: number;    // bytes expected — ONLY valid when lengthComputable is true
}
```

`lengthComputable` is the field most first-time implementations forget. It's `false` when the server sent a chunked response without a `Content-Length` header, and it's `false` during uploads where the body is a stream of unknown length. When it's false, `total` is `0` — not "not provided," not `undefined`, just the number zero — and dividing by it gives you `NaN` or `Infinity` in your progress bar.

Wrap the normalization in one place:

```typescript
function normaliseProgress(phase: 'upload' | 'download', e: ProgressEvent) {
  const total = e.lengthComputable ? e.total : null;
  const ratio = total && total > 0 ? e.loaded / total : null;
  return { phase, loaded: e.loaded, total, ratio };
}
```

`null` is the honest answer when you don't know the total. The UI layer decides what to show — bytes counter with no percentage, an indeterminate bar, a spinner. Don't let `NaN` leak out of your transport.

## A minimal upload-progress example

Here's the smallest useful upload with progress, showing the API surface without a wrapper:

```typescript
async function uploadWithProgress(
  file: File,
  onProgress: (loaded: number, total: number | null) => void
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = (e) => {
      const total = e.lengthComputable ? e.total : null;
      onProgress(e.loaded, total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`HTTP ${xhr.status}`));
    };
    xhr.onerror = () => reject(new TypeError('Network error'));
    xhr.onabort = () => reject(new DOMException('Aborted', 'AbortError'));

    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}
```

Three things worth pointing out:

- **Don't set `Content-Type` when sending `FormData`.** The browser needs to pick its own boundary string for multipart encoding. If you set `Content-Type: multipart/form-data` manually, you'll override it without the boundary, and the server will fail to parse the body.
- **`xhr.status` check is explicit.** `onload` fires for 500s. Treating "the request completed" and "the request succeeded" as the same thing is the single most common source of silent upload bugs.
- **`new Promise` is the adapter.** XHR is event-based; the rest of your code is `async/await`-shaped. Wrapping it once in a Promise keeps the awkwardness local.

## A minimal download-progress example

For downloads, the same shape, but on `xhr.onprogress`:

```typescript
async function downloadWithProgress(
  url: string,
  onProgress: (loaded: number, total: number | null) => void
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (e) => {
      const total = e.lengthComputable ? e.total : null;
      onProgress(e.loaded, total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as Blob);
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new TypeError('Network error'));

    xhr.send();
  });
}
```

`xhr.responseType = 'blob'` is the critical line for file downloads. Without it, you get text, and for binary content that means the browser decodes bytes as UTF-8 and hands you garbage. For JSON you'd use `'json'`, for arbitrary bytes `'arraybuffer'` or `'blob'`. Set it _before_ `send()`.

The server has to send a `Content-Length` header if you want a meaningful `total`. Chunked transfer encoding doesn't include one, and `lengthComputable` will be `false`. CDNs that gzip on the fly also sometimes strip `Content-Length`. When that happens, you're stuck with a bytes counter and no percentage — which is honest.

## Wrapping XHR to look like `fetch`

Most of a modern codebase is `fetch`-shaped. If you do real progress in XHR but everything else in `fetch`, you end up with two parallel request pipelines — different error types, different abort semantics, different header normalization.

The trick is to let `fetch` be the default and swap in an XHR-backed function _that returns a `Response`_ when progress is needed. The calling code doesn't change.

Here's a wrapper that does exactly that (this is the real implementation from my api-provider package):

```typescript
export function createXhrFetch(
  onProgress: (progress: RequestProgress) => void
): (input: string, init: RequestInit) => Promise<Response> {
  return function xhrFetch(input, init) {
    const method = (init.method ?? 'GET').toUpperCase();
    const body = (init.body ?? null) as XMLHttpRequestBodyInit | null;
    const headers = init.headers as Record<string, string> | undefined;
    const signal = init.signal as AbortSignal | null | undefined;

    return new Promise<Response>((resolve, reject) => {
      if (typeof XMLHttpRequest === 'undefined') {
        reject(new Error('XHR unavailable in this runtime'));
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open(method, input, true);
      xhr.responseType = 'blob';
      if (init.credentials === 'include') xhr.withCredentials = true;

      if (headers) {
        for (const [name, value] of Object.entries(headers)) {
          try { xhr.setRequestHeader(name, value); }
          catch { /* forbidden headers are silently skipped */ }
        }
      }

      xhr.upload.onprogress = (e) => onProgress(normaliseProgress('upload', e));
      xhr.onprogress        = (e) => onProgress(normaliseProgress('download', e));

      const onAbort = () => xhr.abort();
      if (signal) {
        if (signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
      }

      xhr.onload = () => {
        if (signal) signal.removeEventListener('abort', onAbort);
        resolve(new Response(xhr.response as BodyInit | null, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders()),
        }));
      };
      xhr.onerror   = () => reject(new TypeError('Network error'));
      xhr.onabort   = () => reject(new DOMException('Aborted', 'AbortError'));
      xhr.ontimeout = () => reject(new DOMException('Request timeout', 'TimeoutError'));

      xhr.send(body);
    });
  };
}
```

Four things are doing real work in this shape:

The **return type is `Promise<Response>`**. That's the whole point — anything that accepts `typeof fetch` accepts this function. The rest of the codebase (interceptors, retry, JSON parsing, error mapping) stays transport-agnostic.

The **header normalizer at the bottom** translates `xhr.getAllResponseHeaders()` (a raw CRLF-separated string) into a `Headers` object so the `Response` behaves exactly like one from `fetch`:

```typescript
function parseHeaders(raw: string): Headers {
  const out = new Headers();
  if (!raw) return out;
  for (const line of raw.trim().split(/[\r\n]+/)) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const name = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (name) out.append(name, value);
  }
  return out;
}
```

The **AbortSignal bridge** converts between `fetch`'s cancellation primitive and XHR's `abort()` method. `AbortSignal.addEventListener('abort', xhr.abort)` makes the two APIs speak the same language; checking `signal.aborted` up front handles the case where the caller passes an already-aborted signal (which happens, for example, when you cancel a request before it's sent).

The **`try/catch` around `setRequestHeader`** is deliberate. Browsers forbid certain headers (`User-Agent`, `Cookie`, `Host`, most `Sec-*` and `Proxy-*` variants). `fetch` silently ignores them too; the `try/catch` makes XHR match the behavior.

## Aborting, timing out, and erroring

The four terminal outcomes of an XHR are `onload`, `onerror`, `onabort`, `ontimeout`. They're mutually exclusive — exactly one fires per request. The translation to `fetch`-world:

| XHR event     | Meaning                              | Promise shape                                  |
|---------------|--------------------------------------|------------------------------------------------|
| `onload`      | Server replied (any status)          | `resolve(new Response(...))`                   |
| `onerror`     | Network failure, CORS block, DNS     | `reject(new TypeError('Network error'))`       |
| `onabort`     | `xhr.abort()` was called             | `reject(new DOMException('...', 'AbortError'))`|
| `ontimeout`   | `xhr.timeout` ms elapsed             | `reject(new DOMException('...', 'TimeoutError'))` |

`fetch` uses `TypeError` for network errors and `DOMException` for abort. Matching those types means existing error handlers keep working when you swap transports.

A caller-set `xhr.timeout = 30_000` fires `ontimeout` automatically without any extra code. That's one of the small wins of XHR over `fetch` + `AbortController` + `setTimeout` — the timeout machinery is built in.

## Pitfalls worth naming

A handful of traps that cost me time the first time I hit them.

**Setting `Content-Type` with FormData breaks multipart.** The browser's automatic `multipart/form-data; boundary=...` header is the only one the server can parse. Don't override it.

**CORS progress is restricted.** For cross-origin requests, upload progress events only fire if the response includes the appropriate `Access-Control-Allow-Origin` header. If you're seeing `loaded = 0` forever on a cross-origin upload, it's almost certainly CORS, not your code.

**`responseType` must be set before `send()`.** Setting it after is a no-op. The browser needs to know how to buffer the response from the first byte.

**Gzip and `Content-Length`.** Many CDNs strip `Content-Length` when they apply gzip on the fly (because the compressed length is different from the decompressed length). Your client sees `lengthComputable: false` even though the server knew the size. There's no client-side fix; if you control the server, serve pre-compressed content or skip compression for assets where progress matters.

**Don't hold the whole response in memory unnecessarily.** `responseType: 'blob'` lets the browser manage the buffer; `responseType: 'arraybuffer'` forces it into JS-heap memory. For anything above a few MB, `blob` is the right default.

## What I'd reach for first

For any project that needs real progress UIs, the shape I'd build every time:

- **Default transport is `fetch`.** It's the modern primitive; it's faster; it hydrates into SSR-friendly patterns cleanly.
- **Opt into XHR only when the caller asks for progress.** A single `onRequestProgress` option is enough to swap transports for that specific call.
- **The XHR path returns a `Promise<Response>`**, so everything downstream keeps working — interceptors, retry, error mapping, JSON parsing.
- **Normalize `{ loaded, total, ratio }` at the transport layer.** Hand `null` upstream when the total is unknown. Let the UI decide how to render that state.
- **Bridge `AbortSignal` once** in the wrapper, not in every caller. XHR's `abort()` and fetch's `AbortController` exist in the same logical slot; the wrapper translates.

That's the whole picture. XHR isn't the cool API anymore — it's the one that still works for a specific thing fetch can't do, and the small amount of glue code above is what keeps it from contaminating the rest of the codebase.
