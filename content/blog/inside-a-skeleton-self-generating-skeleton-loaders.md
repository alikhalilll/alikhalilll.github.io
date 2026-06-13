---
title: Inside @alikhalilll/a-skeleton — self-generating skeleton loaders
description: How a-skeleton derives placeholder UI from the real component — clone mode, structural mode, mirror mode, and the capture → cache → replay pipeline behind them.
date: 2026-06-13
keywords:
  - Vue 3
  - Nuxt
  - skeleton loader
  - loading states
  - getComputedStyle
  - Range API
  - ResizeObserver
  - TypeScript
  - component library
  - accessibility
---

Skeleton loaders are duplicate UI. You build a card, then you build a second card made of grey rectangles that approximates the first, then every time you refactor the real card you forget to refactor the placeholder. Three weeks later the heading is left-aligned in the real component and centred in the skeleton, and nobody notices until a designer scrolls past it on staging.

`@alikhalilll/a-skeleton` is built around a different premise: the skeleton derives itself from the real component. You wrap your card once, and the library figures out the placeholder by reading the card. No parallel template. No grey rectangles to keep in sync. The refactor you do on the card is the refactor the skeleton picks up on the next render.

This post is what's underneath that — the authoring contract that makes it work, the three rendering strategies that pay for different trade-offs, and the capture pipeline behind clone mode, which is the part I'd carry into any future "I need a copy of how this looks right now" problem.

## The contract: keep tags unconditional, gate content

Before anything else, there's one rule. It's the load-bearing piece for every strategy below, so I'm putting it at the top.

**Wrong:**

```vue
<div v-if="user">
  <h3>{{ user.name }}</h3>
  <p>{{ user.bio }}</p>
</div>
```

**Right:**

```vue
<div>
  <h3>{{ user?.name }}</h3>
  <p>{{ user?.bio }}</p>
</div>
```

The walker — whether it's reading the live DOM or the vnode tree — needs to see the same shape during loading as it'll see after data arrives. If the heading is wrapped in `v-if="user"`, the walker sees a comment node during loading and an `<h3>` after, and it has no way to predict the placeholder geometry. With the optional-chained interpolation, the `<h3>` is always there; its text is empty during loading, and the walker classifies empty text-owner tags (`<h1>`–`<h6>`, `<p>`, `<span>`, etc.) as shimmer text bars at the heading's natural rendered height.

Tags are the schema. Content is the payload. You can swap the payload to `null` without the schema noticing. That single discipline is what unlocks the rest.

The other half of the contract is the `data-skeleton-ignore` escape hatch. If part of your component is decorative chrome — a gradient background, an always-present brand badge, an SVG flourish — you don't want it replaced by a grey block. Mark it `data-skeleton-ignore` and the walker treats it as invisible; the real element renders verbatim through both states. The corollary, `data-skeleton-stop`, says "don't recurse into this; render it as one block." Useful for atomic widgets where the inner structure is noise.

Two rules, two attributes. That's the whole authoring surface you ever have to learn.

## Clone mode: snapshot the final paint, replay the pixels

Clone is the default, and it's the breakthrough. Most skeleton libraries get into trouble because they try to reason about the CSS cascade. They look at class names. They look at inline styles. They make assumptions about border radius from a `rounded-*` prefix. They guess.

Clone mode stops guessing. It mounts the slot off-screen in a `visibility: hidden` capture host, lets the browser do its full layout and style resolution, and then reads the **final computed result** for every element via `getComputedStyle()`. Whatever your styling system is — Tailwind utilities, scoped styles with hashed class names, CSS-in-JS at runtime, DaisyUI semantic tokens, inline `style` attributes set by a parent — by the time `getComputedStyle()` runs, all of it has collapsed into one canonical answer per property. The engine snapshots that answer and replays it.

The captured surface is comprehensive. Per-edge borders (so a card with a different `border-bottom` reads correctly). Per-corner radii (so an asymmetric pill shape doesn't degrade to a generic rounded rect). Background colour and background image. Box-shadow. Opacity. Filter. Transform. Typography. Mix-blend-mode. Each captured node carries its own frozen inline-style payload — the render loop allocates nothing per node, it just reads what's there.

Text is the part that's easy to get wrong, and the part `a-skeleton` gets right. Instead of guessing wrap points ("assume text wraps every N characters, assume the last line is 70% width"), the engine uses `Range.getClientRects()` to capture the exact rendered rectangle of every text line — left, top, width, height. A three-line centred heading on desktop becomes a two-line centred heading on mobile, and the captured rects shrink to match. RTL last-line positions, justified text, manual line breaks — all of them replay 1:1 because they were measured, not heuristic'd.

The wrapper API for all of this is one prop:

```vue
<ASkeleton :loading="loading">
  <SomeRichComponent />
</ASkeleton>
```

If you want to roll your own capture / replay flow, the underlying function is a public export:

```ts
import { captureSnapshot, type CaptureSnapshot } from '@alikhalilll/a-skeleton';

const snap: CaptureSnapshot = captureSnapshot(myRootEl, {
  maxDepth: 12,
  maxNodes: 800,
  minSize: 4,
});
```

`maxDepth`, `maxNodes`, and `minSize` are the budgets — they're the reason a 5,000-row table doesn't lock up the main thread. The walk bails when it hits the cap, sets `truncated: true`, and the wrapper logs a one-time `console.warn` per `cacheKey` so you notice during development instead of in production. `minSize` drops anything smaller than four CSS pixels per axis, which kills off hairlines and spacer dots that would otherwise show up as confetti in the skeleton.

The trade-off clone mode pays is that it's client-side only. You need a real DOM, `getComputedStyle()`, and a browser to read the final paint. On the server, the slot's real markup renders normally; the snapshot + replay only kick in on hydration. If you need a server-rendered placeholder before hydration finishes, that's what mirror mode is for.

## Mirror mode: walk the vnodes, ship to the server

Mirror swaps the engine. Instead of mounting the slot and reading the DOM, it walks the vnode tree at render time. No `window` access. Hydration-clean. Server-renderable.

```vue
<ASkeleton mode="mirror" :loading="loading">
  <SomeRichComponent />
</ASkeleton>
```

The walker preserves every element's tag and class. Text-bearing leaves become `<span class="a-skel-text-content">` — transparent text on a skeleton background, with `box-decoration-break: clone` so the shimmer wraps the exact rendered text width per line. Atomic and interactive tags (`<img>`, `<button>`, `<svg>`) become `<div class="a-skel-block">` sized from their class-derived dimensions.

Mirror's win is SSR. Its trade-off is fidelity. Without `getComputedStyle()`, the walker can only see what's authored — the static class names and inline styles. If your component's identity comes from a hashed CSS-in-JS rule or a scoped style block, the mirror won't pick it up the way clone does. For most layouts, the static class is enough, and the SSR-safety is worth more than the last 5% of pixel match. For visually intricate components, clone is the right call.

Both modes share the same animation pipeline, the same cache, the same a11y baseline. Switching between them is a single prop.

## Structural mode: trees in normal flow, persisted between sessions

There's a third strategy that I reach for when the wrapper isn't my unit of orchestration — when I want a captured shape to survive across instances, persist between sessions, or reflow with its parent on viewport resize instead of being pinned to absolute coordinates. That's `useSkeleton()` + `<ASkeletonLayer>`.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSkeleton } from '@alikhalilll/a-skeleton';

const props = defineProps<{ userId: string }>();
const user = ref(null);
const loading = computed(() => user.value === null);
const containerRef = ref<HTMLElement | null>(null);

const { shape, clear } = useSkeleton({
  cacheKey: `user-card:${props.userId}`,
  target: () => (loading.value ? null : containerRef.value),
  persist: true,
});

fetchUser(props.userId).then((u) => (user.value = u));
</script>

<template>
  <div ref="containerRef">
    <ASkeletonLayer v-if="loading && shape" :shape="shape" />
    <ColdStartFallback v-else-if="loading" />
    <UserCard v-else :data="user" />
  </div>
</template>
```

The shape is captured by `walkStructural()` — a tree walker that preserves container tags, their original classes, and the resolved layout CSS (`display`, `flex-*`, `gap`, `padding`, `grid-*`, `box-sizing`). Leaves carry inline width/height plus the visual signals (background, border, radius). When `<ASkeletonLayer>` replays the tree, it does so in **normal flow** — the captured `<div class="flex flex-col gap-4 p-4">` is rendered as a real flex container, and the shimmer blocks sit inside it as flex children. Resize the viewport and the layout reflows; the skeleton doesn't lag behind the way an absolute-positioned clone replay would.

Given this real markup:

```html
<div class="flex flex-col gap-4 p-4">
  <h3>…</h3>
  <p>…</p>
  <button>…</button>
</div>
```

The layer replays as:

```html
<div
  class="flex flex-col gap-4 p-4"
  style="display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box"
>
  <div class="a-skel" style="width: 200px; height: 24px; …" />
  <div class="a-skel" style="width: 280px; height: 16px; …" />
  <div class="a-skel" style="width: 120px; height: 36px; …" />
</div>
```

The original class is preserved so utility-first CSS still applies; the resolved layout CSS is inlined as a fallback so the skeleton looks correct even when the stylesheet isn't loaded at the mount point — which matters if you're rendering the same captured shape into a different CSS context, like an email-style preview window or a server-rendered shell that doesn't pull Tailwind.

The other thing structural mode gives you is persistence. `persist: true` mirrors the captured shape into `localStorage` under the `a-skeleton:s:` prefix. Cold start on a return visit reads the cached shape and replays the skeleton on first paint — no flash of "generic shimmer" while the real component mounts and measures itself. The cache is schema-versioned (`v: 3` for structural, `v: 2` for the legacy flat shape), so mismatched versions auto-purge on read. You can't replay yesterday's geometry through today's renderer if the data shape doesn't match.

The three strategies pick different default behaviours from the same primitives. Clone replays absolutely-positioned pixels. Mirror replays vnodes in the original tree. Structural replays containers in normal flow. One cache module, one theming surface, one a11y baseline — three engines.

## The capture → cache → replay pipeline

The architectural story is the same across all three modes, even though the implementations diverge. Here's how a single loading cycle plays out, end to end.

**First paint, cache miss.** The wrapper mounts. There's no cached shape yet. In clone and mirror mode, the engine walks the slot's structure — vnodes for mirror, the off-screen DOM mount for clone — and produces a placeholder that mirrors the slot's tag structure. Containers preserve their semantic tags and layout CSS. Atomic leaves and text-bearing elements become shimmer placeholders. The user sees a structural skeleton that matches the real component's outline instantly, before any data has resolved.

**Data arrives.** The slot's real content renders. A `ResizeObserver` plus a `requestAnimationFrame` schedules a measurement pass. In clone mode, `captureSnapshot()` reads `getComputedStyle()` on every element and per-line text rects via `Range.getClientRects()`, then freezes the result into a `CaptureSnapshot` tree. In structural mode, `walkStructural()` produces a frozen tree where containers carry their layout CSS and leaves carry their dimensions and visual signals. Either way, the captured snapshot is now in memory (and optionally in `localStorage` if `persist: true`).

**Next loading flip.** The user navigates back to the page, or triggers a refetch, or revisits the route on a return session. `loading` flips to `true`. The cached shape replays instantly, with no intermediate "guess the shape" step. In clone mode, `<ASkeletonClone>` renders a tree of absolutely-positioned divs each carrying its pre-frozen inline style — the render loop is allocation-free because every style payload was computed at capture time. In structural mode, `<ASkeletonLayer>` renders the tree in normal flow, with the captured layout CSS driving the flex/grid container behaviour.

The budgets matter at every step. `maxNodes` (default 500–800 depending on the walker) is the cap on tree size. `maxDepth` (default 12–16) is the recursion cap. `minSize` (default 4 CSS pixels) is the per-leaf filter. These aren't arbitrary — they're chosen so a busy dashboard with hundreds of leaf elements still walks in a single rAF and the captured tree fits in a localStorage entry without blowing past the 5 MB quota. When a walk truncates, the wrapper logs a one-time `console.warn` per `cacheKey` so you find out in dev rather than in production.

One layout read up front, then cached values for the rest of the walk. The `getBoundingClientRect()` and `getComputedStyle()` calls happen in a single top-down pass with no intervening writes — no layout thrash, one forced reflow, then the captured snapshot is durable.

## The 15 named primitives

Self-generating doesn't fit every case. If your "loading state" doesn't have a real component to wrap — you're showing the skeleton before any data fetch starts, or the placeholder genuinely has different markup from the loaded view — the auto-capture approach has nothing to read. For those cases the package ships 15 named variants: `<ASkeletonCard>`, `<ASkeletonText>`, `<ASkeletonHeading>`, `<ASkeletonAvatar>`, `<ASkeletonImage>`, `<ASkeletonVideo>`, `<ASkeletonButton>`, `<ASkeletonInput>`, `<ASkeletonChip>`, `<ASkeletonListItem>`, `<ASkeletonTable>`, `<ASkeletonChart>`, `<ASkeletonForm>`, `<ASkeletonArticle>`, `<ASkeletonDivider>`.

They're not a replacement for the auto-capture path — they're an exit ramp. Same animation pipeline, same theming tokens, same a11y baseline. Hand-authored when you need them, otherwise let the wrapper do the work.

There's also `<ASkeletonBlock>` for the case where none of the variants fit and you want to compose your own:

```vue
<div v-if="loading" class="flex items-start gap-4 p-4">
  <ASkeletonBlock type="circle" :w="64" :h="64" />
  <div class="flex-1 space-y-2">
    <ASkeletonBlock type="text" :w="160" :h="18" />
    <ASkeletonBlock type="text" :w="100" :h="12" />
    <ASkeletonBlock type="text" :lines="3" :h="14" class="!mt-3" />
  </div>
</div>
<UserCard v-else :data="user" />
```

`<ASkeletonBlock>` is flow-friendly — it composes with flex, grid, stack layouts. The `lines` prop on `type="text"` stacks N bars with the last at 70% width, which is the heuristic that's correct enough most of the time when you don't have a real component to measure.

## Animations and theming, as strategies

Four animation modes ship: `shimmer` (a gradient sweep on a `::after` pseudo-element, contained per block with `overflow: hidden`), `pulse` (opacity cycling from 1 to `--ak-skel-pulse-min` and back), `wave` (a sliding gradient via `background-position`), and `none` (static blocks). Each is a strategy, not a branch — you pass `animation="pulse"` and the right CSS class engages. No `if (animation === 'pulse')` chain in the component.

`prefers-reduced-motion: reduce` disables every animation automatically. The shimmer pseudo-element drops to a static low-opacity overlay; the pulse stops cycling. No component code involved — it's a media query in the stylesheet.

Theming is CSS variables. The tokens are scoped under `--ak-skel-*` (with backward-compat aliases under `--ak-skeleton-*` for v1 consumers):

| Token                 | Used for                                          |
| --------------------- | ------------------------------------------------- |
| `--ak-skel-base`      | Block fill                                        |
| `--ak-skel-highlight` | Shimmer / wave sweep colour                       |
| `--ak-skel-radius`    | Default block border radius                       |
| `--ak-skel-duration`  | Animation cycle length                            |
| `--ak-skel-pulse-min` | Opacity at the trough of the pulse cycle          |
| `--ak-skel-ring`      | Subtle 1-px inset ring colour                     |
| `--ak-skel-icon`      | Placeholder icon colour (image / video variants)  |

Override them on `:root`, on a wrapper class for multi-tenant themes, or inline on a single instance:

```css
.tenant-acme {
  --ak-skel-base: hsl(220 30% 18%);
  --ak-skel-highlight: hsl(220 60% 60% / 0.35);
  --ak-skel-radius: 0.5rem;
  --ak-skel-duration: 2s;
}
```

Dark mode is automatic via `:where(.dark)` selectors that retint the tokens — Tailwind's `.dark` class, shadcn's, `nuxt-color-mode`'s, anything that lands a `.dark` ancestor — plus a `@media (prefers-color-scheme: dark)` fallback for the case where no explicit class is on the tree.

The point of doing it this way is that no consumer should ever have to override an internal class. Every visual decision is a token; tokens are inheritable through the cascade; per-instance overrides are inline styles. The component owns the structure and the animation; you own the look.

## A11y you don't have to configure

The defaults are the ones you'd want anyway. Every wrapper and variant root carries `role="status"` while loading, `aria-busy="true"` mirroring the loading state, and `aria-live="polite"` so screen readers announce the loading state without interrupting the user. A visually-hidden `<span class="a-skel-sr-only">Loading…</span>` ships with every variant so the announcement has text to read.

Every emitted shimmer surface carries `aria-hidden="true"` — the placeholder is decorative; the wrapper is what gets announced. Mirror-mode skeletons disable `user-select` and `pointer-events` on the slot tree so the placeholder can't be interacted with mid-load. `prefers-reduced-motion` strips animation.

None of this is configurable. None of it should be. The defaults are the right answer; if you need them off, you're either testing something specific (in which case `animation="none"` is the lever) or doing something a11y-wise that I don't want to make easy.

## What clone mode taught me

The thing I'd carry into the next problem isn't the API — it's the insight that powers clone mode. You can stop reasoning about the cascade. You can stop trying to predict what `border-radius: 0.75rem` mixed with `rounded-2xl` mixed with a scoped style override actually produces. Mount the thing. Let the browser collapse all the inputs. Read the final answer. Replay the final answer.

That principle applies anywhere you have a copy-of-this-element problem. Print previews. Drag previews. Component galleries that render the same widget under five themes. The "look at what's actually on the screen, not at the rules that produced it" approach scales further than people give it credit for — every CSS pipeline, every variable, every cascade priority, every animation frame ends up resolved to one number per property per element, and that number is what `getComputedStyle()` will tell you if you ask.

The other thing that earned its keep is the authoring contract. Tags unconditional, content via interpolation. Once you internalise that, every component you build is automatically skeleton-ready — no extra template, no parallel state, no maintenance overhead. The library reads your real component; you keep writing it the way you already wanted to.

Two ideas, one package. The repo is MIT-licensed and the README has the long-form reference for every prop and slot if you want to dig further. If you spot something that could be sharper, open an issue — I'd genuinely rather be corrected than comfortable.
