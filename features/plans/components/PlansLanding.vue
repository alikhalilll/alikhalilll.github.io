<script setup lang="ts">
import { computed } from 'vue';
import { useHead } from '#imports';

import { planCatalog } from '../data';
import { roadmapPath } from '../routes';
import { usePlanProgress } from '../composables/usePlanProgress';
import LearningShell from './LearningShell.vue';
import PlanCard from './PlanCard.vue';

useHead({
  title: 'Learning Paths · Choose a plan',
});

const plan1Progress = usePlanProgress('plan-1');
const plan2Progress = usePlanProgress('plan-2');
const { completedTopics, progressPercent } = plan1Progress;
const { completedTopics: plan2CompletedTopics, progressPercent: plan2ProgressPercent } =
  plan2Progress;

const planProgress = computed<Record<string, { completed: number; percent: number }>>(() => ({
  'plan-1': { completed: completedTopics.value, percent: progressPercent.value },
  'plan-2': { completed: plan2CompletedTopics.value, percent: plan2ProgressPercent.value },
}));

const totalTopics = computed(() => planCatalog.reduce((total, plan) => total + plan.topics, 0));
const totalWeeks = computed(() => planCatalog.reduce((total, plan) => total + plan.weeks, 0));
const totalPhases = computed(() => planCatalog.reduce((total, plan) => total + plan.phases, 0));
const totalRoles = computed(() =>
  planCatalog.reduce((total, plan) => total + plan.roles.length, 0)
);

const howItWorks = [
  {
    number: '01',
    title: 'Choose a plan',
    body: 'Start with Core Skills for the product and QA foundation, or go straight to Backend / Full-Stack if you already have that base.',
    icon: 'lucide:mouse-pointer-click',
  },
  {
    number: '02',
    title: 'Follow the roadmap',
    body: 'Every topic is a node in order. Open a node to get the why, the implementation steps, the weekly task and free resources.',
    icon: 'lucide:map',
  },
  {
    number: '03',
    title: 'Pass the quiz',
    body: 'A topic unlocks the next topic. A phase quiz unlocks the next phase and adds a new role to your profile.',
    icon: 'lucide:badge-check',
  },
];
</script>

<template>
  <LearningShell
    wide
    :progress-label="`${completedTopics} topics passed`"
    :progress-percent="progressPercent"
  >
    <!-- ============ HERO ============ -->
    <section
      class="plans-hero relative overflow-hidden rounded-3xl border border-[var(--line)] shadow-md"
    >
      <!-- Decorative gradient bg (scoped CSS for color-mix + radial) -->
      <span class="plans-hero-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <!-- Top gradient bar -->
      <span
        class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand)] via-[var(--phase-blue)] to-[var(--brand)]"
      />

      <div
        class="relative grid gap-10 p-8 md:grid-cols-[minmax(0,1fr)_360px] md:items-center md:p-12"
      >
        <!-- Copy column -->
        <div class="min-w-0">
          <p class="plans-eyebrow m-0">Learning Paths</p>
          <h1
            class="my-3 max-w-[18ch] text-[clamp(3rem,5.8vw,5.1rem)] font-bold leading-[0.97] tracking-tight"
          >
            Two plans. One path from idea to production.
          </h1>
          <p class="m-0 max-w-[700px] text-[1.12rem] leading-relaxed text-[var(--muted)]">
            Pick the plan you want to start. Each plan is a visual roadmap: topics in the right
            order, a real task every week, free resources, and a quiz that has to be passed before
            the next level opens.
          </p>

          <div class="mt-7 flex flex-wrap items-center gap-4">
            <a href="#plans" class="learning-button learning-button-primary">
              Explore the two plans
              <Icon name="lucide:arrow-down" class="learning-icon" />
            </a>
            <span class="inline-flex items-center gap-1.5 text-[0.86rem] text-[var(--muted)]">
              <Icon name="lucide:shield-check" class="learning-icon text-[var(--brand)]" />
              No account needed · progress stays in your browser
            </span>
          </div>

          <!-- Totals grid -->
          <div
            class="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] p-px sm:grid-cols-4"
            aria-label="Learning path totals"
          >
            <div class="grid gap-0.5 bg-[color-mix(in_oklab,var(--surface)_86%,transparent)] p-3">
              <strong class="font-[var(--font-display)] text-[1.1rem] font-bold text-[var(--ink)]">
                {{ totalTopics }}
              </strong>
              <span class="text-[0.72rem] font-medium text-[var(--muted)]">guided topics</span>
            </div>
            <div class="grid gap-0.5 bg-[color-mix(in_oklab,var(--surface)_86%,transparent)] p-3">
              <strong class="font-[var(--font-display)] text-[1.1rem] font-bold text-[var(--ink)]">
                {{ totalPhases }}
              </strong>
              <span class="text-[0.72rem] font-medium text-[var(--muted)]">phase gates</span>
            </div>
            <div class="grid gap-0.5 bg-[color-mix(in_oklab,var(--surface)_86%,transparent)] p-3">
              <strong class="font-[var(--font-display)] text-[1.1rem] font-bold text-[var(--ink)]">
                {{ totalRoles }}
              </strong>
              <span class="text-[0.72rem] font-medium text-[var(--muted)]">roles</span>
            </div>
            <div class="grid gap-0.5 bg-[color-mix(in_oklab,var(--surface)_86%,transparent)] p-3">
              <strong class="font-[var(--font-display)] text-[1.1rem] font-bold text-[var(--ink)]">
                {{ totalWeeks }}
              </strong>
              <span class="text-[0.72rem] font-medium text-[var(--muted)]">weeks of material</span>
            </div>
          </div>
        </div>

        <!-- Dashboard panel: your progress -->
        <aside
          class="grid gap-3 rounded-2xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_90%,transparent)] p-5 shadow-sm backdrop-blur"
          aria-label="Your plan progress"
        >
          <div class="flex items-start justify-between gap-3 pb-1">
            <div class="grid gap-0.5">
              <p
                class="m-0 text-[0.68rem] font-extrabold uppercase tracking-widest text-[var(--muted)]"
              >
                Your progress
              </p>
              <strong
                class="font-[var(--font-display)] text-[1.04rem] font-bold leading-tight text-[var(--ink)]"
              >
                Pick up where you left off
              </strong>
            </div>
            <span
              class="inline-flex flex-none items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-1 text-[0.66rem] font-bold text-[var(--success)]"
            >
              <Icon name="lucide:cloud-check" class="learning-icon" />
              Saved locally
            </span>
          </div>

          <NuxtLink
            v-for="plan in planCatalog"
            :key="plan.id"
            :to="roadmapPath(plan.id)"
            class="plans-dashboard-plan group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-[var(--ink)] no-underline transition-all hover:-translate-y-0.5 hover:border-[color:var(--phase-color)]"
            :data-tone="plan.tone"
          >
            <span
              class="grid h-9 w-9 flex-none place-items-center rounded-lg border font-[var(--font-display)] text-[0.72rem] font-bold text-[color:var(--phase-color)]"
              :style="{
                background: 'color-mix(in oklab, var(--phase-color) 10%, var(--surface))',
                borderColor: 'color-mix(in oklab, var(--phase-color) 22%, var(--line))',
              }"
            >
              0{{ plan.number }}
            </span>
            <span class="grid min-w-0 gap-0.5">
              <span class="truncate text-[0.84rem] font-bold leading-tight">
                {{ plan.shortTitle }} · {{ plan.title }}
              </span>
              <span class="text-[0.7rem] text-[var(--muted)]">
                {{ planProgress[plan.id]?.completed ?? 0 }} / {{ plan.topics }} topics
              </span>
              <span class="mt-0.5 block h-1 overflow-hidden rounded-full bg-[var(--line)]">
                <span
                  class="block h-full rounded-full bg-[color:var(--phase-color)]"
                  :style="{ width: `${planProgress[plan.id]?.percent ?? 0}%` }"
                />
              </span>
            </span>
            <span class="grid justify-items-end gap-0.5">
              <strong
                class="font-[var(--font-display)] text-[1.02rem] text-[color:var(--phase-color)]"
              >
                {{ planProgress[plan.id]?.percent ?? 0 }}%
              </strong>
              <span
                class="inline-flex items-center gap-0.5 text-[0.66rem] font-bold uppercase tracking-wider text-[var(--muted)] group-hover:text-[color:var(--phase-color)]"
              >
                {{ (planProgress[plan.id]?.completed ?? 0) > 0 ? 'Continue' : 'Start' }}
                <Icon name="lucide:arrow-right" class="learning-icon" />
              </span>
            </span>
          </NuxtLink>

          <p
            class="m-0 flex items-start gap-1.5 pt-1 text-[0.74rem] leading-snug text-[var(--muted)]"
          >
            <Icon name="lucide:split" class="learning-icon mt-0.5 flex-none text-[var(--brand)]" />
            Both plans keep independent progress. Finishing one never resets the other.
          </p>
        </aside>
      </div>
    </section>

    <!-- ============ § 01 — PLANS ============ -->
    <section id="plans" class="mt-16 scroll-mt-24" aria-labelledby="plans-title">
      <header class="mb-6 flex flex-wrap items-end justify-between gap-8">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-3">
            <span
              class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
            >
              01
            </span>
            <p class="plans-section-kicker m-0">Choose your starting point</p>
          </div>
          <h2
            id="plans-title"
            class="mt-2 text-[clamp(1.8rem,2.9vw,2.5rem)] font-bold leading-tight"
          >
            Two routes. One clear next step.
          </h2>
        </div>
        <p class="m-0 max-w-[540px] text-[1rem] leading-relaxed text-[var(--muted)]">
          Start with the product and QA foundation, or go directly into backend and full-stack
          delivery. Both plans are live, and each keeps its own roadmap, quizzes, gates and
          progress.
        </p>
      </header>

      <div class="grid gap-5 md:grid-cols-2">
        <PlanCard
          v-for="plan in planCatalog"
          :key="plan.id"
          :plan="plan"
          :completed-topics="planProgress[plan.id]?.completed ?? 0"
          :progress-percent="planProgress[plan.id]?.percent ?? 0"
        />
      </div>
    </section>

    <!-- ============ § 02 — HOW IT WORKS ============ -->
    <section class="mt-16 scroll-mt-24" aria-labelledby="how-title">
      <header class="mb-6 flex flex-wrap items-end justify-between gap-8">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-3">
            <span
              class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
            >
              02
            </span>
            <p class="plans-section-kicker m-0">How it works</p>
          </div>
          <h2 id="how-title" class="mt-2 text-[clamp(1.8rem,2.9vw,2.5rem)] font-bold leading-tight">
            A learning loop with a real gate
          </h2>
        </div>
        <p class="m-0 max-w-[540px] text-[1rem] leading-relaxed text-[var(--muted)]">
          The roadmap is not a reading list. You produce something each week, prove it, then earn
          the next role.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-3">
        <article
          v-for="step in howItWorks"
          :key="step.number"
          class="plans-step relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--brand)]"
        >
          <span
            class="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--brand)] to-transparent opacity-60"
            aria-hidden="true"
          />
          <span
            class="absolute right-4 top-3 font-[var(--font-display)] text-[2.3rem] font-bold leading-none text-[var(--line-strong)] opacity-55"
          >
            {{ step.number }}
          </span>
          <span
            class="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_oklab,var(--brand)_18%,var(--line))] bg-[var(--brand-soft)] text-[1.15rem] text-[var(--brand)]"
          >
            <Icon :name="step.icon" class="learning-icon" />
          </span>
          <h3 class="mb-1.5 mt-0 text-[1.12rem] font-bold">{{ step.title }}</h3>
          <p class="m-0 text-[0.92rem] leading-relaxed text-[var(--muted)]">{{ step.body }}</p>
        </article>
      </div>
    </section>
  </LearningShell>
</template>

<style scoped>
/* Hero multi-layer background (brand-tinted) — a NestJS-ish subtle wash */
.plans-hero-bg {
  background:
    radial-gradient(
      circle at 88% 10%,
      color-mix(in oklab, var(--brand) 14%, transparent),
      transparent 24rem
    ),
    linear-gradient(145deg, var(--surface), color-mix(in oklab, var(--brand) 5%, var(--surface)));
}

/* Phase tone → variable mapping for dashboard plan tiles */
.plans-dashboard-plan[data-tone='blue'] {
  --phase-color: var(--phase-blue);
}

.plans-dashboard-plan[data-tone='violet'] {
  --phase-color: var(--phase-violet);
}

.plans-dashboard-plan[data-tone='teal'] {
  --phase-color: var(--phase-teal);
}

.plans-dashboard-plan[data-tone='amber'] {
  --phase-color: var(--phase-amber);
}
</style>
