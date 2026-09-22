<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue';
import Autoplay from 'embla-carousel-autoplay';

const { t } = useI18n();
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
  [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
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
</script>

<template>
  <section v-if="items.length" class="rounded-2xl bg-accent/40 px-4 py-16 sm:px-8">
    <h2 class="mb-10 text-center text-xl font-medium sm:text-2xl">
      {{ t('home.testimonials.title') }}
    </h2>

    <div>
      <div ref="emblaRef" class="overflow-hidden">
        <div class="flex touch-pan-y">
          <div
            v-for="item in items"
            :key="item.name + item.date"
            class="min-w-0 flex-[0_0_100%] px-4 sm:px-8"
          >
            <div class="mx-auto max-w-xl text-center">
              <blockquote class="relative px-6 pt-10 pb-6 sm:px-10 sm:pt-14 sm:pb-8">
                <span
                  aria-hidden="true"
                  class="pointer-events-none absolute top-0 start-0 font-serif text-6xl leading-none text-muted-foreground/30 select-none sm:text-7xl"
                  >“</span
                >
                <p class="relative text-base leading-relaxed text-foreground sm:text-lg">
                  {{ item.quote }}
                </p>
                <span
                  aria-hidden="true"
                  class="pointer-events-none absolute bottom-0 end-0 font-serif text-6xl leading-none text-muted-foreground/30 select-none sm:text-7xl"
                  >”</span
                >
              </blockquote>

              <figcaption class="mt-4 flex flex-col items-center gap-0.5">
                <p class="text-sm font-medium text-foreground">{{ item.name }}</p>
                <p class="text-xs text-muted-foreground">{{ item.title }}</p>
              </figcaption>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-10 flex items-center justify-center gap-2">
      <button
        v-for="(_, i) in scrollSnaps"
        :key="i"
        type="button"
        :aria-label="`Testimonial ${i + 1}`"
        class="size-1.5 rounded-full transition-all"
        :class="
          i === selectedIndex
            ? 'w-6 bg-foreground'
            : 'bg-muted-foreground/40 hover:bg-muted-foreground'
        "
        @click="scrollTo(i)"
      />
    </div>
  </section>
</template>
