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
    <section class="plans-hero">
      <div class="plans-hero-copy">
        <p class="plans-eyebrow">Learning Paths</p>
        <h1>Two plans. One path from idea to production.</h1>
        <p>
          Pick the plan you want to start. Each plan is a visual roadmap: topics in the right order,
          a real task every week, free resources, and a quiz that has to be passed before the next
          level opens.
        </p>
        <div class="plans-hero-actions">
          <a href="#plans" class="learning-button learning-button-primary">
            Explore the two plans
            <Icon name="lucide:arrow-down" class="learning-icon" />
          </a>
          <span class="plans-hero-note">
            <Icon name="lucide:shield-check" class="learning-icon" />
            No account needed · progress stays in your browser
          </span>
        </div>

        <div class="plans-hero-facts" aria-label="Learning path totals">
          <span>
            <strong>{{ totalTopics }}</strong>
            guided topics
          </span>
          <span>
            <strong>{{ totalPhases }}</strong>
            phase gates
          </span>
          <span>
            <strong>{{ totalRoles }}</strong>
            roles
          </span>
          <span>
            <strong>{{ totalWeeks }}</strong>
            weeks of material
          </span>
        </div>
      </div>

      <aside class="plans-hero-dashboard" aria-label="Your plan progress">
        <div class="plans-dashboard-head">
          <div>
            <p class="plans-card-kicker">Your progress</p>
            <strong>Pick up where you left off</strong>
          </div>
          <span class="plans-dashboard-saved">
            <Icon name="lucide:cloud-check" class="learning-icon" />
            Saved locally
          </span>
        </div>

        <NuxtLink
          v-for="plan in planCatalog"
          :key="plan.id"
          :to="roadmapPath(plan.id)"
          class="plans-dashboard-plan"
          :data-tone="plan.tone"
        >
          <span class="plans-dashboard-number">0{{ plan.number }}</span>
          <span class="plans-dashboard-copy">
            <span class="plans-dashboard-label">{{ plan.shortTitle }} · {{ plan.title }}</span>
            <span class="plans-dashboard-meta">
              {{ planProgress[plan.id]?.completed ?? 0 }} / {{ plan.topics }} topics
            </span>
            <span class="plans-dashboard-track">
              <span :style="{ width: `${planProgress[plan.id]?.percent ?? 0}%` }" />
            </span>
          </span>
          <span class="plans-dashboard-side">
            <strong>{{ planProgress[plan.id]?.percent ?? 0 }}%</strong>
            <span>
              {{ (planProgress[plan.id]?.completed ?? 0) > 0 ? 'Continue' : 'Start' }}
              <Icon name="lucide:arrow-right" class="learning-icon" />
            </span>
          </span>
        </NuxtLink>

        <p class="plans-dashboard-note">
          <Icon name="lucide:split" class="learning-icon" />
          Both plans keep independent progress. Finishing one never resets the other.
        </p>
      </aside>
    </section>

    <section id="plans" class="plans-section" aria-labelledby="plans-title">
      <div class="plans-section-head">
        <div>
          <p class="plans-section-kicker">Choose your starting point</p>
          <h2 id="plans-title">Two routes. One clear next step.</h2>
        </div>
        <p>
          Start with the product and QA foundation, or go directly into backend and full-stack
          delivery. Both plans are live, and each keeps its own roadmap, quizzes, gates and
          progress.
        </p>
      </div>

      <div class="plans-grid">
        <PlanCard
          v-for="plan in planCatalog"
          :key="plan.id"
          :plan="plan"
          :completed-topics="planProgress[plan.id]?.completed ?? 0"
          :progress-percent="planProgress[plan.id]?.percent ?? 0"
        />
      </div>
    </section>

    <section class="plans-section" aria-labelledby="how-title">
      <div class="plans-section-head">
        <div>
          <p class="plans-section-kicker">How it works</p>
          <h2 id="how-title">A learning loop with a real gate</h2>
        </div>
        <p>
          The roadmap is not a reading list. You produce something each week, prove it, then earn
          the next role.
        </p>
      </div>

      <div class="plans-steps">
        <article v-for="step in howItWorks" :key="step.number" class="plans-step">
          <span class="plans-step-number">{{ step.number }}</span>
          <span class="plans-step-icon">
            <Icon :name="step.icon" class="learning-icon" />
          </span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.body }}</p>
        </article>
      </div>
    </section>
  </LearningShell>
</template>

<style scoped>
.plans-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 38px;
  align-items: center;
  padding: 46px;
  background:
    radial-gradient(
      circle at 88% 10%,
      color-mix(in oklab, var(--brand) 14%, transparent),
      transparent 24rem
    ),
    linear-gradient(145deg, var(--surface), color-mix(in oklab, var(--brand) 5%, var(--surface)));
  border: 1px solid var(--line);
  border-radius: 32px;
  box-shadow: var(--shadow);
}

.plans-hero-copy h1 {
  max-width: 840px;
  margin: 12px 0 20px;
  font-size: clamp(3rem, 5.8vw, 5.1rem);
  line-height: 0.97;
  letter-spacing: -0.05em;
}

.plans-hero-copy > p:not(.plans-eyebrow) {
  max-width: 700px;
  margin: 0;
  font-size: 1.12rem;
  line-height: 1.7;
  color: var(--muted);
}

.plans-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-top: 28px;
}

.plans-hero-note {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  font-size: 0.84rem;
  color: var(--muted);
}

.plans-hero-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  padding: 1px;
  margin-top: 30px;
  overflow: hidden;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 14px;
}

.plans-hero-facts span {
  display: grid;
  gap: 1px;
  padding: 10px 12px;
  font-size: 0.7rem;
  color: var(--muted);
  background: color-mix(in oklab, var(--surface) 86%, transparent);
}

.plans-hero-facts strong {
  font-family: var(--font-display);
  font-size: 1.02rem;
  font-weight: 750;
  color: var(--ink);
}

.plans-hero-dashboard {
  display: grid;
  gap: 12px;
  padding: 20px;
  background: color-mix(in oklab, var(--surface) 90%, transparent);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(12px);
}

.plans-dashboard-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 4px;
}

.plans-dashboard-head > div {
  display: grid;
  gap: 3px;
}

.plans-dashboard-head strong {
  font-family: var(--font-display);
  font-size: 1.04rem;
  line-height: 1.25;
}

.plans-card-kicker {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

.plans-dashboard-saved {
  display: inline-flex;
  flex: none;
  gap: 4px;
  align-items: center;
  padding: 4px 7px;
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--success);
  background: var(--success-soft);
  border-radius: 999px;
}

.plans-dashboard-plan {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 11px;
  align-items: center;
  padding: 13px;
  color: var(--ink) !important;
  text-decoration: none !important;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 13px;
  transition:
    border-color 160ms ease,
    transform 160ms ease;
}

.plans-dashboard-plan:hover {
  border-color: var(--phase-color);
  transform: translateY(-1px);
}

.plans-dashboard-number {
  display: grid;
  width: 34px;
  height: 34px;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--phase-color);
  background: color-mix(in oklab, var(--phase-color) 10%, var(--surface));
  border: 1px solid color-mix(in oklab, var(--phase-color) 22%, var(--line));
  border-radius: 9px;
  place-items: center;
}

.plans-dashboard-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.plans-dashboard-label {
  overflow: hidden;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plans-dashboard-meta {
  font-size: 0.7rem;
  color: var(--muted);
}

.plans-dashboard-track {
  display: block;
  height: 4px;
  margin-top: 2px;
  overflow: hidden;
  background: var(--line);
  border-radius: 999px;
}

.plans-dashboard-track span {
  display: block;
  height: 100%;
  background: var(--phase-color);
  border-radius: inherit;
}

.plans-dashboard-side {
  display: grid;
  gap: 2px;
  justify-items: end;
}

.plans-dashboard-side > strong {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--phase-color);
}

.plans-dashboard-side > span {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--muted);
}

.plans-dashboard-note {
  display: flex;
  gap: 7px;
  align-items: flex-start;
  padding-top: 4px;
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.5;
  color: var(--muted);
}

.plans-dashboard-note .learning-icon {
  flex: none;
  margin-top: 2px;
  color: var(--brand);
}

.plans-section {
  margin-top: 68px;
  scroll-margin-top: 96px;
}

.plans-section-head {
  display: flex;
  gap: 32px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.plans-section-head h2 {
  margin: 5px 0 0;
  font-size: clamp(1.8rem, 2.9vw, 2.5rem);
  line-height: 1.1;
}

.plans-section-head > p {
  max-width: 540px;
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--muted);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.plans-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.plans-step {
  position: relative;
  padding: 24px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
}

.plans-step-number {
  position: absolute;
  top: 14px;
  right: 16px;
  font-family: var(--font-display);
  font-size: 2.3rem;
  font-weight: 750;
  color: var(--line-strong);
  opacity: 0.55;
}

.plans-step-icon {
  display: grid;
  width: 40px;
  height: 40px;
  margin-bottom: 18px;
  font-size: 1.15rem;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid color-mix(in oklab, var(--brand) 18%, var(--line));
  border-radius: 11px;
  place-items: center;
}

.plans-step::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  content: '';
  background: linear-gradient(90deg, var(--brand), transparent 80%);
  opacity: 0.55;
}

.plans-step h3 {
  margin: 0 0 6px;
  font-size: 1.12rem;
}

.plans-step p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--muted);
}

@media (max-width: 1080px) {
  .plans-hero {
    grid-template-columns: 1fr;
    padding: 32px;
  }

  .plans-hero-dashboard {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .plans-dashboard-head,
  .plans-dashboard-note {
    grid-column: 1 / -1;
  }

  .plans-steps {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .plans-hero-dashboard {
    grid-template-columns: 1fr;
  }

  .plans-dashboard-head,
  .plans-dashboard-note {
    grid-column: auto;
  }
}

@media (max-width: 760px) {
  .plans-section-head {
    display: block;
  }

  .plans-section-head > p {
    margin-top: 10px;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .plans-hero {
    padding: 26px;
    border-radius: 24px;
  }

  .plans-hero-copy h1 {
    font-size: clamp(2.5rem, 12vw, 3.3rem);
  }

  .plans-hero-actions .learning-button {
    width: 100%;
  }

  .plans-hero-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .plans-dashboard-plan {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .plans-dashboard-side {
    grid-column: 2;
    grid-template-columns: auto minmax(0, 1fr);
    justify-items: start;
  }

  .plans-dashboard-side > span {
    justify-self: end;
  }
}
</style>
