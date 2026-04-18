<script setup lang="ts">
useHead({ title: 'Contact — Ali Khalil' });

const channels = [
  {
    label: 'Email',
    value: 'alikhalilll.dev@gmail.com',
    href: 'mailto:alikhalilll.dev@gmail.com',
    hint: 'Best for anything longer than a tweet.',
    icon: 'lucide:mail',
  },
  {
    label: 'Phone / WhatsApp',
    value: '+20 106 610 5963',
    href: 'tel:+201066105963',
    hint: 'Available on WhatsApp for quick messages.',
    icon: 'lucide:phone',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/alikhalilll',
    href: 'https://www.linkedin.com/in/alikhalilll',
    hint: 'Work inquiries and professional hellos.',
    icon: 'lucide:linkedin',
  },
  {
    label: 'GitHub',
    value: '@alikhalilll',
    href: 'https://github.com/alikhalilll',
    hint: 'Code, issues, and the usual.',
    icon: 'lucide:github',
  },
];
</script>

<template>
  <div>
    <Hero
      eyebrow="Contact"
      title="Let's talk."
      subtitle="Roles, collaborations, open-source requests, or just a friendly 'I read your docs' — all welcome. I read everything."
    />

    <section class="prose-container pb-24">
      <ul class="flex flex-col gap-3">
        <li v-for="c in channels" :key="c.label">
          <a
            :href="c.href"
            target="_blank"
            rel="noopener"
            class="group flex items-center gap-5 rounded-xl border border-border bg-card p-5 no-underline transition-all hover:border-foreground"
          >
            <span
              class="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
            >
              <Icon :name="c.icon" class="size-5" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {{ c.label }}
              </p>
              <p class="mt-0.5 truncate font-serif text-lg font-semibold text-foreground">
                {{ c.value }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">{{ c.hint }}</p>
            </div>
            <Icon
              name="lucide:arrow-right"
              class="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
            />
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>
