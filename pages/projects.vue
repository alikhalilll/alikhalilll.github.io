<script setup lang="ts">
useHead({ title: 'Projects — Ali Khalil' });

const { work, openSource } = useProjects();
</script>

<template>
  <div>
    <Hero
      eyebrow="Projects"
      title="A catalog of things I've built."
      subtitle="Real-time SaaS platforms, AI-powered products, and open-source modules. The common thread: solid types, honest docs, and as little ceremony as the problem allows."
    />

    <section class="prose-container pb-16">
      <h2 class="flex items-center gap-3 text-2xl sm:text-3xl">
        <Icon name="lucide:briefcase" class="size-6 text-primary" />
        Product work
      </h2>
      <p class="mt-3 text-muted-foreground">Products I have led or shipped major features for.</p>
      <div class="mt-8 grid gap-5">
        <ProjectCard
          v-for="project in work"
          :key="project.title"
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
      <h2 class="flex items-center gap-3 text-2xl sm:text-3xl">
        <Icon name="lucide:package" class="size-6 text-primary" />
        Open source
      </h2>
      <p class="mt-3 text-muted-foreground">
        Nuxt modules I maintain. All free, MIT-licensed, and published on npm.
      </p>
      <div class="mt-8 grid gap-5">
        <ProjectCard
          v-for="project in openSource"
          :key="project.title"
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
