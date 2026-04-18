---
title: Building ali-nuxt-toolkit — a tour of the internals
description: Three Nuxt modules, one monorepo. The design choices, the tricks, and the pieces I'd happily lift into another project.
date: 2026-04-18
---

A while back I decided to pull the patterns I kept rewriting at work into a small set of Nuxt modules. Nothing novel — just the stuff that everyone on every SaaS team eventually writes: a typed HTTP client, layout-scoped middleware, and a crypto service for locally-stored secrets. Packaging them properly turned into its own project: **ali-nuxt-toolkit**.

This post is a tour of what's inside and why certain pieces are shaped the way they are. I'll skip the obvious parts and spend most of the words on the details I'd want to read if someone else had written it.

## The shape of the repo

`ali-nuxt-toolkit` is a pnpm monorepo. The top level is roughly:

- `packages/` — three independently published modules under the `@alikhalilll` scope.
- `apps/docs/` — a Nuxt 4 + `@nuxt/content` site, prerendered to static HTML.
- `playgrounds/nuxt/` — a minimal app that wires all three modules together; handy for kicking the tires locally.
- `.github/workflows/` — CI (lint, typecheck, matrix build on Node 20 + 22) and a Changesets-driven release pipeline.

The three packages:

- **`@alikhalilll/nuxt-api-provider`** — strongly-typed fetch client with an interceptor chain, retry/backoff, timeouts, and upload/download progress.
- **`@alikhalilll/nuxt-auto-middleware`** — layout-scoped route middleware with glob patterns, named groups, and per-page overrides.
- **`@alikhalilll/nuxt-crypto`** — AES-256-GCM + PBKDF2 built on Web Crypto, with an LRU key cache and pluggable algorithms.

They're deliberately small and focused. Each one works standalone. Each one also has a framework-agnostic "core" that can run in Node, Bun, Deno, or a test — no Nuxt required.

## The module skeleton

All three modules follow the same Nuxt 4 shape:

```typescript
export default defineNuxtModule<Options>({
  meta: {
    name,
    configKey,
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: { /* ... */ },
  setup(options, nuxt) {
    // 1. Write a serialized config file into .nuxt
    addTemplate({
      filename: 'my-module-config.mjs',
      getContents: () => `export default ${JSON.stringify(config)};\n`,
    });

    // 2. Register the runtime plugin
    addPlugin({ src: resolver.resolve('./runtime/plugin'), mode: 'all' });

    // 3. Augment Nuxt's types so $myModule shows up everywhere
    const typesTemplate = addTemplate({
      filename: 'types/my-module.d.ts',
      getContents: () => typeDeclarations,
    });
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: typesTemplate.dst });
    });
  },
});
```

The interesting part is _what I'm not doing_. I'm not passing the config object through provide/inject at runtime, and I'm not importing user code directly from `module.ts`. Everything flows through generated files in `.nuxt`. This has two benefits:

1. The runtime plugin stays tiny — it just imports a plain JS object from a virtual path. No work at boot.
2. Tree-shaking works. If a feature isn't used, its template contents aren't referenced, and the bundle drops it.

### Virtual modules, and how to keep `tsc` happy

Generated templates don't exist on disk when the type-checker runs. Without extra work, `import config from '#build/api-provider-config.mjs'` would be flagged as missing. Each package has a `nuxt-virtual.d.ts` declaring stubs:

```typescript
declare module '#build/api-provider-config.mjs' {
  const config: {
    baseURL: string;
    defaultTimeoutMs: number;
    retry: { attempts: number; baseDelayMs: number };
  };
  export default config;
}
```

Now `tsc --noEmit` passes, and editor autocomplete still works on fields of the generated config.

## `nuxt-api-provider`: chainable interceptors and two transports

The public surface of the API client is deliberately flat. You call it like a function:

```typescript
const users = await $apiProvider<User[]>('/users', { method: 'GET' });
```

You add cross-cutting behavior through three chains:

```typescript
$apiProvider.useRequest((ctx) => {
  ctx.headers.Authorization = `Bearer ${token}`;
});

$apiProvider.useResponse((ctx, response) => { /* ... */ });
$apiProvider.useError((ctx, err) => { /* ... */ });
```

Each `use*` returns an unsubscribe function, which matters if you register interceptors from a component and want to clean up on unmount.

### Two transports, one API

Most requests go through `fetch`. But `fetch` doesn't expose upload progress — the `ReadableStream` side of the Request body is fine for streams but browsers don't give you byte-level `progress` events the way XHR does. So when a caller passes `onRequestProgress`, the client swaps transports:

```typescript
const transport = ctx.options.onRequestProgress
  ? createXhrFetch(ctx.options.onRequestProgress)
  : defaultFetch;
```

The XHR wrapper returns a Response-shaped object so the rest of the pipeline doesn't care how the bytes came back. That kind of "one API, swap the engine under it" has been my favorite pattern for two years — it keeps optional features optional without branching the whole code path.

### Interceptors by path, not by function

The module options look like this:

```typescript
{
  baseURL: 'https://api.example.com',
  onRequestPath:  '~/api/on-request.ts',
  onSuccessPath:  '~/api/on-response.ts',
  onErrorPath:    '~/api/on-error.ts',
}
```

Interceptors are resolved as _file paths_, not inline functions. The generated template dynamically imports them, and the runtime plugin wires whatever's exported into the chain. Two reasons:

- **No circular config.** Users often want to import types from the api-provider module inside their interceptor. If the interceptor lived inside `nuxt.config.ts`, the config file would depend on the module it's configuring.
- **Code-splitting.** The interceptor becomes its own chunk, which matters on cold loads.

### Error branding without `instanceof`

`instanceof` fails the moment you have two copies of the same class — which happens with duplicated deps, iframes, web workers, or pnpm hoisting quirks. The client's error type uses a Symbol brand instead:

```typescript
const API_ERROR_BRAND: unique symbol = Symbol.for(
  '@alikhalilll/nuxt-api-provider.ApiError'
);

export class ApiError extends Error {
  readonly [API_ERROR_BRAND] = true;

  static is(e: unknown): e is ApiError {
    return typeof e === 'object' && e !== null && API_ERROR_BRAND in e;
  }
}
```

`Symbol.for` gives you the _same_ symbol across module copies. `ApiError.is(err)` works where `err instanceof ApiError` doesn't. This has saved me on every project that ever crossed a realm boundary.

## `nuxt-auto-middleware`: compile-time regex, runtime dispatch

The module takes rules like this:

```typescript
autoMiddleware: {
  groups: {
    adminOnly: ['auth', 'require-admin'],
  },
  rules: [
    { layouts: ['admin-*'], middlewares: ['@adminOnly'] },
    { layouts: [/^workspace\/.*/], middlewares: ['auth', 'workspace'] },
  ],
}
```

At module setup time, each glob gets compiled to a RegExp. Each group reference gets expanded. The resulting rules get _serialized_ into a generated template:

```typescript
export const rules = [
  { patterns: ['^admin-.*$'], middlewares: ['auth', 'require-admin'] },
  { patterns: ['^workspace\\/.*'], middlewares: ['auth', 'workspace'] },
];
```

At runtime, the plugin rehydrates the patterns with `new RegExp(source)` and matches against the current layout. The client never sees a glob parser — it's been pre-compiled away. On a typical app this saves a few KB, but more importantly it means adding more rules doesn't cost more bundle size beyond the rule strings themselves.

## `nuxt-crypto`: the LRU that caches promises

The crypto service is the part I'm happiest with. It wraps Web Crypto's AES-GCM + PBKDF2 primitives with a clean encrypt/decrypt API. The trick is the key cache.

PBKDF2 with 100,000 iterations is slow on purpose — that's the whole point. But when your UI tries to decrypt three fields from IndexedDB in parallel, doing three separate key derivations is both wasteful and slow. The cache fixes that, but the detail that actually matters is _what_ it caches:

```typescript
const getDerivedKey = async (salt, fingerprint?) => {
  const key = KeyCache.key(salt, iterations, fingerprint);
  const cached = cache.get(key);
  if (cached) return cached;

  // Cache the promise, not the settled key
  const pending = algorithm.deriveKey({
    subtle,
    passphrase,
    fingerprint,
    salt,
    iterations,
  });
  cache.set(key, pending);
  return pending;
};
```

The cache holds `Promise<CryptoKey>`, not `CryptoKey`. If three `decrypt()` calls arrive in the same tick with the same salt, they all await the _same_ pending promise. PBKDF2 runs once. The naive version — cache the settled key — leaves a window where two calls both see "not cached" and start duplicate work.

The LRU itself uses the fact that JavaScript `Map` preserves insertion order:

```typescript
get(key: string): Promise<CryptoKey> | undefined {
  const value = this.map.get(key);
  if (!value) return undefined;
  this.map.delete(key);   // delete + re-insert moves to newest
  this.map.set(key, value);
  return value;
}
```

Eviction is then just `this.map.keys().next().value` — the oldest.

### Versioned payloads

Encrypt output carries a version byte:

```
[version: 1B] [salt: 16B] [iv: 12B] [ciphertext: …]
```

On decrypt, mismatched versions fail early. This is the kind of thing you add before you need it — the day I want to rotate from AES-GCM to something post-quantum, the old payloads will still decrypt through the old algorithm while new ones use the new one. Without a version byte you'd be stuck guessing.

## The docs site as a playground for the modules

`apps/docs` uses all three modules. That sounds obvious, but it's load-bearing — the docs are _how I notice breakage_ before users do. If an update to api-provider breaks the doc site's JSON Placeholder demo, CI fails on the build step. No test suite needed for that particular class of regression.

Other things that earned their keep:

- **`@tailwindcss/vite`** — no PostCSS, no `tailwind.config.js`, just a Vite plugin. One less config file in my life.
- **Static prerender to GitHub Pages** — Nitro's `github-pages` preset gives you a `/.output/public/` that Actions uploads straight to Pages. No servers, no cache invalidation, no surprises.
- **`NUXT_PUBLIC_CF_ANALYTICS_TOKEN`** — optional Cloudflare Web Analytics. No cookies, no banner, no opinion.

## Release: Changesets all the way down

Every PR that changes a package includes a `.changeset/<id>.md` describing the bump and changelog entry. On master, a GitHub Action runs `changesets version` and either:

1. Opens a "Version Packages" PR with the bumped versions, or
2. Publishes to npm if versions are already bumped.

This is the least-effort setup I've found that gives honest changelogs, semver discipline, and no-touch npm publishing. The CI pipeline itself is three files: `ci.yml` (lint + typecheck + matrix build), `release.yml` (changesets), and `commitlint.yml` (conventional commits on PRs).

## The parts I'd reuse tomorrow

If I were starting a new Nuxt module from scratch, I'd lift these patterns without thinking:

- **Serialize config into a generated `.mjs` file.** Avoids re-evaluating at runtime, and the runtime plugin stays 15 lines.
- **Virtual-module `.d.ts` stubs.** Offline typecheck without running the Nuxt prepare step.
- **Symbol-branded errors.** Free for low-traffic modules, life-saving for the ones that cross realms.
- **Promise-keyed caches.** Any time the underlying operation is async and expensive, cache the promise, not the result.
- **Framework-agnostic core + thin Nuxt wrapper.** Makes the code easier to test, easier to reuse, and easier to delete.

The repo is MIT-licensed and lives on [GitHub](https://github.com/alikhalilll). If you spot something that could be better, open an issue — I'd genuinely rather be corrected than comfortable.
