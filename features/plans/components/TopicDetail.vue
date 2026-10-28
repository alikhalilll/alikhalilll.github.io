<script setup lang="ts">
import { computed } from 'vue';
import { useHead } from '#imports';

import { getPlanRuntime } from '../planRuntime';
import { usePlanProgress } from '../composables/usePlanProgress';
import { phasePath, roadmapPath, topicPath } from '../routes';
import LearningShell from './LearningShell.vue';
import QuizRunner from './QuizRunner.vue';

const props = defineProps<{
  planId: string;
  topicId: string;
}>();

const plan = computed(() => getPlanRuntime(props.planId));
const planTopics = computed(() => plan.value?.topics ?? []);
const topic = computed(() => planTopics.value.find((entry) => entry.id === props.topicId));
const phase = computed(() => (topic.value ? plan.value?.getPhase(topic.value.phase) : undefined));
const progress = usePlanProgress(props.planId);
const {
  completedTopics,
  getNextTopic,
  getPhaseQuizStatus,
  getTopicResult,
  getTopicStatus,
  hydrated,
  progressPercent,
  recordTopicResult,
  unlockAll,
  disableUnlock,
} = progress;

const status = computed(() => (topic.value ? getTopicStatus(topic.value.id) : 'locked'));
const result = computed(() => (topic.value ? getTopicResult(topic.value.id) : undefined));
const quiz = computed(() => (topic.value ? (plan.value?.getTopicQuiz(topic.value.id) ?? []) : []));
const topicPassingScore = computed(() => plan.value?.topicPassingScore ?? 2);
const youtubeResources = computed(
  () => topic.value?.resources.filter((resource) => resource.kind === 'youtube') ?? []
);
const readingResources = computed(
  () => topic.value?.resources.filter((resource) => resource.kind === 'read') ?? []
);
const hasVideoResources = computed(() => youtubeResources.value.length > 0);
const hasReadingResources = computed(() => readingResources.value.length > 0);

const phaseQuizStatus = computed(() =>
  topic.value ? getPhaseQuizStatus(topic.value.phase) : 'locked'
);
const firstTopic = computed(() => planTopics.value[0]);

const nextStep = computed(() => {
  if (!topic.value) return undefined;

  const nextTopic = getNextTopic(topic.value);
  if (nextTopic && nextTopic.phase === topic.value.phase) {
    return {
      href: topicPath(props.planId, nextTopic.id),
      label: `Next topic: ${nextTopic.title}`,
      hint: `W${nextTopic.week} · ${nextTopic.stage}`,
    };
  }

  if (phaseQuizStatus.value === 'available') {
    return {
      href: phasePath(props.planId, topic.value.phase),
      label: `Take the ${phase.value?.title ?? 'phase'} quiz`,
      hint: `Pass it to add ${phase.value?.role.title ?? 'the phase role'}`,
    };
  }

  if (phaseQuizStatus.value === 'complete' && nextTopic) {
    return {
      href: topicPath(props.planId, nextTopic.id),
      label: `Next phase: ${nextTopic.title}`,
      hint: `W${nextTopic.week} · ${nextTopic.phase}`,
    };
  }

  return {
    href: roadmapPath(props.planId),
    label: 'Back to the roadmap',
    hint: 'Review your progress',
  };
});

const handleQuizPass = (score: number, total: number) => {
  if (topic.value) recordTopicResult(topic.value.id, score, total);
};

useHead(() => ({
  title: topic.value ? `${topic.value.title} · Learning Paths` : 'Topic · Learning Paths',
}));
</script>

<template>
  <LearningShell
    wide
    :back-to="roadmapPath(planId)"
    back-label="Roadmap"
    :progress-label="`${completedTopics} topics passed`"
    :progress-percent="progressPercent"
  >
    <template v-if="topic">
      <!-- ============ UNLOCK-ALL BANNER ============ -->
      <div
        v-if="unlockAll"
        class="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[color-mix(in_oklab,var(--brand)_40%,var(--line))] bg-[var(--brand-soft)] px-4 py-3 text-[0.88rem] text-[var(--ink)]"
        role="status"
      >
        <Icon name="lucide:unlock" class="learning-icon text-[var(--brand)]" />
        <span class="flex-1">
          <strong class="font-semibold">Explore mode</strong> — every phase, topic and gate is open
          (cookie-persisted for 24h).
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[0.78rem] font-medium text-[var(--ink)] hover:border-[var(--brand)]"
          @click="disableUnlock"
        >
          Turn off
          <Icon name="lucide:x" class="learning-icon" />
        </button>
      </div>

      <!-- Topic is locked -->
      <section v-if="hydrated && status === 'locked'" class="topic-locked">
        <div class="topic-locked-card">
          <span class="topic-locked-icon">
            <Icon name="lucide:lock-keyhole" class="learning-icon" />
          </span>
          <p class="plans-eyebrow">Topic {{ String(topic.order).padStart(2, '0') }}</p>
          <h1>{{ topic.title }}</h1>
          <p>
            This topic is still locked. Pass the previous topic quiz and the phase gate before it to
            open it. The roadmap shows exactly what is left.
          </p>
          <div class="topic-locked-actions">
            <NuxtLink :to="roadmapPath(planId)" class="learning-button learning-button-primary">
              Back to the roadmap
              <Icon name="lucide:map" class="learning-icon" />
            </NuxtLink>
            <NuxtLink
              v-if="firstTopic"
              :to="topicPath(planId, firstTopic.id)"
              class="learning-button learning-button-soft"
            >
              Go to the current level
            </NuxtLink>
          </div>
        </div>
      </section>

      <template v-else>
        <!-- Breadcrumb -->
        <nav class="topic-breadcrumb" aria-label="Breadcrumb">
          <NuxtLink :to="roadmapPath(planId)">Roadmap</NuxtLink>
          <span>/</span>
          <span>Phase {{ topic.phaseNumber }} · {{ phase?.title }}</span>
          <span>/</span>
          <span>Week {{ topic.week }}</span>
        </nav>

        <!-- ============ HERO ============ -->
        <section
          class="topic-hero relative grid gap-6 overflow-hidden rounded-3xl border border-[var(--line)] p-8 shadow-md md:grid-cols-[80px_minmax(0,1fr)_320px] md:items-start md:p-10"
          :data-tone="phase?.tone"
        >
          <span
            class="absolute inset-x-0 top-0 h-[5px] bg-[color:var(--phase-color)]"
            aria-hidden="true"
          />

          <!-- Order badge -->
          <div
            class="relative flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
          >
            <span
              class="font-[var(--font-display)] text-[2rem] font-bold leading-none text-[color:var(--phase-color)]"
            >
              {{ String(topic.order).padStart(2, '0') }}
            </span>
            <small class="text-[0.68rem] text-[var(--muted)]">of {{ planTopics.length }}</small>
          </div>

          <!-- Copy -->
          <div class="relative min-w-0">
            <div
              class="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[0.84rem] text-[var(--muted)]"
            >
              <span
                class="rounded-md border border-[color-mix(in_oklab,var(--phase-color)_30%,var(--line))] bg-[color-mix(in_oklab,var(--phase-color)_10%,var(--surface))] px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-widest text-[color:var(--phase-color)]"
                :data-stage="topic.stage"
              >
                {{ topic.stage }}
              </span>
              <span>Week {{ topic.week }} · {{ topic.weekTitle }}</span>
              <span
                v-if="result?.passed"
                class="inline-flex items-center gap-1 font-semibold text-[var(--success)]"
              >
                <Icon name="lucide:circle-check-big" class="learning-icon" />
                Passed · best {{ result.bestScore }}/3
              </span>
            </div>
            <h1
              class="my-3 text-[clamp(2.3rem,4.4vw,3.7rem)] font-bold leading-[1.02] tracking-tight"
            >
              {{ topic.title }}
            </h1>
            <p class="m-0 max-w-[780px] text-[1.05rem] leading-relaxed text-[var(--muted)]">
              {{ topic.why }}
            </p>
          </div>

          <!-- Task preview card -->
          <div class="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <span
              class="mb-1.5 block text-[0.72rem] font-extrabold uppercase tracking-widest text-[color:var(--phase-color)]"
            >
              Task of the week
            </span>
            <strong class="block text-[1rem] font-bold leading-tight">{{
              topic.task.title
            }}</strong>
            <p class="m-0 mt-2 line-clamp-5 text-[0.86rem] leading-snug text-[var(--muted)]">
              {{ topic.task.brief }}
            </p>
          </div>
        </section>

        <!-- ============ § 01 — UNDERSTAND THE TOPIC ============ -->
        <section
          id="understand"
          class="topic-section scroll-mt-24"
          aria-labelledby="guidance-title"
        >
          <div class="plan-section-head">
            <div>
              <div class="flex items-center gap-3">
                <span
                  class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
                >
                  01
                </span>
                <p class="plans-section-kicker m-0">Understand the topic</p>
              </div>
              <h2 id="guidance-title">Why, how and what it changes in you</h2>
            </div>
            <p>
              Read this before the resources. The goal is not to recognise the words; it is to do
              the work and explain why it matters.
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <article
              class="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-colors hover:border-[color:var(--phase-color)]"
            >
              <span
                class="mb-3.5 grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_oklab,var(--phase-color)_24%,var(--line))] bg-[color-mix(in_oklab,var(--phase-color)_10%,var(--surface))] text-[1.15rem] text-[color:var(--phase-color)]"
              >
                <Icon name="lucide:circle-help" class="learning-icon" />
              </span>
              <h3 class="mb-2 mt-0 text-[1.08rem] font-bold">Why it matters</h3>
              <p class="m-0 text-[0.94rem] leading-relaxed text-[var(--muted)]">
                {{ topic.why }}
              </p>
            </article>
            <article
              class="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-colors hover:border-[color:var(--phase-color)]"
            >
              <span
                class="mb-3.5 grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_oklab,var(--phase-color)_24%,var(--line))] bg-[color-mix(in_oklab,var(--phase-color)_10%,var(--surface))] text-[1.15rem] text-[color:var(--phase-color)]"
              >
                <Icon name="lucide:hammer" class="learning-icon" />
              </span>
              <h3 class="mb-2 mt-0 text-[1.08rem] font-bold">How to implement it</h3>
              <p class="m-0 text-[0.94rem] leading-relaxed text-[var(--muted)]">
                {{ topic.how }}
              </p>
            </article>
            <article
              class="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-colors hover:border-[color:var(--phase-color)]"
            >
              <span
                class="mb-3.5 grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_oklab,var(--phase-color)_24%,var(--line))] bg-[color-mix(in_oklab,var(--phase-color)_10%,var(--surface))] text-[1.15rem] text-[color:var(--phase-color)]"
              >
                <Icon name="lucide:trending-up" class="learning-icon" />
              </span>
              <h3 class="mb-2 mt-0 text-[1.08rem] font-bold">How it improves you</h3>
              <p class="m-0 text-[0.94rem] leading-relaxed text-[var(--muted)]">
                {{ topic.impact }}
              </p>
            </article>
          </div>

          <!-- Brief notes + topic links -->
          <div
            class="mt-4 grid gap-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 md:grid-cols-[minmax(0,1.4fr)_minmax(250px,0.6fr)]"
          >
            <div>
              <h3 class="mb-3 mt-0 text-[1.04rem] font-bold">Brief notes</h3>
              <p v-if="topic.body" class="m-0 text-[0.94rem] leading-relaxed text-[var(--muted)]">
                {{ topic.body }}
              </p>
              <ul
                v-if="topic.list"
                class="m-0 mt-3 grid list-disc gap-1.5 pl-5 text-[0.92rem] leading-relaxed text-[var(--muted)]"
              >
                <li v-for="entry in topic.list" :key="entry">{{ entry }}</li>
              </ul>
            </div>
            <div
              v-if="topic.links"
              class="topic-links border-t border-[var(--line)] pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0"
            >
              <h3 class="mb-3 mt-0 text-[1.04rem] font-bold">Topic links</h3>
              <a
                v-for="link in topic.links"
                :key="link.href"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-between gap-2 border-b border-[var(--line)] py-2 text-[0.88rem] no-underline hover:text-[color:var(--phase-color)] last:border-b-0"
              >
                {{ link.label }}
                <Icon name="lucide:arrow-up-right" class="learning-icon" />
              </a>
            </div>
          </div>
        </section>

        <!-- ============ § 02 — RESOURCES ============ -->
        <section
          id="resources"
          class="topic-section scroll-mt-24"
          aria-labelledby="resources-title"
        >
          <div class="plan-section-head">
            <div>
              <div class="flex items-center gap-3">
                <span
                  class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
                >
                  02
                </span>
                <p class="plans-section-kicker m-0">Learn first</p>
              </div>
              <h2 id="resources-title">Resources for this week</h2>
            </div>
            <p>
              {{
                hasVideoResources
                  ? 'Watch the videos, then read the free material. Take notes you can use in the task.'
                  : 'Read the free material and keep the references you need for the task.'
              }}
            </p>
          </div>

          <div
            class="grid gap-4"
            :class="hasVideoResources && hasReadingResources ? 'md:grid-cols-2' : 'grid-cols-1'"
          >
            <div
              v-if="hasVideoResources"
              class="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
            >
              <h3
                class="mb-4 mt-0 flex items-center gap-2 border-b border-[var(--line)] pb-3 text-[1rem] font-bold"
              >
                <Icon name="lucide:youtube" class="learning-icon text-[color:var(--phase-color)]" />
                Watch
              </h3>
              <a
                v-for="resource in youtubeResources"
                :key="resource.href"
                :href="resource.href"
                class="topic-resource group grid gap-1 border-b border-[var(--line)] py-3.5 text-[var(--ink)] no-underline last:border-b-0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  class="justify-self-start rounded-md bg-[#c83b30] px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-widest text-white"
                >
                  YouTube
                </span>
                <strong
                  class="text-[0.94rem] leading-snug transition-colors group-hover:text-[var(--brand)]"
                >
                  {{ resource.title }}
                </strong>
                <span class="text-[0.82rem] text-[var(--muted)]">{{ resource.source }}</span>
                <small class="text-[0.8rem] leading-snug text-[var(--muted)]">
                  {{ resource.focus }}
                </small>
              </a>
            </div>

            <div
              v-if="hasReadingResources"
              class="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
            >
              <h3
                class="mb-4 mt-0 flex items-center gap-2 border-b border-[var(--line)] pb-3 text-[1rem] font-bold"
              >
                <Icon
                  name="lucide:book-open"
                  class="learning-icon text-[color:var(--phase-color)]"
                />
                Read / use
              </h3>
              <a
                v-for="resource in readingResources"
                :key="resource.href"
                :href="resource.href"
                class="topic-resource group grid gap-1 border-b border-[var(--line)] py-3.5 text-[var(--ink)] no-underline last:border-b-0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  class="justify-self-start rounded-md bg-[var(--brand)] px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-widest text-[var(--on-brand)]"
                >
                  Read
                </span>
                <strong
                  class="text-[0.94rem] leading-snug transition-colors group-hover:text-[var(--brand)]"
                >
                  {{ resource.title }}
                </strong>
                <span class="text-[0.82rem] text-[var(--muted)]">{{ resource.source }}</span>
                <small class="text-[0.8rem] leading-snug text-[var(--muted)]">
                  {{ resource.focus }}
                </small>
              </a>
            </div>
          </div>
        </section>

        <!-- ============ § 03 — TASK OF THE WEEK ============ -->
        <section id="task" class="topic-section scroll-mt-24" aria-labelledby="task-title">
          <div class="plan-section-head">
            <div>
              <div class="flex items-center gap-3">
                <span
                  class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
                >
                  03
                </span>
                <p class="plans-section-kicker m-0">Do the work</p>
              </div>
              <h2 id="task-title">Task of the week</h2>
            </div>
            <p>
              Do this on a real ticket, repo or screen. Hints are there when you are stuck, not
              before you try.
            </p>
          </div>

          <div class="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7">
            <div class="border-b border-[var(--line)] pb-5">
              <span
                class="text-[0.73rem] font-extrabold uppercase tracking-widest text-[color:var(--phase-color)]"
              >
                Deliverable
              </span>
              <h3 class="my-1.5 text-[1.34rem] font-bold leading-tight">{{ topic.task.title }}</h3>
              <p class="m-0 max-w-[840px] text-[0.96rem] leading-relaxed text-[var(--muted)]">
                {{ topic.task.brief }}
              </p>
            </div>

            <ol
              class="topic-task-steps my-6 grid list-decimal gap-x-8 gap-y-2.5 pl-6 text-[0.92rem] leading-relaxed text-[var(--muted)] md:grid-cols-2"
            >
              <li v-for="step in topic.task.steps" :key="step">{{ step }}</li>
            </ol>

            <div class="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5">
              <h3 class="mb-2.5 mt-0 flex items-center gap-2 text-[0.94rem] font-bold">
                <Icon name="lucide:lightbulb" class="learning-icon text-[var(--warning-ink)]" />
                Solution hints
              </h3>
              <ul
                class="m-0 grid list-disc gap-1.5 pl-5 text-[0.88rem] leading-relaxed text-[var(--muted)]"
              >
                <li v-for="hint in topic.task.hints" :key="hint">{{ hint }}</li>
              </ul>
            </div>

            <div
              class="mt-3.5 rounded-xl border border-[color-mix(in_oklab,var(--brand)_24%,var(--line))] bg-[var(--brand-soft)] px-5 py-4 text-[0.9rem] leading-relaxed text-[var(--muted)]"
            >
              <strong class="text-[var(--brand)]">Done when:</strong>
              {{ topic.task.doneWhen }}
            </div>
          </div>
        </section>

        <!-- ============ § 04 — OUTCOMES ============ -->
        <section id="outcomes" class="topic-section scroll-mt-24" aria-labelledby="outcomes-title">
          <div class="plan-section-head">
            <div>
              <div class="flex items-center gap-3">
                <span
                  class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
                >
                  04
                </span>
                <p class="plans-section-kicker m-0">Prove it</p>
              </div>
              <h2 id="outcomes-title">By the end of the week, you can</h2>
            </div>
            <p>
              These are the outcomes the quiz checks. If you cannot explain one, read that part
              again.
            </p>
          </div>
          <ul class="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
            <li
              v-for="outcome in topic.outcomes"
              :key="outcome"
              class="flex items-start gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-[0.92rem] leading-relaxed text-[var(--muted)]"
            >
              <Icon name="lucide:check" class="learning-icon mt-1 text-[var(--success)]" />
              {{ outcome }}
            </li>
          </ul>
        </section>

        <!-- ============ § 05 — QUIZ ============ -->
        <section id="quiz" class="topic-section scroll-mt-24" aria-labelledby="quiz-title">
          <div class="plan-section-head">
            <div>
              <div class="flex items-center gap-3">
                <span
                  class="grid h-7 w-9 place-items-center rounded-md border border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--brand-soft)] text-[0.72rem] font-bold text-[var(--brand)]"
                >
                  05
                </span>
                <p class="plans-section-kicker m-0">Pass the level</p>
              </div>
              <h2 id="quiz-title">Checkpoint quiz</h2>
            </div>
            <p>
              Pass {{ topicPassingScore }} of {{ quiz.length }} questions to mark this topic
              complete and unlock the next node.
            </p>
          </div>

          <QuizRunner
            :title="`${topic.title} · topic quiz`"
            :description="`Prove you can explain why this matters, how to apply it and how it changes your work.`"
            :questions="quiz"
            :passing-score="topicPassingScore"
            :already-passed="result?.passed === true"
            :best-score="result?.bestScore ?? 0"
            :attempts="result?.attempts ?? 0"
            @pass="handleQuizPass"
          />

          <!-- Next step CTA -->
          <div v-if="result?.passed && nextStep" class="topic-next">
            <div>
              <span class="plans-section-kicker">Unlocked</span>
              <h3>{{ nextStep.label }}</h3>
              <p>{{ nextStep.hint }}</p>
            </div>
            <NuxtLink :to="nextStep.href" class="learning-button learning-button-primary">
              Continue
              <Icon name="lucide:arrow-right" class="learning-icon" />
            </NuxtLink>
          </div>
        </section>
      </template>
    </template>

    <section v-else class="plan-coming-soon">
      <div class="plan-coming-card">
        <h1>Topic not found</h1>
        <p>This topic does not exist in the plan.</p>
        <NuxtLink :to="roadmapPath(planId)" class="learning-button learning-button-primary">
          Back to the roadmap
        </NuxtLink>
      </div>
    </section>
  </LearningShell>
</template>

<style scoped>
/* Hero wash per tone (color-mix needs real CSS, not Tailwind arbitrary) */
.topic-hero {
  background:
    radial-gradient(
      circle at 95% 0%,
      color-mix(in oklab, var(--phase-color) 15%, transparent),
      transparent 24rem
    ),
    linear-gradient(
      145deg,
      var(--surface),
      color-mix(in oklab, var(--phase-color) 4%, var(--surface))
    );
}

/* Markers on ordered steps get phase color (Tailwind can't target ::marker on arbitrary color-mix) */
.topic-task-steps li::marker {
  font-weight: 800;
  color: var(--phase-color);
}

/* Topic links section — border-left on desktop handled by Tailwind utility above */
@media (max-width: 820px) {
  .topic-hero {
    grid-template-columns: 78px minmax(0, 1fr);
  }

  .topic-hero > div:last-child {
    grid-column: 2;
  }
}

@media (max-width: 600px) {
  .topic-hero {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 22px;
    border-radius: 24px;
  }

  .topic-hero > div:first-child {
    flex-direction: row;
    gap: 8px;
    align-items: baseline;
    justify-content: flex-start;
    width: auto;
    height: auto;
    padding: 7px 11px;
    background: var(--surface-2);
    border-radius: 10px;
  }

  .topic-hero > div:first-child span {
    font-size: 1.25rem;
  }

  .topic-hero > div:last-child {
    grid-column: auto;
  }

  .topic-hero h1 {
    font-size: clamp(2.1rem, 10vw, 2.9rem);
  }
}
</style>
