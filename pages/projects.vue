<script setup lang="ts">
const { t } = useI18n();

useSiteSeo({
  title: t('meta.projects.title'),
  description: t('meta.projects.description'),
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
        <div v-for="(project, i) in work" :key="project.title" v-reveal="i * 100">
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
        </div>
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
        <div v-for="(project, i) in openSource" :key="project.title" v-reveal="i * 100">
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
        </div>
      </div>
    </section>
  </div>
</template>
