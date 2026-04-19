---
title: Four bugs every infinite-scroll list has — and their fixes
description: The four bugs every infinite-scroll list eventually ships, and the specific lines inside a 230-line Vue component that prevent each one.
date: 2026-04-19
updatedAt: 2026-04-19
keywords:
  - infinite scroll
  - Vue 3
  - IntersectionObserver
  - AbortController
  - pagination
  - arity dispatch
  - memory leak
  - TypeScript
  - Nuxt
---

Infinite scroll is one of those features that looks trivial on a whiteboard and gets weird under real usage. The happy path fits on a slide: an IntersectionObserver at the bottom of the list, a fetch on intersect, append the results. Ship it.

Then the bugs find you. The user changes a filter and the next-page call still returns the old filter's data. Two "load more" requests go out in the same tick because the user scrolled fast. The component unmounts while an observer is still alive and the callback closure keeps the whole page reachable from GC. The handler works in development but not in prod because someone used `fetcher()` instead of `fetcher(page)`.

`ASentinelPagination` is my answer. It's ~230 lines in a single `.vue` file, and it isn't clever. What's worth writing about isn't the architecture — it's the list of specific bugs it avoids and the specific lines that avoid them. That's what this post is.

I'll frame the whole thing around four bugs I've shipped at least once in earlier attempts.

## The API the consumer writes

Before the bugs, here's what a consumer actually writes:

```vue
<ASentinelPagination :fetch-handler="loadProducts">
  <template #card="{ item }">
    <ProductCard :product="item" />
  </template>
  <template #initialLoading="{ count }">
    <ProductCardSkeleton v-for="i in count" :key="i" />
  </template>
  <template #loadingMore="{ count }">
    <ProductCardSkeleton v-for="i in count" :key="i" />
  </template>
  <template #emptyState>
    <NoResults />
  </template>
</ASentinelPagination>
```

Four slots, one prop that matters. The handler returns `{ items: T[], pagination?: { current_page, per_page, total, last_page } }`. Pagination is optional — if the backend doesn't return it, the list loads once and stops. That's the degraded-but-honest behavior.

## `fetchHandler.length`: arity-based dispatch

Some APIs want a page number, some don't. Some endpoints paginate server-side, others return everything. If the component forces one shape, consumers end up writing adapter closures to force their fetcher into the expected signature. If the component forces the _other_ shape, consumers who don't care about pagination end up writing `(_page) => ...` everywhere and ignoring the argument.

The wrong fix is adding a `mode: 'paged' | 'stateless'` prop. It's a config for something the function's own shape already expresses.

The right fix turns out to be inspecting the function at runtime:

```typescript
async function runFetchHandler(): Promise<ISPPaginationHandlerResult<T>> {
  if (props.fetchHandler.length >= 1) {
    const fn = props.fetchHandler as (
      p: ISPPaginationMeta
    ) => Promise<ISPPaginationHandlerResult<T>>;
    return await fn(pagination.value);
  }

  const fn = props.fetchHandler as () => Promise<ISPPaginationHandlerResult<T>>;
  return await fn();
}
```

`Function.prototype.length` returns how many formal parameters the function declares. If the consumer wrote `loadProducts(p)`, it's 1; if they wrote `loadProducts()`, it's 0. The component branches on that.

From the consumer's side, both are legal:

```typescript
const loadAllProducts = () => $api('/products');                                   // stateless
const loadProductsPage = (p) => $api('/products', { query: { page: p.current_page } }); // paged
```

The TypeScript union in the prop type keeps both signatures honest:

```typescript
export type ISPFetchHandler<T> =
  | ((pagination: ISPPaginationMeta) => Promise<ISPPaginationHandlerResult<T>>)
  | (() => Promise<ISPPaginationHandlerResult<T>>);
```

There's one trap worth naming. Arrow functions that declare a parameter but never use it still count as arity 1. If a consumer writes `(_p) => $api('/products')`, it hits the paged branch. That's fine — the handler ignores the arg — but it's the kind of thing to write down once so the next person asking "why is pagination being passed?" can read the answer.

## `inFlight`: one gate, three derived readouts

This is the classic. User hits the bottom, observer fires, fetch starts. User scrolls a pixel, observer fires _again_ (the sentinel is still on screen), and a second fetch starts before the first one resolved. Depending on timing, you get:

- Both requests return page 2; items duplicate.
- One fires with `current_page = 2`, the other with `current_page = 3`; items are interleaved or page 2 is silently skipped.
- Both return the same page, the consumer's de-dup logic breaks, and the layout shifts.

The naïve fix is one boolean — `isLoading`. It doesn't quite work because there are _two_ logically different loads: the initial one (full-screen skeleton) and the next-page one (small skeleton at the bottom). Two booleans can disagree, and once they do, the gate logic starts branching on "is _this_ kind of load in progress?" which is the wrong question.

The right question is "is _anything_ in progress?" One source of truth, two derived readouts:

```typescript
const initialLoading = ref(true);
const isFetchingMore = ref(false);
const inFlight = ref<'init' | 'next' | null>(null);
```

`inFlight` is the gate. The other two are what the template switches on for which skeleton to show. They all get set together:

```typescript
const fetchData = async (mode: 'init' | 'next') => {
  if (inFlight.value !== null) return;
  if (mode === 'next' && (!hasNextPage.value || isFetchingMore.value)) return;

  inFlight.value = mode;

  try {
    if (mode === 'init') initialLoading.value = true;
    if (mode === 'next') isFetchingMore.value = true;

    const result = await runFetchHandler();
    applyPaginationFromHandlerResult(result);
    items.value = mode === 'init' ? result.items : [...items.value, ...result.items];
  } finally {
    if (mode === 'init') initialLoading.value = false;
    if (mode === 'next') isFetchingMore.value = false;
    inFlight.value = null;
  }
};
```

Two small disciplines keep this honest. The early return checks `inFlight.value !== null`, not any specific boolean — so if init is in flight and a next-page trigger fires, the next fetch is rejected even though `isFetchingMore` is still false. And the release lives in `finally`, not `try` — a fetch that throws still releases the gate, so the component can't silently lock itself into "refusing to load anything" after one network hiccup.

### The sentinel, and the 0.6 threshold

The sentinel itself is a 1px div with `aria-hidden`:

```vue
<div ref="sentinelRef" class="h-1 min-w-[1px] w-full" aria-hidden="true" />
```

And the observer has two safeguards I want to isolate:

```typescript
observer = new IntersectionObserver(
  (entries) => {
    const entry = entries[0];
    if (!entry?.isIntersecting) return;
    if (!initialLoading.value && !isFetchingMore.value && hasNextPage.value) {
      void fetchNextPage();
    }
  },
  { root: null, rootMargin: '0px', threshold: 0.6 }
);
```

`threshold: 0.6` instead of `0` — the sentinel is 1px; at `threshold: 0`, jittering one pixel in and out of the viewport during a scroll can fire the callback multiple times. At 0.6, the intersection has to be meaningful (60% of a 1px target is not a lot, but it's stable against jitter). And the state check _inside_ the callback re-confirms the gate: between intersection firing and the callback running, another load might have started. The three-condition guard is the idempotent second line of defense behind `inFlight`.

## Resetting when the fetcher's identity changes

The user clicks "Category: Shoes." The parent component swaps in a new `fetchHandler` that includes the new filter. What should happen: clear the list, fetch page 1 with the new handler, attach a new observer.

What happens if you don't handle it: the old list stays on screen. Page 2 of the _new_ filter gets appended to page 1 of the old filter. The user sees a mix of shoes and unrelated items, and "page 3" fetches happen against one handler but get interpreted against another's pagination state.

The trigger is a watch on the handler itself:

```typescript
watch(
  () => props.fetchHandler,
  async () => {
    observer?.disconnect();

    items.value = [];
    hasNextPage.value = false;
    pagination.value = {
      current_page: 1,
      per_page: pagination.value.per_page,
      total: 0,
      last_page: 1,
    };

    await fetchData('init');
    setupObserver();
  }
);
```

Four things happen, in order, and all four are load-bearing.

Disconnect first. If you don't, the old observer is still alive during the reset, and the sentinel is still intersecting the viewport (nothing scrolled). The old observer can fire `fetchNextPage()` against stale pagination state in the middle of the reset — which means a request goes out with `current_page: 2` against a handler that thinks it's returning the first page. That request is fundamentally wrong; it has to be prevented, not corrected.

Clear items and pagination next. Keep `per_page` because that's often a user preference the filter shouldn't reset. The other three fields go back to defaults.

Fire `fetchData('init')`. Skeleton shows. Fetch runs with the new handler. Items arrive.

Re-attach the observer. The DOM node is the same one; we're binding a fresh observer instance to the post-reset state.

There's a subtlety here worth writing down. The watch is on `props.fetchHandler` — reference identity. If the consumer passes `() => $api('/products', { query: { category } })` inline in the template, a new function is created on every parent re-render, and the watch fires on every re-render. That's almost never what you want. Consumers have to be disciplined: memoize the handler with `computed`, or pull it out of a composable whose identity is stable, or accept that the list will re-fetch on every parent render.

I considered having the component accept a separate `key` prop to trigger resets explicitly instead of using reference identity, but that pushes complexity to every consumer. The reference-watch contract is simpler if you're willing to educate people about function identity once.

## Observer cleanup, and the leak it prevents

This is the quiet one. A user navigates away from a route that had `ASentinelPagination` on it. Vue unmounts the component. But the IntersectionObserver, if you didn't clean it up, is still alive — it holds a reference to the sentinel DOM node _and_ to the callback closure, which captured the entire `<script setup>` scope: `items`, `pagination`, all the refs, the whole component instance.

None of that gets garbage-collected until the observer releases them. On a route with lots of in-and-out traffic, the leak compounds. I found one in a previous app after a user reported the page getting slower the longer they used it — their session was accumulating dozens of dead components' worth of state.

The fix is one call:

```typescript
onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
```

Easily written, easily forgotten. The thing that catches this in code review is a mental checklist: every `new IntersectionObserver`, `new MutationObserver`, `addEventListener`, `setInterval`, `requestAnimationFrame` needs a matching teardown in `onBeforeUnmount` or `onUnmounted`. If you can't point to the teardown, you're leaking. Every time.

### `v-scroll-reveal`: per-card observer

The per-card scroll-reveal directive inside the same component has its own version of this:

```typescript
const vScrollReveal = {
  mounted(el: HTMLElement) {
    // ... setup observer, stash on el._scrollObserver
    observer.observe(el);
  },
  unmounted(el: HTMLElement) {
    const observer = (el as HTMLElement & { _scrollObserver?: IntersectionObserver })._scrollObserver;
    observer?.disconnect();
  },
} as const;
```

The directive stashes its observer on the element itself (`el._scrollObserver`) so `unmounted` can find it later. There's also a `observer.unobserve(el)` call inside the mount-time callback — once a card has faded in, there's nothing left to watch for, and leaving the observer attached is just more work per scroll event for no payoff. `unmounted` is the belt-and-braces fallback for cards that were unmounted before they were ever visible (scrolled past fast, navigated away, removed by a filter).

The type assertion on `_scrollObserver` is uglier than I'd like. A `Symbol` key would avoid the cast but would also break DevTools inspection. I picked the version I can actually read.

## Type guards without `zod`

Two things sit outside the bug frame but earned their way into the component.

The type guards for pagination metadata:

```typescript
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
function isPaginationMeta(value: unknown): value is ISPPaginationMeta {
  if (!isRecord(value)) return false;
  return (
    isNumber(value.current_page) &&
    isNumber(value.per_page) &&
    isNumber(value.total) &&
    isNumber(value.last_page)
  );
}
```

No `zod`, no `yup`. Three functions, thirty lines, no dependency added to a UI component. The point isn't performance; it's that a UI component that depends on a validator library leaks that choice into every consumer. Hand-rolled guards keep the dependency graph clean, and for this shape of check (four fields, all numbers) they're shorter than a schema anyway. The `Number.isFinite` check matters — without it, `NaN` and `Infinity` pass `typeof === 'number'` and you end up with "page 3 of Infinity" behaviour downstream.

The `void fetchNextPage()` in the observer callback is tiny and deliberate. The callback isn't async, so awaiting does nothing. Floating promises trip most linters. `void` is the honest signal: "I know this is async, I'm intentionally not awaiting, yes I've thought about it." It's one keyword, and it's the difference between a clean lint and a suppress-comment.

## A summary of the four defenses

At ~230 lines, the whole component is the kind of thing you could rewrite in an afternoon. What makes it work isn't any of the individual pieces — arity dispatch, `inFlight` as a discriminated state, observer cleanup, reference-identity resets, hand-rolled type guards. Each is small enough that if I explained it in isolation you'd nod and move on.

The thing that made this component stop being a bug factory was seeing the four failure modes above and writing _specific_ guards for each one. No library, no abstraction. Just a handful of small defenses, each paid for by a bug I shipped in an earlier version. That's most of what "hardening" looks like in practice — not cleverness, just a longer memory.
