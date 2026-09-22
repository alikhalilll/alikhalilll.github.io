<script setup lang="ts">
const { t } = useI18n();
const { categories } = useFAQ();
const activeKey = ref(categories.value[0]?.key ?? 'general');

const activeCategory = computed(
  () => categories.value.find((c) => c.key === activeKey.value) ?? categories.value[0]
);
</script>

<template>
  <section v-if="categories.length" class="py-16">
    <h2 class="mb-6 text-xl font-medium sm:text-2xl">{{ t('home.faq.title') }}</h2>

    <div role="tablist" class="mb-6 inline-flex rounded-lg bg-accent p-1 text-sm">
      <button
        v-for="c in categories"
        :key="c.key"
        role="tab"
        :aria-selected="activeKey === c.key"
        type="button"
        class="rounded-md px-3 py-1.5 transition-all"
        :class="
          activeKey === c.key
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="activeKey = c.key"
      >
        {{ c.label }}
      </button>
    </div>

    <ul class="flex flex-col gap-2">
      <li v-for="(item, i) in activeCategory?.items ?? []" :key="activeKey + i">
        <details class="group rounded-lg bg-accent/50 open:bg-accent">
          <summary
            class="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground marker:hidden select-none hover:bg-accent [&::-webkit-details-marker]:hidden"
          >
            <span>{{ item.q }}</span>
            <Icon
              name="lucide:plus"
              class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
            />
          </summary>
          <div class="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
            {{ item.a }}
          </div>
        </details>
      </li>
    </ul>
  </section>
</template>
