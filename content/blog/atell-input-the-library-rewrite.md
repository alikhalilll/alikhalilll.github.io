---
title: ATellInput, the library cut — what changed in the rewrite
description: Turning an in-app phone input into a published Vue component forced specific changes — detection-first UX, an ISO2 + dial-number split, a responsive popover/drawer picker, and slots for everything.
date: 2026-05-21
updatedAt: 2026-05-21
keywords:
  - Vue 3
  - component library
  - phone input
  - libphonenumber-js
  - country detection
  - responsive popover
  - vaul-vue
  - defineModel
  - slots
  - TypeScript
---

`ATellInput` started its life inside one app: a Saudi/Egypt-leaning fallback, an internal RestCountries fetch, validation surfaced via v-model only, a dropdown that was always on screen. That version solved correctness — cursor jumps, validation reasons, bidi. It got most things right for one consumer.

This post is what happened when I tried to publish it.

The component now lives in `@alikhalilll/ui/tell-input`, and a published library has a different job description. You can't bake in your own market. You can't assume the consumer's design system. You can't expect every mount point to wait for a third-party API. You don't get to decide whether the user is on a phone or a laptop. The rewrite kept the original's correctness and added what a library consumer actually needs — and almost every change has a specific bug or limitation in the old version that motivated it.

I've grouped the changes around the seven that earned their place.

## Two models, two shapes: number out, ISO2 inside

The old surface looked clean from a distance:

```typescript
const phoneModelValue = defineModel<string>('phone', { required: true });
const countryModelValue = defineModel<string>('country', { required: true });
```

`country` was a string of dial digits — `"20"` for Egypt, `"44"` for the UK. Easy to serialize, easy to URL-encode, easy to put in a database column.

It also couldn't tell US from Canada.

`+1` is shared by 25+ NANP countries. If a Canadian user picked Canada in the dropdown and the v-model emitted `"1"`, the parent had no way to know which `+1` was meant. Reload the page, hydrate from the URL, you'd get back `"1"` and the picker would show whichever country the dropdown happened to list first. The string-of-dial-digits model was a lossy serialization of a two-piece thing.

The new model splits it:

```typescript
const phone = defineModel<string>('phone', { default: '' });
const country = defineModel<number | null>('country', { default: null });

const selectedIso2 = ref<string>('');
```

`country` is a number now — `20`, `1`, `null` — because dial codes _are_ numbers and `Number` survives URL/DB/JSON round-trips with no string-trimming weirdness. But the component also tracks an internal `selectedIso2` that the picker owns. The two stay in sync via a pair of watchers — one outward, one inward — and the inward one has a small but important guard:

```typescript
watch(
  country,
  (next) => {
    if (next == null) {
      if (selectedIso2.value) selectedIso2.value = '';
      return;
    }
    if (dialNumberFor(selectedIso2.value) === next) return;
    const iso2 = resolveCountryIdentifier(String(next));
    if (iso2) selectedIso2.value = iso2;
  },
  { immediate: true }
);
```

The `if (dialNumberFor(selectedIso2.value) === next) return;` line is the one I want to call out. When the parent writes `country = 1` back to the model and the picker already has Canada selected, the watch fires — but the dial code already matches, so the watch returns without touching `selectedIso2`. Without that guard, the watcher would resolve `"1"` to its alphabetically-first NANP country and silently flip Canada to whatever that is. The guard preserves the richer state.

The outward watch is `flush: 'sync'` so a separate `autoSettingCountry` flag stays consistent — when the matcher auto-picks a country from typed input, we don't want it counted as a "manual pick" that would lock out further auto-detection.

Two halves of the country, two distinct models, one source of truth for each.

## Detection-first: the picker is hidden by default

The old component always rendered the dropdown — flag on the left, input on the right. The new component defaults to the input alone. The dropdown slides in only when the user types something the matcher recognises:

```vue
<Transition
  enter-active-class="transition-all duration-200 ease-out overflow-hidden"
  leave-active-class="transition-all duration-150 ease-in overflow-hidden"
  enter-from-class="opacity-0 -translate-x-1 max-w-0"
  leave-to-class="opacity-0 -translate-x-1 max-w-0"
  enter-to-class="max-w-[12rem]"
  leave-from-class="max-w-[12rem]"
>
  <ACountrySelect v-if="!props.detectFromInput || selectedIso2" ... />
</Transition>
```

`max-w` collapses to zero when nothing is selected, animates open on the first successful match. `detectFromInput="false"` brings the always-visible picker back for callers who want the legacy shape.

The behaviour is opinionated. Most users in most countries _never_ type a `+` prefix. They type the number they would type into their own phone — `01066105963` in Cairo, `07911 123456` in Manchester. The dropdown they "have to interact with" in every other phone input is, for those users, a step they don't need. Hide it. Detect what they're doing. Show it only when the detection lands.

The "detect what they're doing" part is the only non-trivial piece. It runs through three tiers in `matchLeadingDialCode`:

```typescript
function matchLeadingDialCode(digits: string): DialMatch | null {
  if (!digits) return null;

  // Tier 1: international parse — disambiguates NANP and strips the calling code.
  try {
    const parsed = parsePhoneNumberFromString(`+${digits}`);
    if (parsed?.country && parsed.countryCallingCode) {
      const parsedCountry = getCountryByValue(parsed.country);
      if (parsedCountry) {
        return { country: parsedCountry, nationalNumber: String(parsed.nationalNumber ?? '') };
      }
    }
  } catch {
    /* libphonenumber throws on partial input — fall through */
  }

  // Tier 2: national-format parse using the silently-inferred country as a hint.
  const hint = inferredCountry.value;
  if (hint && digits.length >= 4) {
    try {
      const parsed = parsePhoneNumberFromString(digits, hint as CountryCode);
      if (parsed?.isValid()) {
        const matched = getCountryByValue(parsed.country || hint);
        if (matched) {
          return { country: matched, nationalNumber: String(parsed.nationalNumber ?? '') };
        }
      }
    } catch {
      /* fall through */
    }
  }

  // Tier 3: longest-prefix match over our own dial-digits index.
  for (let len = Math.min(3, digits.length); len >= 1; len--) {
    const prefix = digits.slice(0, len);
    const group = getCountriesByDial(prefix);
    if (!group.length) continue;
    const nationalNumber = digits.slice(prefix.length);
    if (group.length === 1) return { country: group[0], nationalNumber };
    // ambiguity: prefer current selection, then recents, then first
    // (see "Recents as the tiebreaker" below)
    return { country: group[0], nationalNumber };
  }
  return null;
}
```

The tiers exist because each handles a class of input the other tiers can't.

Tier 1 takes whatever the user typed, prepends `+`, and asks libphonenumber to parse it as an international number. If the user typed `447911123456`, this matches the UK. If they typed `1416...`, it matches Canada specifically (not generic NANP), because libphonenumber has area-code rules baked in. The catch block exists because libphonenumber throws on partial input — `447` isn't a complete number, parsing it raises, we fall through.

Tier 2 is the path for users who type the number they actually use locally. `01066105963` doesn't start with a dial code, so Tier 1 can't help. But if we _silently_ know the user is probably in Egypt (from IP or timezone — more on that next), we can pass `"EG"` as a parsing hint and libphonenumber will recognise `01066105963` as a valid Egyptian mobile number, strip the leading `0` (Egypt's national prefix), and hand back the canonical national significant number `1066105963`. The `digits.length >= 4` guard prevents the parser from treating two-digit area-code starts as full numbers.

Tier 3 is the fallback for "you typed `44` and nothing else." Neither libphonenumber pass can match — the input is too short. But our own dial-digits index can: `byDialDigits.get('44')` returns the UK group, length 1, done. The bucketed-`Map<string, CountryOption[]>` shape from the old version earns its keep here.

Three tiers feels like a lot. It's the minimum, because each tier handles inputs the other two reject.

The handler that calls into it stays small:

```typescript
const detectAndApply = useDebounceFn(
  () => {
    if (!props.detectFromInput) return;
    if (userPickedCountry.value || selectedIso2.value) return;
    const current = phone.value;
    if (!current) return;
    const match = matchLeadingDialCode(current);
    if (!match) return;
    autoSettingCountry.value = true;
    selectedIso2.value = match.country.value;
    phone.value = match.nationalNumber;
  },
  computed(() => Math.max(0, props.detectDebounceMs))
);
```

`useDebounceFn` reads `phone.value` at the time the timer fires, not at schedule time, so a burst of keystrokes collapses into one parse. `userPickedCountry.value` stops the auto-detector from clobbering a manual pick — once the user has used the dropdown, the matcher steps aside. And clearing the input is _not_ debounced; it reverts the picker to hidden immediately:

```typescript
if (!cleaned) {
  autoSettingCountry.value = true;
  selectedIso2.value = '';
  phone.value = '';
  userPickedCountry.value = false;
  return;
}
```

Debouncing the clear would mean the dropdown lingers for 150ms after the input is empty, which looks wrong every time.

## The environment-detection chain (and why it's pluggable)

Tier 2 above depends on `inferredCountry.value` — the component's best guess at where the user is, set silently before they type anything. The old version's "best guess" was a hardcoded fallback to Saudi Arabia or Egypt, because those were the markets the in-app version targeted. A library can't make that assumption.

The new chain is `detectCountry()`:

```typescript
export async function detectCountry(opts: DetectCountryOptions = {}): Promise<string> {
  const {
    strategy = 'auto',
    ipEndpoint = 'https://ipapi.co/json/',
    defaultCountry = 'US',
    timeoutMs = 2000,
    cache = true,
  } = opts;

  if (cache) {
    const cached = readCache();
    if (cached) return cached;
  }

  if (strategy === 'none') {
    return defaultCountry.toUpperCase();
  }

  if (strategy === 'auto') {
    const ipResult = await tryIp(ipEndpoint, timeoutMs);
    if (ipResult) {
      if (cache) writeCache(ipResult);
      return ipResult;
    }
  }

  const localResult = tryTimezone() ?? tryLocale();
  const final = (localResult ?? defaultCountry).toUpperCase();
  if (cache) writeCache(final);
  return final;
}
```

Four signals, evaluated in cost order — cheap-and-cached first, expensive-and-networked last.

1. `sessionStorage` cache. The user already resolved to a country during this session; we don't redo the work.
2. IP geolocation via `ipapi.co` (configurable). The most accurate signal but it costs a network call and a tiny bit of privacy. `strategy: 'locale'` skips this step for consumers who don't want the request.
3. Timezone, via `Intl.DateTimeFormat().resolvedOptions().timeZone`, looked up against a hand-rolled `Africa/Cairo → EG`, `Asia/Riyadh → SA`, `Europe/London → GB` table. The map covers the most-populated zones; it's honest about not covering every one. A miss falls through.
4. `navigator.language`, which gives `en-EG` or `ar-SA` and similar — the region suffix is the country. Less reliable (users move; browser locales don't), but free.
5. The caller-supplied default. `defaultCountry: 'US'` is the library default; consumers can pick their own.

The IP step is the one that needed real care, because the call can hang:

```typescript
async function tryIp(endpoint: string, timeoutMs: number): Promise<string | null> {
  if (!isBrowser() || typeof fetch !== 'function') return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, { signal: controller.signal, credentials: 'omit' });
    if (!res.ok) return null;
    const data = (await res.json()) as { country_code?: string; country?: string };
    const code = (data.country_code ?? data.country ?? '').toString().toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
```

`AbortController` plus a 2-second timer means a slow IP service can't block the detection chain for longer than `timeoutMs`. `credentials: 'omit'` keeps cookies out of the request to whatever third party you've configured. The shape of the response is checked with `/^[A-Z]{2}$/` because some IP APIs return `"GB"`, some return `"United Kingdom"`, some return `null` when they don't know — the regex is the gate.

`detectCountry` lives outside the component on purpose:

```typescript
import { detectCountry } from '@alikhalilll/ui/tell-input';

const country = await detectCountry({ strategy: 'locale' });
```

No Vue dependency, no reactive refs, no `onMounted`. It works in a server middleware that wants to set a cookie, in a CLI that wants to print where the user probably is, in a unit test that wants to control the strategy. The reactive wrapper, `useCountryDetection`, is a thin shell around it for the in-component case. Two surfaces, one implementation.

And the whole chain is pluggable. If you already detect geo server-side and pass it down through SSR, you don't want the component re-running an IP fetch:

```vue
<ATellInput
  v-model:phone="phone"
  v-model:country="country"
  :detector="(opts) => Promise.resolve(serverDetectedCountry.value)"
/>
```

The `detector` prop replaces the built-in chain entirely. The component still runs the rest of the detection logic — sets the inferred country, uses it as a Tier 2 hint, etc. — but the _source_ of the answer becomes whatever you said it was.

## Responsive picker: one component, two presentations

The old country dropdown was a popover at every viewport size. On a phone, that meant a 250-row scrollable list anchored to a 38-pixel-wide trigger button, with a search input that the on-screen keyboard kept occluding. It worked. It worked badly.

The new picker uses the `AResponsivePopover` primitive from the same library, which is a popover on desktop and a vaul-vue drawer on mobile:

```vue
<AResponsivePopover v-model:open="open">
  <AResponsivePopoverTrigger as-child>
    <!-- trigger button -->
  </AResponsivePopoverTrigger>

  <AResponsivePopoverContent
    :popover-class="
      cn(
        'w-[min(20rem,calc(100vw-2rem))] max-h-[min(22rem,var(--reka-popover-content-available-height))]',
        props.popoverClass
      )
    "
    :drawer-class="cn('max-h-[80vh] pb-4', props.drawerClass)"
  >
    <!-- search + list -->
  </AResponsivePopoverContent>
</AResponsivePopover>
```

Two class props — `popoverClass` and `drawerClass` — get forwarded separately, so consumers can theme each presentation without the other inheriting it. The popover wants `max-h-[min(22rem,var(--reka-popover-content-available-height))]` because reka-ui exposes the available height as a CSS variable; the drawer wants `max-h-[80vh]` because it's a bottom-sheet and "80% of the viewport" is a sensible cap. Forcing one set of classes onto both would be wrong for one of them; allowing the consumer to override either, separately, is exactly the seam a library needs.

The other side benefit is search. In drawer mode, the search input docks at the top of a sheet that takes up most of the screen, and the keyboard pushes it up rather than burying it. The same code, the same component, the right shape for the device. Not a media-query inside the consumer's CSS — a primitive that knows the difference.

## Slots for everything (fourteen of them)

The old version was monolithic. Restyling the error message meant patching the component. Changing the chevron icon meant patching the component. Replacing the country flag with one from your own CDN meant patching the component.

The new version owns the behaviour and lets the consumer own the look:

```typescript
defineSlots<{
  prefix?: () => unknown;
  suffix?: (props: { validationState: 'idle' | 'valid' | 'error'; validation: PhoneValidationResult }) => unknown;
  'valid-icon'?: () => unknown;
  'error-icon'?: (props: { reason: string }) => unknown;
  hint?: (props: { country: string; formatHint: string; example: string | null }) => unknown;
  error?: (props: { message: string; reason: string; validation: PhoneValidationResult }) => unknown;
  trigger?: (props: { selectedCountry: CountryOption | null; open: boolean; sizeClasses: string }) => unknown;
  chevron?: (props: { open: boolean }) => unknown;
  flag?: (props: { country: CountryOption; context: 'trigger' | 'item' }) => unknown;
  item?: (props: { country: CountryOption; selected: boolean; disabled: boolean; select: () => void }) => unknown;
  'group-header'?: (props: { label: string; group: 'suggested' | 'all' }) => unknown;
  search?: (props: { value: string; setValue: (v: string) => void; isSearching: boolean }) => unknown;
  loading?: () => unknown;
  empty?: (props: { query: string }) => unknown;
}>();
```

Fourteen slots, three groups. The visual ones (`prefix`, `suffix`, the two icon slots, `hint`, `error`) decorate the field itself. The picker-trigger ones (`trigger`, `chevron`, `flag`) replace the button users click. The picker-content ones (`search`, `loading`, `empty`, `group-header`, `item`) replace anything inside the popover or drawer.

Almost all of the picker slots forward straight to `ACountrySelect`. The component itself does the routing:

```vue
<template v-if="$slots.trigger" #trigger="slotProps">
  <slot name="trigger" v-bind="slotProps" />
</template>
<template v-if="$slots.chevron" #chevron="slotProps">
  <slot name="chevron" v-bind="slotProps" />
</template>
<!-- ... and so on for each forwarded slot -->
```

The `v-if="$slots.x"` matters — without it, a forwarded `<template #x>` always exists from the parent's perspective, and `ACountrySelect`'s own fallback rendering never gets a chance to run. The guard says "only forward if the consumer actually provided this slot."

A realistic customization:

```vue
<ATellInput v-model:phone="phone" v-model:country="country" show-validation>
  <template #suffix="{ validationState }">
    <Sparkle v-if="validationState === 'valid'" class="size-4 text-amber-400" />
  </template>
  <template #error="{ message, reason }">
    <p class="text-destructive text-xs">
      <code class="bg-muted rounded px-1 py-0.5">{{ reason }}</code> {{ message }}
    </p>
  </template>
  <template #empty="{ query }">
    <div class="px-3 py-6 text-center text-sm">
      Nothing matched "<strong>{{ query }}</strong>".
      <button type="button" class="underline" @click="suggestCountry(query)">
        Suggest a country
      </button>
    </div>
  </template>
</ATellInput>
```

A library component's job is to own _behaviour_ — the parsing, the validation, the detection, the state — and to leave the consumer in charge of what those things look like. Fourteen slots is what that bargain costs, and it's worth it.

The same principle applies to the props that aren't visual:

```typescript
flagUrl?: (iso2: string, width: number) => string;
searcher?: (query: string, country: CountryOption) => boolean;
countries?: CountryOption[];
detector?: (options: DetectCountryOptions) => Promise<string | null | undefined>;
errorMessages?: Record<PhoneValidationReason, string>;
```

`flagUrl` lets you swap flagcdn.com for your own CDN — useful if you have a CSP that won't allow third-party images. `searcher` lets you replace substring-matching with prefix-matching, fuzzy-matching, Arabic-name matching, whatever your users actually want. `countries` lets you ship your own curated list and skip the REST Countries fetch entirely — useful if you've already decided you only serve, say, Gulf countries. `errorMessages` is i18n — pass an Arabic table and the validation reasons render in Arabic.

Every prop has a sensible default. The zero-config call still works.

## The synchronous dial table, and why it's not optional

The first time the component mounts in a fresh tab, the REST Countries fetch hasn't completed. Whatever indices `usePhoneValidation` builds — `byValue`, `byDialDigits` — are empty maps. If the consumer wrote `default-country="20"` in their template, expecting the picker to render with Egypt selected, what they'd get without help is an empty picker. The dial-digits index would return `[]`, the watcher would set `selectedIso2` to `''`, and Egypt wouldn't appear until the network call returned.

So the component bakes a synchronous fallback table:

```typescript
const DIAL_TO_ISO2_FALLBACK: Record<string, string> = {
  '1': 'US',
  '7': 'RU',
  '20': 'EG',
  '27': 'ZA',
  '33': 'FR',
  '44': 'GB',
  '49': 'DE',
  '52': 'MX',
  '55': 'BR',
  '61': 'AU',
  '81': 'JP',
  '86': 'CN',
  '91': 'IN',
  '212': 'MA',
  '966': 'SA',
  '971': 'AE',
  // ... ~50 entries
};
```

And `resolveCountryIdentifier` checks the loaded index first, then this table:

```typescript
function resolveCountryIdentifier(raw: string | undefined | null): string {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  if (/^[A-Za-z]{2}$/.test(v)) return v.toUpperCase();
  const dial = v.replace(/^\+/, '');
  if (!/^\d+$/.test(dial)) return '';
  const match = getCountriesByDial(dial)[0];
  if (match) return match.value;
  return DIAL_TO_ISO2_FALLBACK[dial] ?? '';
}
```

The reverse — going from an ISO2 back to a dial number for the v-model — does the same check:

```typescript
function dialNumberFor(iso2: string): number | null {
  if (!iso2) return null;
  const fromIndex = getCountryByValue(iso2)?.raw_data?.dial_digits;
  const digits = fromIndex ?? Object.entries(DIAL_TO_ISO2_FALLBACK).find(([, v]) => v === iso2)?.[0];
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}
```

The table is a known compromise. Fifty entries can't cover every dial code, and the choice of which fifty is opinionated — the most-populated countries plus the ones I personally need. A consumer who passes `default-country="678"` (Vanuatu) at mount with no cached country data will get nothing back from this lookup. A few seconds later, when the network call returns, the picker will resolve correctly. The fallback exists to make the 95% case work without a flicker; the long tail still ends up correct.

In-app, you can wait for the fetch. As a library, you can't make every consumer's mount block on a third-party API, and you can't ship 80KB of country data eagerly either. The sync table is the third path.

## Recents as the tiebreaker

The longest-prefix Tier 3 match isn't always unambiguous. `1` matches the entire NANP block — 25-plus countries. Alphabetical-first would mean "American Samoa" or whichever country sorts earliest, every time. That's not a useful default for anyone.

So Tier 3 reads from `localStorage`:

```typescript
const recents = readRecents();
const recentHit = recents
  .map((iso2) => group.find((c) => c.value === iso2))
  .find((c): c is CountryOption => Boolean(c));
if (recentHit) return { country: recentHit, nationalNumber };
return { country: group[0], nationalNumber };
```

The picker writes to `ali_ui_country_recents_v1` whenever the user explicitly picks a country, and the matcher reads it back during ambiguity. If you live in Canada and you've used the input before, the first `+1` you type will resolve to Canada. If you've never used it, you get the alphabetical fallback — still wrong, but only once.

A small touch, but it's the kind of thing that turns "this technically works" into "this feels like it was built by someone who's used it."

## What the library rewrite was really about

The original was about correctness: cursor jumps, validation reasons, bidi handling, the seven specific failure modes a phone input has to distinguish. None of that went away. All of it is still in this version — the `dropLeadingZeros` setter, the seven `PhoneValidationReason` enum values, the LTR-wrapper-over-RTL-input bidi pattern. Those things weren't wrong; they were the foundation.

What the library rewrite added was everything that's specific to _not being one app_. An ISO2/dial split that survives ambiguous dial codes. An environment-detection chain that's both pluggable and offline-safe. A picker that's a popover on a laptop and a drawer on a phone, with separate class hooks for each. Fourteen slots so the consumer's design system isn't fighting the component's. A synchronous dial table because library consumers can't wait for the network. Recents as a tiebreaker because alphabetical-first is what "lazy" looks like.

The line count roughly doubled — the original was 160 lines of component plus 540 of composable; the new one is several hundred lines across two components and two composables. The surface area more than doubled. And the no-config call still fits in three lines:

```vue
<ATellInput v-model:phone="phone" v-model:country="country" show-validation />
```

Every new prop has a default that mirrors what the in-app version did by accident. Consumers who want "just a phone input" get one. Consumers who want "phone input but with our flags, our country list, our search predicate, our error messages" get all the hooks they need.

The lesson I'd carry into the next one: making a component publishable is mostly about identifying the opinions you baked in for yourself and turning them into seams. Every `restcountries.com` hardcoded, every Saudi-and-Egypt fallback, every always-visible dropdown — those weren't wrong _for the app_, but they were the things that wouldn't survive the next consumer. Find them, name them, replace each one with a default plus an override. The default keeps your old consumer happy; the override lets the new one in.
