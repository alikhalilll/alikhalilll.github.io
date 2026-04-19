<script setup lang="ts">
import { useStorage } from '@vueuse/core';

const props = defineProps<{
  slug: string;
}>();

const emit = defineEmits<{
  'update:activeIndex': [number | null];
}>();

const { t } = useI18n();
const config = useRuntimeConfig();
const base = (config.app?.baseURL ?? '/').replace(/\/$/, '');
const src = computed(() => `${base}/audio/${props.slug}.mp3`);
const cuesUrl = computed(() => `${base}/audio/${props.slug}.cues.json`);

type Cue = { index: number; startSec: number; endSec: number };
const audio = ref<HTMLAudioElement | null>(null);
const available = ref(true);
const playerOpen = useState('audioPlayerOpen', () => false);
watchEffect(() => {
  playerOpen.value = available.value;
});
onBeforeUnmount(() => {
  playerOpen.value = false;
  clearPauseTimer();
  clearIdleTimer();
});

const playing = ref(false);
const duration = ref(0);
const currentTime = ref(0);
const rates = [1, 1.25, 1.5, 1.75] as const;
const rateIndex = ref(0);
const cues = ref<Cue[]>([]);
const activeIndex = ref<number | null>(null);
const savedPosition = useStorage<number>(`audio:pos:${props.slug}`, 0);

const expanded = ref(false);
let idleTimer: ReturnType<typeof setTimeout> | null = null;
function bumpActivity() {
  expanded.value = true;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    expanded.value = false;
  }, 2000);
}
function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

const progressPct = computed(() =>
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
);

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function toggle() {
  const el = audio.value;
  if (!el) return;
  if (el.paused) el.play();
  else el.pause();
}

function cycleRate() {
  rateIndex.value = (rateIndex.value + 1) % rates.length;
  const next = rates[rateIndex.value] ?? 1;
  if (audio.value) audio.value.playbackRate = next;
}

const dragging = ref(false);

function seekFromPointer(e: PointerEvent, target: HTMLElement) {
  const el = audio.value;
  if (!el || !duration.value) return;
  const rect = target.getBoundingClientRect();
  const isRtl = getComputedStyle(target).direction === 'rtl';
  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  const ratio = isRtl ? 1 - x / rect.width : x / rect.width;
  el.currentTime = Math.max(0, Math.min(duration.value, ratio * duration.value));
}

function onScrubDown(e: PointerEvent) {
  const target = e.currentTarget as HTMLElement;
  target.setPointerCapture(e.pointerId);
  dragging.value = true;
  seekFromPointer(e, target);
}
function onScrubMove(e: PointerEvent) {
  if (!dragging.value) return;
  seekFromPointer(e, e.currentTarget as HTMLElement);
}
function onScrubUp(e: PointerEvent) {
  const target = e.currentTarget as HTMLElement;
  if (target.hasPointerCapture?.(e.pointerId)) target.releasePointerCapture(e.pointerId);
  dragging.value = false;
}

function findCueIndex(t: number): number | null {
  const hit = cues.value.find((c) => t >= c.startSec && t < c.endSec);
  return hit ? hit.index : null;
}

function scheduleHighlightClear() {
  clearPauseTimer();
  if (activeIndex.value === null) return;
  pauseClearTimer = setTimeout(() => {
    activeIndex.value = null;
    emit('update:activeIndex', null);
    pauseClearTimer = null;
  }, 3000);
}

function restoreFromSaved() {
  const el = audio.value;
  if (!el || !duration.value) return;
  const saved = savedPosition.value;
  if (!saved || !Number.isFinite(saved) || saved <= 1 || saved >= duration.value - 1) return;
  el.currentTime = saved;
  currentTime.value = saved;
  if (cues.value.length) {
    const idx = findCueIndex(saved);
    if (idx !== null) {
      activeIndex.value = idx;
      emit('update:activeIndex', idx);
      scheduleHighlightClear();
    }
  }
}

function onLoaded() {
  if (!audio.value) return;
  duration.value = audio.value.duration || 0;
  restoreFromSaved();
}
function onTime() {
  if (!audio.value) return;
  currentTime.value = audio.value.currentTime;
  savedPosition.value = currentTime.value;
  if (cues.value.length) {
    const next = findCueIndex(currentTime.value);
    if (next !== activeIndex.value) {
      activeIndex.value = next;
      emit('update:activeIndex', next);
    }
  }
}
let pauseClearTimer: ReturnType<typeof setTimeout> | null = null;
function clearPauseTimer() {
  if (pauseClearTimer) {
    clearTimeout(pauseClearTimer);
    pauseClearTimer = null;
  }
}
function onPlay() {
  playing.value = true;
  clearPauseTimer();
  bumpActivity();
}
function onPause() {
  playing.value = false;
  scheduleHighlightClear();
}
function onEnded() {
  playing.value = false;
  currentTime.value = duration.value;
  savedPosition.value = 0;
  activeIndex.value = null;
  emit('update:activeIndex', null);
}
function onError() {
  // Ignore errors until the element has actually attempted to load.
  const el = audio.value;
  if (!el || !el.error) return;
  available.value = false;
  emit('update:activeIndex', null);
}

onMounted(async () => {
  bumpActivity();
  try {
    const res = await fetch(cuesUrl.value);
    if (!res.ok) return;
    const data = (await res.json()) as { cues: Cue[] };
    cues.value = data.cues ?? [];
  } catch {
    // no cues available — player still works, just no highlight
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-8 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-8 scale-95"
    >
      <div
        v-show="available"
        dir="ltr"
        :class="[
          'fixed bottom-4 left-1/2 z-40 -translate-x-1/2 overflow-hidden rounded-full sm:bottom-6',
          'border shadow-md ring-1 ring-inset',
          'bg-card/50 backdrop-blur-xl backdrop-saturate-150',
          'supports-[backdrop-filter]:bg-card/40',
          'transition-[width,opacity,box-shadow,border-color] duration-300 ease-out',
          expanded
            ? 'w-[calc(100%-5rem)] opacity-100 border-primary/40 ring-primary/20 shadow-primary/10 sm:w-[min(28rem,calc(100%-6.5rem))]'
            : 'w-[13rem] opacity-60 border-primary/20 ring-primary/10 shadow-black/5 sm:w-[min(18rem,calc(100%-6.5rem))]',
        ]"
        @pointerenter="bumpActivity"
        @pointermove="bumpActivity"
        @pointerdown="bumpActivity"
        @focusin="bumpActivity"
      >
        <div class="flex items-center gap-2 px-2 py-1.5 sm:gap-3 sm:px-3 sm:py-2">
          <button
            type="button"
            :aria-label="playing ? t('blog.audio.pause') : t('blog.audio.play')"
            class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 sm:size-8"
            @click="toggle"
          >
            <Icon :name="playing ? 'lucide:pause' : 'lucide:play'" class="size-4 sm:size-3.5" />
          </button>

          <div class="group min-w-0 flex-1 py-2">
            <div
              role="slider"
              tabindex="0"
              :aria-valuenow="Math.round(progressPct)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="t('blog.audio.progress')"
              class="relative h-1.5 cursor-pointer touch-none rounded-full bg-foreground/10 transition-[height] duration-150 sm:h-1 sm:group-hover:h-1.5"
              :class="{ 'h-1.5': dragging }"
              @pointerdown="onScrubDown"
              @pointermove="onScrubMove"
              @pointerup="onScrubUp"
              @pointercancel="onScrubUp"
            >
              <div
                class="h-full rounded-full bg-primary transition-[width] duration-100"
                :style="{ width: `${progressPct}%` }"
              />
              <span
                class="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-100 shadow transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100"
                :class="{ 'sm:opacity-100': dragging }"
                :style="{ left: `${progressPct}%` }"
              />
            </div>
          </div>

          <span
            v-show="expanded"
            dir="ltr"
            class="shrink-0 font-mono text-xs tabular-nums text-muted-foreground sm:text-[11px]"
          >
            {{ fmt(currentTime) }} / {{ fmt(duration) }}
          </span>

          <button
            v-show="expanded"
            type="button"
            :aria-label="t('blog.audio.speed')"
            class="shrink-0 rounded-md border border-border/60 px-2 py-1 font-mono text-xs tabular-nums hover:bg-accent ar:font-sans sm:px-1.5 sm:py-0.5 sm:text-[11px]"
            @click="cycleRate"
          >
            {{ rates[rateIndex] }}×
          </button>
        </div>

        <audio
          ref="audio"
          :src="src"
          preload="metadata"
          @loadedmetadata="onLoaded"
          @timeupdate="onTime"
          @play="onPlay"
          @pause="onPause"
          @ended="onEnded"
          @error="onError"
        />
      </div>
    </Transition>
  </Teleport>
</template>
