<script setup lang="ts">
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

    <section class="prose-container pb-16">
      <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {{ t('projects.product_work') }}
      </h2>
      <p class="mt-2 text-sm text-muted-foreground">{{ t('projects.product_work_blurb') }}</p>
      <div class="mt-6 grid gap-4">
        <ProjectCard
          v-for="(project, i) in work"
          :key="project.title"
          v-reveal="i * 70"
          :title="project.title"
          :description="project.description"
          :tags="project.tags"
          :href="project.href"
          :repo="project.repo"
          :year="project.year"
          :icon="project.icon"
        />
      </div>
    </section>

    <section class="prose-container pb-24">
      <h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {{ t('projects.open_source') }}
      </h2>
      <p class="mt-2 text-sm text-muted-foreground">{{ t('projects.open_source_blurb') }}</p>
      <div class="mt-6 grid gap-4">
        <ProjectCard
          v-for="(project, i) in openSource"
          :key="project.title"
          v-reveal="i * 70"
          :title="project.title"
          :description="project.description"
          :tags="project.tags"
          :href="project.href"
          :repo="project.repo"
          :year="project.year"
          :icon="project.icon"
        />
      </div>
    </section>
  </div>
</template>
