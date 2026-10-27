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
        <nav class="topic-breadcrumb" aria-label="Breadcrumb">
          <NuxtLink :to="roadmapPath(planId)">Roadmap</NuxtLink>
          <span>/</span>
          <span>Phase {{ topic.phaseNumber }} · {{ phase?.title }}</span>
          <span>/</span>
          <span>Week {{ topic.week }}</span>
        </nav>

        <section class="topic-hero" :data-tone="phase?.tone">
          <div class="topic-hero-order">
            <span>{{ String(topic.order).padStart(2, '0') }}</span>
            <small>of {{ planTopics.length }}</small>
          </div>
          <div class="topic-hero-copy">
            <div class="topic-meta">
              <span class="topic-badge" :data-stage="topic.stage">{{ topic.stage }}</span>
              <span>Week {{ topic.week }} · {{ topic.weekTitle }}</span>
              <span v-if="result?.passed" class="topic-passed">
                <Icon name="lucide:circle-check-big" class="learning-icon" />
                Passed · best {{ result.bestScore }}/3
              </span>
            </div>
            <h1>{{ topic.title }}</h1>
            <p class="topic-lede">{{ topic.why }}</p>
          </div>
          <div class="topic-hero-task">
            <span>Task of the week</span>
            <strong>{{ topic.task.title }}</strong>
            <p>{{ topic.task.brief }}</p>
          </div>
        </section>

        <section class="topic-guidance" aria-labelledby="guidance-title">
          <div class="plan-section-head">
            <div>
              <p class="plans-section-kicker">Understand the topic</p>
              <h2 id="guidance-title">Why, how and what it changes in you</h2>
            </div>
            <p>
              Read this before the resources. The goal is not to recognise the words; it is to do
              the work and explain why it matters.
            </p>
          </div>

          <div class="topic-guidance-grid">
            <article class="topic-guidance-card">
              <span class="topic-guidance-icon"
                ><Icon name="lucide:circle-help" class="learning-icon"
              /></span>
              <h3>Why it matters</h3>
              <p>{{ topic.why }}</p>
            </article>
            <article class="topic-guidance-card">
              <span class="topic-guidance-icon"
                ><Icon name="lucide:hammer" class="learning-icon"
              /></span>
              <h3>How to implement it</h3>
              <p>{{ topic.how }}</p>
            </article>
            <article class="topic-guidance-card">
              <span class="topic-guidance-icon"
                ><Icon name="lucide:trending-up" class="learning-icon"
              /></span>
              <h3>How it improves you</h3>
              <p>{{ topic.impact }}</p>
            </article>
          </div>

          <div class="topic-brief">
            <div>
              <h3>Brief notes</h3>
              <p v-if="topic.body">{{ topic.body }}</p>
              <ul v-if="topic.list">
                <li v-for="entry in topic.list" :key="entry">{{ entry }}</li>
              </ul>
            </div>
            <div v-if="topic.links" class="topic-links">
              <h3>Topic links</h3>
              <a
                v-for="link in topic.links"
                :key="link.href"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ link.label }}
                <Icon name="lucide:arrow-up-right" class="learning-icon" />
              </a>
            </div>
          </div>
        </section>

        <section class="topic-section" aria-labelledby="resources-title">
          <div class="plan-section-head">
            <div>
              <p class="plans-section-kicker">Learn first</p>
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
            class="topic-resources"
            :class="{ 'is-single': !hasVideoResources || !hasReadingResources }"
          >
            <div v-if="hasVideoResources" class="topic-resource-column">
              <h3><Icon name="lucide:youtube" class="learning-icon" /> Watch</h3>
              <a
                v-for="resource in youtubeResources"
                :key="resource.href"
                :href="resource.href"
                class="topic-resource"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="topic-resource-kind">YouTube</span>
                <strong>{{ resource.title }}</strong>
                <span>{{ resource.source }}</span>
                <small>{{ resource.focus }}</small>
              </a>
            </div>
            <div v-if="hasReadingResources" class="topic-resource-column">
              <h3><Icon name="lucide:book-open" class="learning-icon" /> Read / use</h3>
              <a
                v-for="resource in readingResources"
                :key="resource.href"
                :href="resource.href"
                class="topic-resource"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="topic-resource-kind is-read">Read</span>
                <strong>{{ resource.title }}</strong>
                <span>{{ resource.source }}</span>
                <small>{{ resource.focus }}</small>
              </a>
            </div>
          </div>
        </section>

        <section class="topic-section" aria-labelledby="task-title">
          <div class="plan-section-head">
            <div>
              <p class="plans-section-kicker">Do the work</p>
              <h2 id="task-title">Task of the week</h2>
            </div>
            <p>
              Do this on a real ticket, repo or screen. Hints are there when you are stuck, not
              before you try.
            </p>
          </div>

          <div class="topic-task">
            <div class="topic-task-head">
              <span>Deliverable</span>
              <h3>{{ topic.task.title }}</h3>
              <p>{{ topic.task.brief }}</p>
            </div>
            <ol class="topic-task-steps">
              <li v-for="step in topic.task.steps" :key="step">{{ step }}</li>
            </ol>
            <div class="topic-hints">
              <h3><Icon name="lucide:lightbulb" class="learning-icon" /> Solution hints</h3>
              <ul>
                <li v-for="hint in topic.task.hints" :key="hint">{{ hint }}</li>
              </ul>
            </div>
            <div class="topic-done">
              <strong>Done when:</strong>
              {{ topic.task.doneWhen }}
            </div>
          </div>
        </section>

        <section class="topic-section" aria-labelledby="outcomes-title">
          <div class="plan-section-head">
            <div>
              <p class="plans-section-kicker">Prove it</p>
              <h2 id="outcomes-title">By the end of the week, you can</h2>
            </div>
            <p>
              These are the outcomes the quiz checks. If you cannot explain one, read that part
              again.
            </p>
          </div>
          <ul class="topic-outcomes">
            <li v-for="outcome in topic.outcomes" :key="outcome">
              <Icon name="lucide:check" class="learning-icon" />
              {{ outcome }}
            </li>
          </ul>
        </section>

        <section class="topic-section" aria-labelledby="quiz-title">
          <div class="plan-section-head">
            <div>
              <p class="plans-section-kicker">Pass the level</p>
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
.topic-hero {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr) 320px;
  gap: 28px;
  align-items: start;
  padding: 34px;
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
  border: 1px solid var(--line);
  border-top: 5px solid var(--phase-color);
  border-radius: 30px;
  box-shadow: var(--shadow);
}

.topic-hero-order {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
}

.topic-hero-order span {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 750;
  line-height: 1;
  color: var(--phase-color);
}

.topic-hero-order small {
  font-size: 0.68rem;
  color: var(--muted);
}

.topic-hero-copy {
  min-width: 0;
}

.topic-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 9px 14px;
  align-items: center;
  font-size: 0.84rem;
  color: var(--muted);
}

.topic-badge {
  padding: 4px 9px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--phase-color);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: color-mix(in oklab, var(--phase-color) 10%, var(--surface));
  border: 1px solid color-mix(in oklab, var(--phase-color) 30%, var(--line));
  border-radius: 6px;
}

.topic-passed {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-weight: 650;
  color: var(--success);
}

.topic-hero h1 {
  margin: 11px 0 11px;
  font-size: clamp(2.3rem, 4.4vw, 3.7rem);
  line-height: 1.01;
}

.topic-lede {
  max-width: 780px;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--muted);
}

.topic-hero-task {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
}

.topic-hero-task > span {
  display: block;
  margin-bottom: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--phase-color);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.topic-hero-task strong {
  display: block;
  font-size: 1rem;
  line-height: 1.35;
}

.topic-hero-task p {
  display: -webkit-box;
  margin: 8px 0 0;
  overflow: hidden;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}

.topic-guidance {
  margin-top: 68px;
}

.topic-guidance-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.topic-guidance-card {
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 19px;
}

.topic-guidance-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 14px;
  font-size: 1.15rem;
  color: var(--phase-color);
  background: color-mix(in oklab, var(--phase-color) 10%, var(--surface));
  border: 1px solid color-mix(in oklab, var(--phase-color) 24%, var(--line));
  border-radius: 12px;
  place-items: center;
}

.topic-guidance-card h3 {
  margin: 0 0 7px;
  font-size: 1.08rem;
}

.topic-guidance-card p {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.68;
  color: var(--muted);
}

.topic-brief {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(250px, 0.6fr);
  gap: 32px;
  padding: 24px;
  margin-top: 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
}

.topic-brief h3 {
  margin: 0 0 10px;
  font-size: 1.04rem;
}

.topic-brief p {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.68;
  color: var(--muted);
}

.topic-brief ul {
  display: grid;
  gap: 7px;
  padding-left: 20px;
  margin: 12px 0 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--muted);
}

.topic-links {
  padding-left: 28px;
  border-left: 1px solid var(--line);
}

.topic-links a {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.88rem;
  text-decoration: none;
  border-bottom: 1px solid var(--line);
}

.topic-links a:last-child {
  border-bottom: 0;
}

.topic-resources {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.topic-resources.is-single {
  grid-template-columns: 1fr;
}

.topic-resource-column {
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
}

.topic-resource-column > h3 {
  display: flex;
  gap: 7px;
  align-items: center;
  padding-bottom: 12px;
  margin: 0 0 4px;
  font-size: 1rem;
  border-bottom: 1px solid var(--line);
}

.topic-resource-column > h3 .learning-icon {
  color: var(--phase-color);
}

.topic-resource {
  display: grid;
  gap: 3px;
  padding: 13px 0;
  color: var(--ink) !important;
  text-decoration: none !important;
  border-bottom: 1px solid var(--line);
}

.topic-resource:last-child {
  border-bottom: 0;
}

.topic-resource:hover strong {
  color: var(--brand);
}

.topic-resource-kind {
  justify-self: start;
  padding: 2px 7px;
  font-size: 0.65rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: #c83b30;
  border-radius: 5px;
}

.topic-resource-kind.is-read {
  color: var(--on-brand);
  background: var(--brand);
}

.topic-resource strong {
  font-size: 0.94rem;
  line-height: 1.4;
  transition: color 0.15s ease;
}

.topic-resource > span:not(.topic-resource-kind) {
  font-size: 0.8rem;
  color: var(--muted);
}

.topic-resource small {
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--muted);
}

.topic-task {
  padding: 26px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 22px;
}

.topic-task-head {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
}

.topic-task-head > span {
  font-size: 0.73rem;
  font-weight: 800;
  color: var(--phase-color);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.topic-task-head h3 {
  margin: 6px 0 5px;
  font-size: 1.34rem;
}

.topic-task-head p {
  max-width: 840px;
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.65;
  color: var(--muted);
}

.topic-task-steps {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 30px;
  padding-left: 24px;
  margin: 20px 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--muted);
}

.topic-task-steps li {
  padding-left: 3px;
}

.topic-task-steps li::marker {
  font-weight: 800;
  color: var(--phase-color);
}

.topic-hints {
  padding: 18px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 15px;
}

.topic-hints h3 {
  display: flex;
  gap: 7px;
  align-items: center;
  margin: 0 0 9px;
  font-size: 0.94rem;
}

.topic-hints h3 .learning-icon {
  color: var(--warning-ink);
}

.topic-hints ul {
  display: grid;
  gap: 7px;
  padding-left: 20px;
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--muted);
}

.topic-done {
  padding: 16px 18px;
  margin-top: 14px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--muted);
  background: var(--brand-soft);
  border: 1px solid color-mix(in oklab, var(--brand) 24%, var(--line));
  border-radius: 13px;
}

.topic-done strong {
  color: var(--brand);
}

.topic-outcomes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.topic-outcomes li {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  padding: 16px 18px;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 13px;
}

.topic-outcomes .learning-icon {
  margin-top: 4px;
  color: var(--success);
}

@media (max-width: 1040px) {
  .topic-hero {
    grid-template-columns: 78px minmax(0, 1fr);
  }

  .topic-hero-task {
    grid-column: 2;
  }

  .topic-guidance-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .topic-hero {
    padding: 26px;
  }

  .topic-brief,
  .topic-resources,
  .topic-outcomes {
    grid-template-columns: 1fr;
  }

  .topic-links {
    padding-top: 18px;
    padding-left: 0;
    border-top: 1px solid var(--line);
    border-left: 0;
  }

  .topic-task-steps {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .topic-hero {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px;
    border-radius: 24px;
  }

  .topic-hero-order {
    flex-direction: row;
    gap: 6px;
    align-items: baseline;
    justify-content: flex-start;
    width: auto;
    height: auto;
    padding: 6px 10px;
    background: var(--surface-2);
    border-radius: 9px;
  }

  .topic-hero-order span {
    font-size: 1.25rem;
  }

  .topic-hero-task {
    grid-column: auto;
  }

  .topic-hero h1 {
    font-size: clamp(2.1rem, 10vw, 2.9rem);
  }

  .topic-guidance {
    margin-top: 48px;
  }

  .topic-task {
    padding: 20px;
  }

  .topic-brief {
    padding: 18px;
  }
}
</style>
