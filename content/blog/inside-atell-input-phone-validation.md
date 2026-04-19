---
title: Inside ATellInput — a multi-country phone input in Vue
description: A Vue phone input backed by REST Countries and libphonenumber-js — three-tier data loading, bucketed indexes, dynamic placeholders, seven validation reasons.
date: 2026-04-19
updatedAt: 2026-04-19
keywords:
  - phone input
  - Vue 3
  - libphonenumber-js
  - E.164
  - RTL
  - Arabic
  - country code
  - form validation
  - defineModel
  - defineExpose
  - TypeScript
  - Nuxt
---

Phone inputs are the field I've rewritten most often in my career. Not because the concept is hard — it isn't — but because every version has eventually produced a bug I didn't see coming. A country with a dial code I'd never heard of. A user who pasted `+20 010 6610 5963` and got rejected because the `+20` duplicated the country code that was already selected. A number that validated client-side and failed at the SMS gateway.

`ATellInput` is where that cycle ended, for now. Two Vue components — a country dropdown and a tel input — sitting on top of a 540-line composable that owns the data, the search, the normalization, and the validation. This post is the pieces that make the component stop being a source of new bugs. I've grouped them around the parts of the system that would otherwise each need their own surprise: data, search, placeholders, input handling, validation, and the small details at the edges.

## The API surface

The surface is plain:

```vue
<ATellInput
  v-model:phone="form.phone"
  v-model:country="form.country"
  :allowed-dial-codes="['966', '20']"
  :show-validation="true"
  size="lg"
/>
```

Two separate v-models, not an aggregate. Every form library I've used has eventually had to re-split an aggregated `{ phone, country }` into its parts, and the splitter is where the bug hides. Keeping the two halves as independent models avoids that entirely.

```typescript
const phoneModelValue = defineModel<string>('phone', { required: true });
const countryModelValue = defineModel<string>('country', { required: true });
```

The country model holds _dial digits_ — `"20"`, not `"EG"` and not `"+20"`. Dial digits survive URL encoding, localStorage, and database columns without transformation, and they're what `libphonenumber-js` internally uses as the calling-code key. If the consumer wants `"EG"`, they can read `validation.country.iso2` off the exposed validation object.

## Three tiers of country data

The cheapest thing would be to bundle a JSON of every country — names, dial codes, flags — as a static file. That's about 80KB gzipped, and every app that uses this component ships it whether the user ever opens the dropdown or not. I went the other way.

```typescript
const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags');
```

`restcountries.com` is a free public API. The `?fields=` parameter is where the savings are — without it, the response is ~1.5MB of languages, currencies, bordering-country lists, and dozens of other fields a phone input has no business touching. With it, the payload drops to ~80KB. The first time a user opens the dropdown we fetch; after that, localStorage.

Three loading paths, in order:

```typescript
async function getCountries(options?: { force?: boolean }) {
  if (!force && countries.value.length) return countries.value;

  // 1. localStorage
  if (!force && process.client) {
    try {
      const cached = localStorage.getItem('ui_phone_countries_v1');
      if (cached) {
        const parsed = JSON.parse(cached) as CountryOption[];
        if (Array.isArray(parsed) && parsed.length) {
          upsertCountries(parsed);
          return countries.value;
        }
      }
    } catch { /* fall through */ }
  }

  // 2. remote
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags');
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = (await res.json()) as RestCountry[];
    const normalized = normalizeRestCountries(data);
    upsertCountries(normalized.length ? normalized : FALLBACK);
    if (process.client) {
      try { localStorage.setItem('ui_phone_countries_v1', JSON.stringify(countries.value)); }
      catch { /* quota, ignore */ }
    }
    return countries.value;
  } catch {
    // 3. hardcoded
    upsertCountries(FALLBACK);
    return countries.value;
  }
}
```

Four empty-catch blocks look suspicious, and if I'd written them for any other reason I'd push back on them in code review. Here each one is paired with a named degradation that's better than throwing — localStorage throwing on Safari private browsing, `JSON.parse` throwing on a corrupted cache, `fetch` throwing on a network failure, `setItem` throwing on quota. Every failure has a fallback one layer down. The user never sees any of it because, from their perspective, nothing went wrong.

The cached shape is already normalized — `CountryOption[]`, not the raw `RestCountry[]`. Normalization is the slow part (the parsing isn't), so caching the post-normalization output means subsequent loads skip it. The key has a `_v1` suffix. If I ever change the shape of `CountryOption` I bump it to `_v2` and every user's stale cache dies on the next visit — without a migration function, without a "if this field exists but that one doesn't" branch. Versioned cache keys are the cheapest migration strategy there is.

The hardcoded fallback is opinionated: Saudi Arabia and Egypt, because those are the two markets this app targets. If restcountries is down _and_ the user has no cache, the dropdown works for 95% of actual users. The remaining 5% get a degraded but working experience instead of a blank dropdown and a broken form. If you fork the component for a different market, you change the fallback. That's the right shape of opinionated — explicit, in one place, obvious to change.

Two smaller pieces are worth mentioning in passing. The normalizer picks the "better" record when restcountries returns duplicates by ISO2 (which it occasionally does for split territories), scoring each entry by whether it has a flag and a dial code and keeping the higher-scoring one. And `buildDialCode` handles the weird shape of `idd.root + idd.suffixes[0]` — Barbados is `+1246`, Egypt is `+20`, and "just use the root" gets every `+1` country wrong.

## Dual indexes, and the bucketed dial map

Once countries are loaded, they live three ways at once:

```typescript
const countries = ref<CountryOption[]>([]);
const byValue = ref<Map<string, CountryOption>>(new Map());
const byDialDigits = ref<Map<string, CountryOption[]>>(new Map());
```

The array is for rendering, sorted alphabetically by country name via `localeCompare` so Åland Islands and Ålesund land where they should. `byValue` is an O(1) ISO2 lookup — `byValue.get('EG')` for Egypt. `byDialDigits` is the one I want to isolate: it's a bucketed list, `Map<string, CountryOption[]>`, not `Map<string, CountryOption>`.

Bucketing matters because dial codes are not unique. `+1` is shared by the US, Canada, and 20 Caribbean countries. A flat `Map<string, T>` silently keeps the last one inserted and loses the rest. The day a Canadian user opens my phone input and the only `+1` option is the US, I'd never know — they'd just quietly pick one and move on.

Building the indexes is a one-pass loop at ingest, done once when countries load:

```typescript
function rebuildIndexes(list: CountryOption[]) {
  const valueMap = new Map<string, CountryOption>();
  const dialMap = new Map<string, CountryOption[]>();
  for (const item of list) {
    valueMap.set(item.value, item);
    const dial = item.raw_data.dial_digits;
    if (dial) {
      const bucket = dialMap.get(dial) ?? [];
      bucket.push(item);
      dialMap.set(dial, bucket);
    }
  }
  byValue.value = valueMap;
  byDialDigits.value = dialMap;
}
```

Search is the other half of the "finding" story, and it's where most implementations I've reviewed do too much work per keystroke. Common anti-pattern:

```typescript
countries.value.filter((c) =>
  c.raw_data.name.toLowerCase().includes(query.toLowerCase())
);
```

`.toLowerCase()` runs on 250 strings per keystroke. For a 250-country list it's fine. For a system with 50,000 rows, the pattern generalizes badly. I default to precomputing:

```typescript
function normalizeSearchKey(input: string) {
  return String(input ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^\da-z+ ]/g, '');
}

// At ingest, per country:
const search_key = normalizeSearchKey(`${name} ${dial} ${iso2} ${dialDigits}`);
```

Each country carries a precomputed `search_key` that combines its name, dial code, ISO2, and dial digits, normalized: lowercased, whitespace-collapsed, non-alphanumeric stripped. At query time, the user's keyword goes through the _same_ normalizer, and search is a straight substring match with an early break once we've got 50 hits:

```typescript
function searchCountries(keyword: string, limit = 50) {
  const q = normalizeSearchKey(keyword);
  if (!q) return countries.value.slice(0, limit);

  const res: CountryOption[] = [];
  for (const item of countries.value) {
    if (item.search_key.includes(q)) {
      res.push(item);
      if (res.length >= limit) break;
    }
  }
  return res;
}
```

Symmetrical normalization on both sides is the invariant that makes the whole thing work. Without it, a trailing space or a `!` in the input silently wipes out all matches. The early break trims `"a"` queries from "iterate all 250" to "stop at 50," which is the difference between a fast dropdown and a janky one on older devices.

There's one place in the country-select component where this rigor breaks down. Resolving the currently-selected country object uses `.find()` rather than the dial-digits index:

```typescript
const selectedCountryObject = computed(
  () => countries.value.find((c) => c.raw_data.dial_digits === selectedCountry.value) ?? null
);
```

`.find()` is O(n) when `byDialDigits.get()` would be O(1). The reason is historical — I wrote this part before I built the index, and once the index existed I didn't go back. It's ~250 items; the dropdown is already O(n) to render; the extra lookup isn't the performance story. I'm leaving it in as an honest reminder that consistent discipline is aspirational, not permanent.

## Placeholders from `libphonenumber-js` example numbers

Most phone inputs I've used do one of two things with placeholders: hardcode a made-up number like `"+1 (555) 123-4567"` that never changes, or show nothing. Both give up some information the user could use.

`ATellInput` uses `libphonenumber-js`'s bundled example database:

```typescript
import { getExampleNumber, isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';
const EX = examples as unknown as Examples;

const example = getExampleNumber(iso2 as CountryCode, EX);
const exampleNational = example?.formatNational?.() ?? '';  // "010 6610 5963"
const exampleE164 = example?.format?.('E.164') ?? '';        // "+201066105963"
```

For any ISO2, `getExampleNumber` returns a real, valid, currently-issued mobile number for that country. The national format becomes the placeholder; the E.164 format is used during validation to reconstruct the full number.

The template pulls the placeholder out with a bit of string surgery:

```typescript
const internalHelperText = computed(() => {
  const rq = validation.value.required;
  const example = rq?.example_e164;
  const dial = rq?.dial_code;
  return (example && dial ? example.split(dial)?.[1] : '') || props.placeholder || 'رقم الجوال';
});
```

`"+201066105963".split("+20")[1]` gives `"1066105963"` — the example minus the country code, which is already displayed in the dropdown next to the input. When the country changes, the placeholder changes. Not a generic "Enter phone number" — a real Egyptian number if Egypt is selected, a real Saudi number if it's Saudi Arabia.

The length bounds come from the same example, not from a hardcoded table:

```typescript
function inferLengthFromExample(national: string) {
  const d = toDigits(national);
  if (!d) return { min: null, max: null };
  const n = d.length;
  return { min: Math.max(4, n - 2), max: n + 2 };
}
```

The window is example length ± 2, floored at 4. This is deliberately loose because it's a _pre_-check — the real validity test is `libphonenumber-js`'s `isValidPhoneNumber`, which is expensive-ish. The pre-check cheaply rejects "3 digits and stopped" and "15 digits, might be an IMEI," and lets plausible input through to the real validator. The day `libphonenumber-js` updates its examples (which it does every few months), my placeholders and lengths update with it. I don't own a table of digit counts per country; that table doesn't exist in my repo.

## `onInput`: the handler that rewrites the input

The `<input>` element has one of the strangest handlers in the file:

```typescript
function onInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const next = input.value.replace(NON_DIGITS_RE, '');
  if (input.value !== next) input.value = next;
  phoneModelValue.value = next;
}
```

Why write `input.value = next` directly when Vue's v-model would update the DOM on the next tick? Because "next tick" is the problem.

Picture the user typing `+` into a digits-only input. Vue's reactivity sees the new value, strips the `+`, and writes the empty string back to `.value` — but the browser has already placed the cursor after the typed character. You end up with the cursor at position 1 in an empty string, which is nonsense, and the next character the user types gets placed past the end. The input works by accident, because the browser silently clamps the out-of-bounds cursor.

Paste `"123+"` and it's louder. Vue strips the `+`, value becomes `"123"`, cursor was at position 4, browser clamps to position 3. The user's next character lands at the end. Sometimes correct, sometimes not, depending on exactly when the clamp fires relative to the next keystroke.

Writing `input.value = next` synchronously — inside the same event tick, before v-model gets involved — avoids the whole race. The guard (`if (input.value !== next)`) exists so we don't nudge the cursor when nothing changed. This is the detail that never makes it into the "Vue v-model best practices" blog posts. It's also the detail every company I've worked at has hit at least once.

There's a related trick in the setter bridge:

```typescript
const mobileModel = computed<string>({
  get: () => phoneModelValue.value ?? '',
  set: (v) => {
    phoneModelValue.value = dropLeadingZeros(v);
  },
});
```

Egyptian users type `01066105963` — the `0` is a national-dialing prefix, not part of the number. Saudi users do the same. E.164 drops that zero. The setter strips it on assignment, so the stored value is always in a clean E.164-ready form regardless of what the user typed. Some countries keep leading zeros in E.164; `libphonenumber-js`'s validator catches any edge case where this is wrong. For the 200+ countries where it applies, the setter does the transformation for free.

## Seven validation reasons, two passes

The lazy version of phone validation returns `{ valid: boolean; message?: string }`. The honest version — the one consumers can actually build a good UX on — says _why_:

```typescript
export type PhoneValidationReason =
  | 'missing_country'
  | 'country_not_supported'
  | 'phone_has_non_digits'
  | 'too_short'
  | 'too_long'
  | 'invalid_phone'
  | 'parse_failed';
```

Seven specific reasons. Not one "invalid" bucket. The distinctions matter in the UI. "Too short" is a _progress_ signal — the user is still typing, don't yell at them. "Country not supported" is a _setup_ signal — they need to pick a different country. "Invalid phone" with `details.possible: true` is a _hint_ signal — the number could be valid somewhere else, and you might want to suggest "did you mean a different country?"

The full result object is richer than the enum:

```typescript
export type PhoneValidationResult = {
  ok: boolean;
  reason: PhoneValidationReason | null;
  country: { iso2: string; dial_code: string } | null;
  phone: { raw: string | null; digits: string };
  full_phone: string | null;
  required: PhoneRequiredInfo | null;
  details?: Record<string, unknown>;
};
```

Three representations of the phone number live together: `phone.raw` is what the user typed, `phone.digits` is the digits-only sanitized form, `full_phone` is the E.164 string. That's three different representations carried together because three different consumers want different ones — the UI wants `raw` to re-render, the backend wants `full_phone` as E.164, an analytics system might want `digits`.

The validator itself runs two passes:

```typescript
const ok = isValidPhoneNumber(full, iso2 as CountryCode);

if (!ok) {
  const parsed = parsePhoneNumberFromString(full, iso2 as CountryCode);
  return {
    ok: false,
    reason: 'invalid_phone',
    country: { iso2: required.iso2, dial_code: required.dial_code },
    phone: { raw, digits },
    full_phone: parsed?.number ?? null,
    required,
    details: {
      type: parsed?.getType?.() ?? null,
      possible: parsed?.isPossible?.() ?? null,
      country: parsed?.country ?? null,
    },
  };
}
```

First pass is the fast boolean check. If it fails, the second pass runs the full parser to extract structured metadata: the number's _type_ (mobile, landline, toll-free), whether it's _possible_ (right length for some country, even if not this one), and which country it actually parses as. All of that goes into `details`. You don't show it to the user. You might log it to analytics. You might use `details.country` to suggest "you typed a Saudi number but Egypt is selected — switch?"

Two passes look wasteful; in practice the parser is cached internally by libphonenumber-js, and you only pay the second cost on failure. Success is the 95% case.

The argument to `validate()` is deliberately two-shaped:

```typescript
type ValidateArgs =
  | { country: { iso2: string; dial_code?: string } | null | undefined; phone?: undefined }
  | { country: { iso2: string; dial_code?: string } | null | undefined; phone: string | null };
```

`validate({ country })` returns `ok: true` with the `required` metadata — placeholder, format hint, length range. `validate({ country, phone })` runs the full validation. The component uses the same function to ask "what should I show as a placeholder for Egypt?" and to ask "is this Egyptian number valid?"

## Further implementation details

A few things that don't fit into one chapter but cost me real hours before I learned them.

### `defineExpose` over emit

Validation is exposed, not emitted. The parent reads it off a template ref:

```typescript
defineExpose({ validation });
```

```vue
<ATellInput ref="phoneRef" v-model:phone="..." v-model:country="..." />
```

Validation isn't an event; it's a derivative of the v-model. Emitting it on every change creates a second state channel that can drift. Exposing it means consumers pull when they care — on submit, on blur, on a specific UI moment — and the v-model stays the single source of truth.

### Bidi: LTR wrapper, RTL input

This app is bilingual. Arabic pages are `dir="rtl"`; phone numbers read left-to-right in both languages.

```vue
<div :class="wrapperClass" dir="ltr">
  <CountrySelect ... />
  <input v-model="mobileModel" dir="rtl" ... />
</div>
```

The wrapper is LTR so the country dropdown stays on the left. The input is RTL so the Arabic placeholder (`رقم الجوال`) reads correctly when empty. `text-align: left` on the input pins digits to the left edge when the user types. The dial code in the trigger gets an extra `unicode-bidi: bidi-override` so `+966` renders as `+966` and not `966+` in Arabic browsers that occasionally treat the trailing `+` as a weak character. This is a class of bug that only shows up in RTL and only for RTL users, so it's worth writing down.

### `allowedDialCodes`: disable, don't filter

If you restrict the dropdown, the disallowed countries stay visible but greyed out:

```vue
<button
  type="button"
  :disabled="isDisabled(option.raw_data.dial_digits)"
  :aria-disabled="isDisabled(option.raw_data.dial_digits)"
  :class="[isDisabled(option.raw_data.dial_digits) && 'opacity-50 cursor-not-allowed']"
>
```

Greying signals "this exists, we don't accept it here." Filtering would signal "this country doesn't exist," which is wrong. `aria-disabled` mirrors `disabled` so screen readers hear the same message.

### Size variants as lookup tables

Four of them — wrapper, input, trigger, search-input — each typed as `Record<TellInputSize, string>`:

```typescript
const wrapperSizeClasses: Record<TellInputSize, string> = {
  default: 'h-9 rounded-md',
  sm: 'h-8 rounded-md gap-2',
  lg: 'h-10 rounded-lg',
  xl: 'h-14 rounded-lg text-base',
};
```

Adding a size is one line per map, and the `Record<TellInputSize, ...>` type forces the compiler to remind me about every map when I add a value. No "I forgot to update the search-input sizing" bugs. The alternative — a chain of ternaries — scatters the same information across four places and relies on me remembering all four.

### The composable that isn't a singleton

`usePhoneValidation()` gets called twice — once in `ATellInput`, once in `ACountrySelect`. Each call creates fresh refs. That _looks_ like duplicated state, but in practice the first call fetches from localStorage or network, and the second call finds the data already in localStorage and skips the fetch. One network request, two arrays of ~80KB in memory. Hoisting to a singleton would save the memory; in exchange, I'd have global state that complicates SSR hydration and isolated-component testing. For two call-sites the duplication is the cheaper design. If I ever use the composable in five places, I'll revisit.

## The parts I'd take into the next one

Phone inputs share a shape with a lot of other "parser-shaped validator" fields — IBAN, credit card, date parsers, address inputs. If I'm building any of those, the patterns I'd carry across:

- **A three-tier data flow** — remote API, localStorage with a versioned key, hardcoded fallback. Each tier handles a specific failure of the tier above. Silent degradation beats visible breakage.
- **Cache the normalized shape**, not the raw response. Normalization is the slow part. Don't pay it twice.
- **Multiple indexes over one canonical array.** Array for rendering, `Map` for O(1) lookup, `Map<string, T[]>` for cases where identity collisions are real (`+1` countries, surname lookups in large user lists).
- **Precomputed search keys with symmetrical normalization.** Don't lowercase 250 strings per keystroke. Normalize at ingest, normalize at query, compare what's already normal.
- **Discriminated validation reasons.** "Invalid" is a lazy message. The consumer always has better context for the error than the validator does.
- **Expose derived state, don't emit it.** `defineExpose` over a validation event. The v-model stays the source of truth; the parent reads when it cares.
- **Write `input.value` synchronously when the handler sanitizes.** The cursor-jump bug is real; the one-line fix is real.

The component is 160 lines; the composable is 540. That ratio feels right — the UI is thin, the thinking is in the data layer. That's most of what makes a component stop being the thing you dread touching.
