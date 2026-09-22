<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue';
import Autoplay from 'embla-carousel-autoplay';

const { items } = useTestimonials();

const isRtl = computed(() => {
  if (!import.meta.client) return false;
  return document.documentElement.getAttribute('dir') === 'rtl';
});

const [emblaRef, emblaApi] = emblaCarouselVue(
  {
    loop: true,
    align: 'center',
    direction: isRtl.value ? 'rtl' : 'ltr',
    skipSnaps: false,
  },
  [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
);

const selectedIndex = ref(0);
const scrollSnaps = ref<number[]>([]);

const onSelect = () => {
  if (!emblaApi.value) return;
  selectedIndex.value = emblaApi.value.selectedScrollSnap();
};

onMounted(() => {
  if (!emblaApi.value) return;
  scrollSnaps.value = emblaApi.value.scrollSnapList();
  emblaApi.value.on('select', onSelect);
  emblaApi.value.on('reInit', onSelect);
  onSelect();
});

const scrollTo = (i: number) => emblaApi.value?.scrollTo(i);

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
</script>

<template>
  <section v-if="items.length" class="py-14 sm:py-20">
    <!-- Full-bleed viewport: negative margins let the panel extend past the
         framed-container padding, mirroring the Nuxt template's UCarousel
         viewport bleed (-mx-4 sm:-mx-12 lg:-mx-16). -->
    <div
      ref="emblaRef"
      class="-mx-6 overflow-hidden bg-accent/50 sm:-mx-12 lg:-mx-16 dark:bg-card/40"
    >
      <div class="flex touch-pan-y">
        <div v-for="item in items" :key="item.name + item.date" class="min-w-0 flex-[0_0_100%]">
          <div class="mx-auto max-w-2xl px-6 py-12 text-center sm:px-10 sm:py-16 sm:gap-8">
            <blockquote
              class="testimonial-quote relative text-base leading-relaxed text-foreground text-balance sm:text-lg"
            >
              {{ item.quote }}
            </blockquote>

            <div class="mt-8 flex items-center justify-center gap-3 sm:mt-10">
              <span
                class="inline-flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-border sm:size-14"
                :style="{
                  background: 'color-mix(in oklab, var(--brand-1) 14%, var(--card))',
                  color: 'var(--brand-1)',
                }"
                aria-hidden="true"
              >
                {{ initialsFor(item.name) }}
              </span>
              <div class="text-start">
                <p class="text-sm font-semibold text-foreground sm:text-base">
                  {{ item.name }}
                </p>
                <p class="text-xs text-muted-foreground sm:text-sm">{{ item.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="scrollSnaps.length > 1" class="mt-8 flex items-center justify-center gap-2">
      <button
        v-for="(_, i) in scrollSnaps"
        :key="i"
        type="button"
        :aria-label="`Testimonial ${i + 1}`"
        class="size-2 rounded-full transition-all"
        :class="
          i === selectedIndex
            ? 'bg-foreground'
            : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
        "
        @click="scrollTo(i)"
      />
    </div>
  </section>
</template>

<style scoped>
/* Matches the Nuxt template's before/after positioning:
   opening quote sits to the left of the text with a negative top offset;
   closing quote follows the text inline via a small end-margin. */
.testimonial-quote::before,
.testimonial-quote::after {
  font-family: var(--font-serif);
  line-height: 0;
  color: color-mix(in oklab, var(--muted-foreground) 60%, transparent);
  display: inline-block;
}

.testimonial-quote::before {
  content: open-quote;
  position: absolute;
  font-size: 3rem;
  margin-inline-start: -1.5rem;
  margin-top: -0.5rem;
}

.testimonial-quote::after {
  content: close-quote;
  font-size: 3rem;
  margin-inline-start: 0.5rem;
  vertical-align: -0.7em;
}

@media (min-width: 1024px) {
  .testimonial-quote::before {
    font-size: 4.5rem;
    margin-inline-start: -2.5rem;
    margin-top: -1rem;
  }
  .testimonial-quote::after {
    font-size: 4.5rem;
    margin-inline-start: 0.5rem;
    vertical-align: -0.8em;
  }
}
</style>
