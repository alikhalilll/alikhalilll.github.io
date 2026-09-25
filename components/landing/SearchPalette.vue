<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { Motion } from 'motion-v';
import type { SearchItem, SearchKind, SearchResult } from '@/composables/useSearchIndex';

interface Props {
  variant?: 'inline' | 'modal';
  maxHeight?: string;
  featuredOnly?: boolean;
  showShortcut?: boolean;
  /** When true, the palette drops its own border/rounded/background so it
   *  merges seamlessly into a surrounding surface (e.g. a mobile drawer). */
  flush?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'inline',
  maxHeight: '',
  featuredOnly: false,
  showShortcut: true,
  flush: false,
});

const emit = defineEmits<{
  (e: 'open' | 'navigate'): void;
}>();

const inputEl = ref<HTMLInputElement | null>(null);

defineExpose({
  focus: () => inputEl.value?.focus(),
});

const { t, tm } = useI18n();
const { formatDate, formatYear } = useLocalizedDate();
const { allTags, run } = await useSearchIndex();
const { work, openSource } = useProjects();

const rawQuery = ref('');
const debouncedQuery = refDebounced(rawQuery, 180);
const highlightIndex = ref(0);

// Ghost autocomplete + parser react to the raw input for zero-lag typing.
const {
  parsed: liveParsed,
  currentTokenAt,
  completeToken,
} = useSearchQuery(rawQuery, {
  allTags: allTags.value,
});

// Results run against the debounced query so the list doesn't thrash on every keystroke.
const { parsed } = useSearchQuery(debouncedQuery, {
  allTags: allTags.value,
});
// liveParsed is currently only used indirectly via completeToken / currentTokenAt above.
void liveParsed;

const filteredResults = computed<SearchResult[]>(() => run(parsed.value));

/**
 * Curated intro shown before any query is typed. Optimized for a hiring
 * manager landing cold: proof of shipped work first, technical depth
 * second, then a fast way to learn more about the author and reach out.
 * Order carries meaning — top of the list gets seen first.
 */
const hiringIntroIds = computed(() => {
  const ids: string[] = [];
  // 1–2. Featured product work (proof of shipped, real-world impact)
  work
    .filter((w) => w.featured)
    .slice(0, 2)
    .forEach((w) => ids.push(`project:${w.title}`));
  // 3–4. Featured open-source (proof of engineering craft)
  openSource
    .filter((o) => o.featured)
    .slice(0, 2)
    .forEach((o) => ids.push(`opensource:${o.title}`));
  // 5. About — who I am
  ids.push('page:/about');
  // 6. Contact — how to hire me
  ids.push('page:/contact');
  return ids;
});

const displayResults = computed<SearchResult[]>(() => {
  const anyFilter =
    Boolean(parsed.value.text) ||
    parsed.value.kinds.size > 0 ||
    parsed.value.tags.size > 0 ||
    Boolean(parsed.value.from) ||
    Boolean(parsed.value.to) ||
    Boolean(parsed.value.sort);

  if (anyFilter) return filteredResults.value.slice(0, 40);

  if (props.featuredOnly) {
    const byId = new Map(filteredResults.value.map((r) => [r.id, r]));
    return hiringIntroIds.value
      .map((id) => byId.get(id))
      .filter((v): v is SearchResult => Boolean(v));
  }

  return filteredResults.value.slice(0, 40);
});

interface Group {
  kind: SearchKind;
  label: string;
  items: SearchResult[];
}

const groups = computed<Group[]>(() => {
  const order: Array<{ kind: SearchKind; label: string }> = [
    { kind: 'project', label: t('search.kind_project') },
    { kind: 'article', label: t('search.kind_article') },
    { kind: 'opensource', label: t('search.kind_opensource') },
    { kind: 'page', label: t('search.kind_page') },
  ];
  return order
    .map(({ kind, label }) => ({
      kind,
      label,
      items: displayResults.value.filter((r) => r.kind === kind),
    }))
    .filter((g) => g.items.length > 0);
});

const flat = computed<SearchResult[]>(() => groups.value.flatMap((g) => g.items));

watch(displayResults, () => {
  highlightIndex.value = 0;
});

const highlighted = computed<SearchResult | null>(() => flat.value[highlightIndex.value] ?? null);

// Track the caret so token completion re-evaluates as it moves.
const caretPos = ref(0);
function syncCaret() {
  caretPos.value = inputEl.value?.selectionStart ?? rawQuery.value.length;
}

/**
 * Ghost tail shown inline after the caret. Priority:
 *   1. Token completion — `is` → `:`, `is:pro` → `ject`, `tag:vu` → `e`.
 *   2. Title completion — free-text query is a prefix of top match.
 * Tab / → always accepts whatever ghost is showing.
 */
const completion = computed(() => {
  const q = rawQuery.value;
  if (!q) return '';

  const { token } = currentTokenAt(caretPos.value);
  if (token) {
    const tokenTail = completeToken(token);
    if (tokenTail) return tokenTail;
    // Trailing word is an operator token but partial value with no match:
    // don't fall through to title completion (would look wrong mid-token).
    if (token.includes(':')) return '';
  }

  if (!highlighted.value) return '';
  const title = highlighted.value.title;
  if (title.toLowerCase().startsWith(q.toLowerCase()) && title.length > q.length) {
    return title.slice(q.length);
  }
  return '';
});

function acceptCompletion() {
  if (!completion.value) return;
  const el = inputEl.value;
  const caret = el?.selectionStart ?? rawQuery.value.length;
  const before = rawQuery.value.slice(0, caret);
  const after = rawQuery.value.slice(caret);
  rawQuery.value = `${before}${completion.value}${after}`;
  nextTick(() => {
    const pos = before.length + completion.value.length;
    el?.setSelectionRange(pos, pos);
    caretPos.value = pos;
    el?.focus();
  });
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (flat.value.length === 0) return;
    highlightIndex.value = (highlightIndex.value + 1) % flat.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (flat.value.length === 0) return;
    highlightIndex.value = (highlightIndex.value - 1 + flat.value.length) % flat.value.length;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    openHighlighted();
  } else if (e.key === 'Tab' && completion.value) {
    e.preventDefault();
    acceptCompletion();
  } else if (
    e.key === 'ArrowRight' &&
    completion.value &&
    inputEl.value?.selectionStart === rawQuery.value.length
  ) {
    e.preventDefault();
    acceptCompletion();
  }
}

function openHighlighted() {
  const target = highlighted.value;
  if (!target) return;
  if (target.external) {
    window.open(target.href, '_blank', 'noopener,noreferrer');
  } else {
    navigateTo(target.href);
  }
  emit('navigate');
}

function dateLabel(item: SearchItem) {
  if (item.kind === 'article' && item.date) {
    return formatDate(item.date, { year: 'numeric', month: 'short' });
  }
  if (item.year) return formatYear(item.year);
  return '';
}

function kindAccent(kind: SearchKind) {
  const map: Record<SearchKind, string> = {
    article: 'var(--brand-1)',
    project: 'var(--brand-3)',
    opensource: 'var(--brand-2)',
    page: 'var(--muted-foreground)',
  };
  return map[kind];
}

const placeholderKinds = computed<string[]>(() => {
  const raw = tm('search.placeholder_kinds') as unknown;
  return Array.isArray(raw) ? (raw as string[]) : ['Search…'];
});

const focused = ref(false);
const { display: typedPlaceholder } = useTypewriter(placeholderKinds, {
  paused: () => focused.value || rawQuery.value.length > 0,
});

function handleFocus() {
  focused.value = true;
  syncCaret();
  emit('open');
}

function handleBlur() {
  focused.value = false;
}

function handleClear() {
  rawQuery.value = '';
  caretPos.value = 0;
  inputEl.value?.focus();
}

watch(rawQuery, () => nextTick(syncCaret));
</script>

<template>
  <div
    class="flex flex-col overflow-hidden"
    :class="[
      flush ? 'bg-transparent' : 'rounded-xl border border-border bg-card/60 backdrop-blur-sm',
      variant === 'modal' && !flush ? 'shadow-2xl' : '',
    ]"
  >
    <!-- Input row -->
    <div class="relative flex items-center gap-2 border-b border-border/70 px-4 py-3">
      <Icon name="lucide:search" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />

      <div class="relative flex-1">
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 flex items-center overflow-hidden font-mono text-sm whitespace-pre text-muted-foreground/50 ar:font-sans"
        >
          <span class="invisible">{{ rawQuery }}</span>
          <span>{{ completion }}</span>
        </div>

        <input
          ref="inputEl"
          v-model="rawQuery"
          type="search"
          role="combobox"
          aria-autocomplete="inline"
          :aria-expanded="displayResults.length > 0"
          :aria-label="t('search.input_label')"
          :placeholder="rawQuery ? '' : typedPlaceholder"
          autocomplete="off"
          spellcheck="false"
          class="relative w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ar:font-sans"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="onKeydown"
          @keyup="syncCaret"
          @click="syncCaret"
          @select="syncCaret"
        />
      </div>

      <button
        v-if="rawQuery"
        type="button"
        class="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        :aria-label="t('search.clear')"
        @click="handleClear"
      >
        <Icon name="lucide:x" class="size-3.5" />
      </button>

      <span
        v-if="showShortcut && !rawQuery"
        class="hidden shrink-0 rounded border border-border bg-background/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex ar:font-sans"
        aria-hidden="true"
      >
        ⌘K
      </span>
    </div>

    <!-- Results -->
    <div
      class="flex-1 overflow-x-clip overflow-y-auto"
      :style="maxHeight ? { maxHeight } : undefined"
    >
      <template v-if="groups.length">
        <div v-for="group in groups" :key="group.kind" class="py-2">
          <div
            class="px-4 pb-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase ar:font-sans ar:normal-case"
          >
            {{ group.label }}
          </div>
          <ul>
            <Motion
              v-for="(item, i) in group.items"
              :key="item.id"
              as="li"
              :initial="{ scale: 1.1, opacity: 0, filter: 'blur(20px)' }"
              :animate="{ scale: 1, opacity: 1, filter: 'blur(0px)' }"
              :exit="{ scale: 1.1, opacity: 0, filter: 'blur(20px)' }"
              :transition="{ duration: 0.6, delay: 0.05 * i }"
              layout
            >
              <NuxtLink
                v-if="!item.external"
                :to="item.href"
                class="group/row relative mx-2 flex items-start gap-3 rounded-md px-3 py-2.5 no-underline transition-[background-color,color] duration-150 ease-out"
                :class="
                  highlighted?.id === item.id
                    ? 'bg-foreground/[0.05] text-foreground'
                    : 'text-foreground/90 hover:bg-foreground/[0.03]'
                "
                @mouseenter="highlightIndex = flat.findIndex((f) => f.id === item.id)"
                @click="emit('navigate')"
              >
                <span
                  class="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/60"
                  :style="{ color: kindAccent(item.kind) }"
                  aria-hidden="true"
                >
                  <Icon :name="item.icon" class="size-4" />
                </span>

                <span class="min-w-0 flex-1">
                  <span class="flex items-baseline justify-between gap-3">
                    <span class="truncate text-sm font-medium text-foreground">
                      <bdi>{{ item.title }}</bdi>
                    </span>
                    <span
                      v-if="dateLabel(item)"
                      class="shrink-0 font-mono text-xs text-muted-foreground ar:font-sans"
                    >
                      {{ dateLabel(item) }}
                    </span>
                  </span>

                  <span
                    v-if="item.description"
                    class="mt-0.5 block truncate text-xs text-muted-foreground"
                  >
                    {{ item.description }}
                  </span>
                </span>
                <Icon
                  name="lucide:arrow-right"
                  class="rtl-flip mt-2 size-3.5 shrink-0 text-muted-foreground transition-all duration-200"
                  :class="
                    highlighted?.id === item.id
                      ? 'opacity-100 text-foreground translate-x-0.5 rtl:-translate-x-0.5'
                      : 'opacity-0 -translate-x-1 rtl:translate-x-1'
                  "
                  aria-hidden="true"
                />
              </NuxtLink>
              <a
                v-else
                :href="item.href"
                target="_blank"
                rel="noopener noreferrer"
                class="group/row relative mx-2 flex items-start gap-3 rounded-md px-3 py-2.5 no-underline transition-[background-color,color] duration-150 ease-out"
                :class="
                  highlighted?.id === item.id
                    ? 'bg-foreground/[0.05] text-foreground'
                    : 'text-foreground/90 hover:bg-foreground/[0.03]'
                "
                @mouseenter="highlightIndex = flat.findIndex((f) => f.id === item.id)"
                @click="emit('navigate')"
              >
                <span
                  class="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background/60"
                  :style="{ color: kindAccent(item.kind) }"
                  aria-hidden="true"
                >
                  <Icon :name="item.icon" class="size-4" />
                </span>

                <span class="min-w-0 flex-1">
                  <span class="flex items-baseline justify-between gap-3">
                    <span class="truncate text-sm font-medium text-foreground">
                      <bdi>{{ item.title }}</bdi>
                    </span>
                    <span
                      v-if="dateLabel(item)"
                      class="shrink-0 font-mono text-xs text-muted-foreground ar:font-sans"
                    >
                      {{ dateLabel(item) }}
                    </span>
                  </span>

                  <span
                    v-if="item.description"
                    class="mt-0.5 block truncate text-xs text-muted-foreground"
                  >
                    {{ item.description }}
                  </span>
                </span>
                <Icon
                  name="lucide:arrow-up-right"
                  class="rtl-flip mt-2 size-3.5 shrink-0 text-muted-foreground transition-all duration-200"
                  :class="
                    highlighted?.id === item.id
                      ? 'opacity-100 text-foreground translate-x-0.5 rtl:-translate-x-0.5'
                      : 'opacity-0 -translate-x-1 rtl:translate-x-1'
                  "
                  aria-hidden="true"
                />
              </a>
            </Motion>
          </ul>
        </div>
      </template>

      <div v-else class="px-6 py-10 text-center text-sm text-muted-foreground">
        {{ t('search.empty_no_matches') }}
      </div>
    </div>

    <!-- Footer -->
    <div
      class="flex items-center justify-between gap-3 border-t border-border/70 bg-background/50 px-4 py-2 font-mono text-[11px] text-muted-foreground ar:font-sans"
    >
      <span class="inline-flex items-center gap-2">
        <span class="inline-flex items-center gap-0.5">
          <kbd class="rounded border border-border bg-background px-1">↑</kbd>
          <kbd class="rounded border border-border bg-background px-1">↓</kbd>
        </span>
        {{ t('search.navigate') }}
        <span class="mx-1 opacity-40">·</span>
        <kbd class="rounded border border-border bg-background px-1">↵</kbd>
        {{ t('search.open_key') }}
      </span>
      <span aria-live="polite">
        {{ t('search.results_count', { n: flat.length }, flat.length) }}
      </span>
    </div>
  </div>
</template>
