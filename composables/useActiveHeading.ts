import type { Ref } from 'vue';

export function getStickyOffset(): number {
  if (!import.meta.client) return 96;
  const header = document.querySelector('header')?.getBoundingClientRect().height ?? 64;
  const mobileBar =
    document.querySelector<HTMLElement>('[data-mobile-toc-bar]')?.getBoundingClientRect().height ??
    0;
  return Math.round(header + mobileBar + 16);
}

export function scrollToHash(id: string) {
  if (!import.meta.client) return;
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - getStickyOffset();
  window.scrollTo({ top, behavior: 'smooth' });
  history.replaceState(history.state, '', `#${id}`);
}

function isNearPageBottom(): boolean {
  if (!import.meta.client) return false;
  const scrollMax = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  return window.scrollY + window.innerHeight >= scrollMax - 4;
}

export function useActiveHeading(ids: Ref<string[]>) {
  const active = ref<string | null>(null);
  let observer: IntersectionObserver | null = null;
  const visible = new Set<string>();

  function resolve() {
    const list = ids.value;
    if (!list.length) {
      active.value = null;
      return;
    }

    if (isNearPageBottom()) {
      active.value = list[list.length - 1] ?? null;
      return;
    }

    const inZone = list.find((id) => visible.has(id));
    if (inZone) {
      active.value = inZone;
      return;
    }

    const triggerY = getStickyOffset() + 4;
    let above: string | null = null;
    for (const id of list) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top < triggerY) {
        above = id;
      } else {
        break;
      }
    }
    active.value = above ?? list[0] ?? null;
  }

  function setup() {
    observer?.disconnect();
    visible.clear();
    if (!import.meta.client) return;
    if (!ids.value.length) {
      active.value = null;
      return;
    }

    const offset = getStickyOffset();
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        resolve();
      },
      {
        rootMargin: `-${offset}px 0px -60% 0px`,
        threshold: 0,
      }
    );

    for (const id of ids.value) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    resolve();
  }

  onMounted(() => {
    nextTick(setup);
    window.addEventListener('resize', setup);
    window.addEventListener('scroll', resolve, { passive: true });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    if (import.meta.client) {
      window.removeEventListener('resize', setup);
      window.removeEventListener('scroll', resolve);
    }
  });

  watch(ids, () => nextTick(setup), { deep: true });

  return active;
}
