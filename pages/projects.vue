<script setup lang="ts">
import { Motion } from 'motion-v';

const { t } = useI18n();

useSiteSeo({
  title: t('projects.eyebrow'),
  description: t('projects.subtitle'),
});

const { work, openSource } = useProjects();
</script>

<template>
  <div>
    <Hero
      :eyebrow="t('projects.eyebrow')"
      :title="t('projects.title')"
      :subtitle="t('projects.subtitle')"
    />

    <section class="pb-16">
      <h2
        class="text-sm font-semibold tracking-wide text-muted-foreground uppercase ar:normal-case"
      >
        {{ t('projects.product_work') }}
      </h2>
      <p class="mt-2 text-sm text-muted-foreground">{{ t('projects.product_work_blurb') }}</p>
      <div class="mt-6 flex flex-col gap-6">
        <Motion
          v-for="(project, i) in work"
          :key="project.title"
          :initial="{ y: 20, opacity: 0 }"
          :while-in-view="{ y: 0, opacity: 1 }"
          :in-view-options="{ once: true, amount: 0.2 }"
          :transition="{ duration: 0.5, delay: 0.1 * i }"
        >
          <ProjectCard
            :title="project.title"
            :description="project.description"
            :tags="project.tags"
            :href="project.href"
            :repo="project.repo"
            :year="project.year"
            :icon="project.icon"
            :horizontal="true"
            :reverse="i % 2 === 1"
          />
        </Motion>
      </div>
    </section>

    <section class="pb-24">
      <h2
        class="text-sm font-semibold tracking-wide text-muted-foreground uppercase ar:normal-case"
      >
        {{ t('projects.open_source') }}
      </h2>
      <p class="mt-2 text-sm text-muted-foreground">{{ t('projects.open_source_blurb') }}</p>
      <div class="mt-6 flex flex-col gap-6">
        <Motion
          v-for="(project, i) in openSource"
          :key="project.title"
          :initial="{ y: 20, opacity: 0 }"
          :while-in-view="{ y: 0, opacity: 1 }"
          :in-view-options="{ once: true, amount: 0.2 }"
          :transition="{ duration: 0.5, delay: 0.1 * i }"
        >
          <ProjectCard
            :title="project.title"
            :description="project.description"
            :tags="project.tags"
            :href="project.href"
            :repo="project.repo"
            :year="project.year"
            :icon="project.icon"
            :horizontal="true"
            :reverse="i % 2 === 1"
          />
        </Motion>
      </div>
    </section>
  </div>
</template>
