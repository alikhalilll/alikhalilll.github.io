import { ref, watch, onBeforeUnmount, type Ref, type MaybeRefOrGetter } from 'vue';

interface Options {
  typeMs?: number;
  eraseMs?: number;
  holdMs?: number;
  paused?: MaybeRefOrGetter<boolean>;
}

export function useTypewriter(source: Ref<string[]>, opts: Options = {}) {
  const typeMs = opts.typeMs ?? 70;
  const eraseMs = opts.eraseMs ?? 40;
  const holdMs = opts.holdMs ?? 1400;

  const display = ref('');
  let idx = 0;
  let char = 0;
  let mode: 'type' | 'hold' | 'erase' = 'type';
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const isPaused = () => (typeof opts.paused === 'function' ? opts.paused() : toValue(opts.paused));

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  function schedule(ms: number) {
    if (stopped) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(step, ms);
  }

  function step() {
    if (stopped) return;
    if (isPaused()) {
      schedule(holdMs);
      return;
    }
    const words = source.value;
    if (!words.length) {
      display.value = '';
      return;
    }
    if (prefersReducedMotion()) {
      display.value = words[0]!;
      return;
    }
    const current = words[idx % words.length]!;
    if (mode === 'type') {
      char++;
      display.value = current.slice(0, char);
      if (char >= current.length) {
        mode = 'hold';
        schedule(holdMs);
      } else {
        schedule(typeMs);
      }
    } else if (mode === 'hold') {
      mode = 'erase';
      schedule(eraseMs);
    } else {
      char--;
      display.value = current.slice(0, char);
      if (char <= 0) {
        mode = 'type';
        idx = (idx + 1) % words.length;
        schedule(typeMs);
      } else {
        schedule(eraseMs);
      }
    }
  }

  function reset() {
    idx = 0;
    char = 0;
    mode = 'type';
    display.value = '';
  }

  // SSR/prerender: don't schedule the setTimeout loop — it would keep the
  // Node event loop alive and stall `nuxt generate` after prerender finishes.
  watch(
    source,
    () => {
      reset();
      if (import.meta.client) schedule(typeMs);
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    stopped = true;
    if (timer) clearTimeout(timer);
  });

  return { display };
}
