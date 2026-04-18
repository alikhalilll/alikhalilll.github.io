import type { Directive } from 'vue';

/**
 * v-reveal — fades/slides an element in when it scrolls into view.
 * Works per-element: each tagged card, row, or heading animates on its
 * own entry, producing a progressive reveal instead of a single big flash.
 *
 * Implementation:
 *   - One shared IntersectionObserver for the whole page. Cheap even with
 *     hundreds of observed elements.
 *   - Respects prefers-reduced-motion by skipping the animated class.
 *   - Unobserves on first intersection so re-scrolling doesn't re-play.
 */

let sharedObserver: IntersectionObserver | null = null;
const pending = new WeakSet<Element>();

function ensureObserver() {
  if (sharedObserver || typeof window === 'undefined') return sharedObserver;

  sharedObserver = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting && pending.has(entry.target)) {
          (entry.target as HTMLElement).classList.add('reveal-in');
          pending.delete(entry.target);
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  return sharedObserver;
}

const reveal: Directive<HTMLElement, number | { delay?: number } | undefined> = {
  // SSR stub — required so @vue/server-renderer's ssrGetDirectiveProps
  // doesn't crash when this directive is only defined on the client.
  getSSRProps() {
    return {};
  },
  mounted(el, binding) {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      el.classList.add('reveal-in');
      return;
    }

    el.classList.add('reveal');

    const delay = typeof binding.value === 'number' ? binding.value : (binding.value?.delay ?? 0);
    if (delay) el.style.transitionDelay = `${delay}ms`;

    pending.add(el);

    // Defer observation by one paint. IntersectionObserver runs its initial
    // check in the same rendering tick as observe(), so without this the
    // browser computes a single style with both .reveal and .reveal-in
    // applied and skips the transition — cards pop in instead of fading.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (pending.has(el)) ensureObserver()?.observe(el);
      });
    });
  },
  unmounted(el) {
    pending.delete(el);
    sharedObserver?.unobserve(el);
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', reveal);
});
