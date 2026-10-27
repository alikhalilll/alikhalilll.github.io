<script setup lang="ts">
import { computed } from 'vue';
import { useHead } from '#imports';

import type { PhaseKey } from '~/features/plan1/types';
import { getPlanSummary } from '../data';
import { getPlanRuntime } from '../planRuntime';
import { phasePath, plansPath, roadmapPath, topicPath } from '../routes';
import { usePlanProgress } from '../composables/usePlanProgress';
import FullStackDiagram from './FullStackDiagram.vue';
import LearningShell from './LearningShell.vue';
import PhaseRoadmap from './PhaseRoadmap.vue';
import PlanRoadmap from './PlanRoadmap.vue';

const props = defineProps<{
  planId: string;
}>();

const plan = computed(() => getPlanSummary(props.planId));
const runtime = computed(() => getPlanRuntime(props.planId));
const isPlan1 = computed(() => props.planId === 'plan-1');
const planRoles = computed(() => runtime.value?.roles ?? []);
const operations = computed(() => runtime.value?.operations);
const aiTools = computed(() => operations.value?.aiTools ?? []);
const conventions = computed(() => operations.value?.conventions ?? []);
const mainResources = computed(() => operations.value?.mainResources ?? []);
const resourceGroups = computed(() => operations.value?.resourceGroups ?? []);
const roles = computed(() => operations.value?.roles ?? []);
const schedule = computed(() => operations.value?.schedule ?? []);
const studyLoop = computed(() => operations.value?.studyLoop ?? []);
const weeklyRhythm = computed(() => operations.value?.weeklyRhythm ?? []);

const progress = usePlanProgress(props.planId);
const {
  completedPhases,
  completedTopics,
  getPhaseQuizStatus,
  getPhaseResult,
  getTopicResult,
  getTopicStatus,
  nextAction,
  phaseProgress,
  progressPercent,
  resetProgress,
} = progress;

useHead(() => ({
  title: plan.value ? `${plan.value.title} · Learning Paths` : 'Learning Paths',
}));

const nextHref = computed(() => {
  if (nextAction.value.kind === 'topic') {
    return topicPath(props.planId, nextAction.value.topic.id);
  }
  if (nextAction.value.kind === 'phase') {
    return phasePath(props.planId, nextAction.value.phase.key);
  }
  return '#roles';
});

const nextLabel = computed(() => {
  if (nextAction.value.kind === 'topic') {
    return completedTopics.value === 0
      ? 'Start the first topic'
      : `Continue: ${nextAction.value.topic.title}`;
  }
  if (nextAction.value.kind === 'phase') {
    return `Take the ${nextAction.value.phase.title} phase quiz`;
  }
  return 'All phases passed · review your roles';
});

const nextHint = computed(() => {
  if (nextAction.value.kind === 'topic') {
    return `Next up · W${nextAction.value.topic.week} · ${nextAction.value.topic.title}`;
  }
  if (nextAction.value.kind === 'phase') {
    return `Phase gate · pass it to add ${nextAction.value.phase.role.title}`;
  }
  return 'You have completed the full path.';
});

const confirmReset = () => {
  if (window.confirm('Reset all topic progress, phase passes and quiz scores for this plan?')) {
    resetProgress();
  }
};

const roleStatus = (phaseKey: PhaseKey) => {
  const result = getPhaseResult(phaseKey);
  return result?.passed ? 'complete' : 'locked';
};

const currentPhaseKey = computed(() => {
  if (nextAction.value.kind === 'phase') return nextAction.value.phase.key;
  if (nextAction.value.kind === 'topic') return nextAction.value.topic.phase;
  return undefined;
});

const jumpLinks = computed(() => [
  { href: '#roadmap', label: 'Roadmap', icon: 'lucide:map' },
  ...(isPlan1.value ? [] : [{ href: '#stack', label: 'Stack tree', icon: 'lucide:git-fork' }]),
  { href: '#roles', label: 'Roles', icon: 'lucide:badge-check' },
  { href: '#operations', label: 'Weekly system', icon: 'lucide:repeat-2' },
  { href: '#resources', label: 'Resources', icon: 'lucide:library' },
]);
</script>

<template>
  <LearningShell
    wide
    :back-to="plansPath()"
    back-label="All plans"
    :progress-label="`${completedTopics} topics passed`"
    :progress-percent="progressPercent"
  >
    <template v-if="plan?.status === 'available'">
      <section class="plan-hero" :data-tone="plan.tone">
        <div class="plan-hero-copy">
          <p class="plans-eyebrow">{{ plan.shortTitle }} · {{ plan.subtitle }}</p>
          <h1>{{ plan.title }}</h1>
          <p>{{ plan.description }}</p>

          <div class="plan-hero-actions">
            <NuxtLink :to="nextHref" class="learning-button learning-button-primary">
              {{ nextLabel }}
              <Icon name="lucide:arrow-right" class="learning-icon" />
            </NuxtLink>
            <a href="#roadmap" class="learning-button learning-button-soft">
              View roadmap
              <Icon name="lucide:map" class="learning-icon" />
            </a>
          </div>
          <p class="plan-next-hint">
            <Icon name="lucide:flag" class="learning-icon" />
            {{ nextHint }}
          </p>

          <div class="plan-hero-stats">
            <span
              ><strong>{{ plan.weeks }}</strong> weeks</span
            >
            <span
              ><strong>{{ plan.topics }}</strong> topics</span
            >
            <span
              ><strong>{{ completedTopics }}</strong> passed</span
            >
            <span
              ><strong>{{ completedPhases }}</strong> roles earned</span
            >
          </div>
        </div>

        <aside class="plan-hero-side">
          <div class="plan-hero-side-head">
            <span>Your progress</span>
            <small>
              <Icon name="lucide:cloud-check" class="learning-icon" />
              Saved locally
            </small>
          </div>

          <div class="plan-hero-progress">
            <div class="plans-progress-ring" :style="{ '--p': progressPercent }">
              <span>{{ progressPercent }}%</span>
            </div>
            <div>
              <strong>{{ completedTopics }} / {{ plan.topics }} topics</strong>
              <span>{{ completedPhases }} / {{ plan.phases }} phase gates passed</span>
            </div>
          </div>

          <div class="plan-hero-phases">
            <div
              v-for="phase in phaseProgress"
              :key="phase.key"
              class="plan-hero-phase"
              :data-tone="phase.tone"
              :data-current="currentPhaseKey === phase.key"
            >
              <div class="plan-hero-phase-row">
                <span>
                  <i />
                  {{ phase.title }}
                </span>
                <strong>{{ phase.percent }}%</strong>
              </div>
              <div class="roadmap-progress-track">
                <span :style="{ width: `${phase.percent}%` }" />
              </div>
            </div>
          </div>

          <div class="plan-hero-roles">
            <span class="plan-card-label">Roles you unlock</span>
            <span
              v-for="role in planRoles"
              :key="role.title"
              class="plan-role-chip"
              :data-tone="role.tone"
              :data-status="roleStatus(role.phase)"
            >
              <Icon
                :name="
                  roleStatus(role.phase) === 'complete' ? 'lucide:circle-check-big' : 'lucide:lock'
                "
                class="learning-icon"
              />
              {{ role.title }}
            </span>
          </div>
        </aside>
      </section>

      <nav class="plan-jump-nav" aria-label="Plan sections">
        <div class="plan-jump-inner">
          <span class="plan-jump-label">Jump to</span>
          <a v-for="link in jumpLinks" :key="link.href" :href="link.href">
            <Icon :name="link.icon" class="learning-icon" />
            {{ link.label }}
          </a>
          <span class="plan-jump-progress">
            <strong>{{ progressPercent }}%</strong>
            complete
          </span>
        </div>
      </nav>

      <section id="roadmap" class="plan-section" aria-labelledby="roadmap-title">
        <div class="plan-section-head">
          <div>
            <p class="plans-section-kicker">The roadmap</p>
            <h2 id="roadmap-title">{{ plan.topics }} topics, in the order they make sense</h2>
          </div>
          <p>
            Each node is one topic. Open it for the why, the implementation steps, the weekly task
            and free resources. Pass the topic quiz to unlock the next node. Finish a phase, pass
            its gate, and a new role is added to your profile.
          </p>
        </div>

        <PlanRoadmap
          v-if="isPlan1"
          :plan-id="planId"
          :phase-progress="phaseProgress"
          :next-action="nextAction"
          :get-topic-status="getTopicStatus"
          :get-topic-result="getTopicResult"
          :get-phase-quiz-status="getPhaseQuizStatus"
          :get-phase-result="getPhaseResult"
        />
        <PhaseRoadmap
          v-else
          :plan-id="planId"
          :phase-progress="phaseProgress"
          :next-action="nextAction"
          :get-topic-status="getTopicStatus"
          :get-topic-result="getTopicResult"
          :get-phase-quiz-status="getPhaseQuizStatus"
          :get-phase-result="getPhaseResult"
        />
      </section>

      <section v-if="!isPlan1" id="stack" class="plan-section" aria-labelledby="stack-title">
        <div class="plan-section-head">
          <div>
            <p class="plans-section-kicker">Architecture</p>
            <h2 id="stack-title">The full-stack roadmap tree</h2>
          </div>
          <p>
            Start at the product root, then open each branch: the Vue interface, the Laravel
            boundary, the data layer and the delivery path that turns working code into a release.
          </p>
        </div>

        <FullStackDiagram />
      </section>

      <section id="roles" class="plan-section" aria-labelledby="roles-title">
        <div class="plan-section-head">
          <div>
            <p class="plans-section-kicker">What you become</p>
            <h2 id="roles-title">Every phase adds a role</h2>
          </div>
          <p>
            The role is not a certificate for watching videos. It is added after you pass the phase
            gate and can show the output that proves it.
          </p>
        </div>

        <div class="plan-roles">
          <article
            v-for="role in planRoles"
            :key="role.title"
            class="plan-role-card"
            :data-tone="role.tone"
            :data-status="roleStatus(role.phase)"
          >
            <div class="plan-role-card-top">
              <span>Phase {{ role.number }} · {{ role.weeks }}</span>
              <span class="plan-role-status">
                <Icon
                  :name="
                    roleStatus(role.phase) === 'complete'
                      ? 'lucide:circle-check-big'
                      : 'lucide:lock'
                  "
                  class="learning-icon"
                />
                {{ roleStatus(role.phase) === 'complete' ? 'Earned' : 'Locked' }}
              </span>
            </div>
            <h3>{{ role.title }}</h3>
            <p>{{ role.summary }}</p>
            <ul>
              <li v-for="responsibility in role.responsibilities" :key="responsibility">
                {{ responsibility }}
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section id="operations" class="plan-section" aria-labelledby="operations-title">
        <div class="plan-section-head">
          <div>
            <p class="plans-section-kicker">How it runs</p>
            <h2 id="operations-title">A small operating system for the week</h2>
          </div>
          <p>
            Every week follows the same loop. Every phase follows Learn → Practice → Prove. Nobody
            moves on until the quiz and the output are real.
          </p>
        </div>

        <div class="plan-loop">
          <article v-for="step in studyLoop" :key="step.step" class="plan-loop-card">
            <div class="plan-loop-top">
              <span>{{ step.step }}</span>
              <small>{{ step.time }}</small>
            </div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </article>
        </div>

        <div class="plan-operations-grid">
          <article class="plan-panel">
            <div class="plan-panel-head">
              <h3>Weekly rhythm</h3>
              <span>10–12 hrs</span>
            </div>
            <ul class="plan-check-list">
              <li v-for="item in weeklyRhythm" :key="item">
                <Icon name="lucide:check" class="learning-icon" />
                {{ item }}
              </li>
            </ul>
            <div class="plan-schedule">
              <div v-for="(item, index) in schedule" :key="`${item.day}-${index}`">
                <span>{{ item.day }}</span>
                <strong>{{ item.activity }}</strong>
                <small>{{ item.time }}</small>
              </div>
            </div>
          </article>

          <article class="plan-panel">
            <div class="plan-panel-head">
              <h3>Who does what</h3>
              <span>Team roles</span>
            </div>
            <div class="plan-team-roles">
              <div v-for="role in roles" :key="role.role">
                <strong>{{ role.role }}</strong>
                <p>{{ role.responsibility }}</p>
              </div>
            </div>
          </article>

          <article class="plan-panel">
            <div class="plan-panel-head">
              <h3>Conventions</h3>
              <span>Team rules</span>
            </div>
            <div class="plan-conventions">
              <div v-for="item in conventions" :key="item.title">
                <strong>{{ item.title }}</strong>
                <p>{{ item.body }}</p>
              </div>
            </div>
          </article>

          <article class="plan-panel">
            <div class="plan-panel-head">
              <h3>AI tools</h3>
              <span>Use, then verify</span>
            </div>
            <div class="plan-tools">
              <a
                v-for="tool in aiTools"
                :key="tool.name"
                :href="tool.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div>
                  <strong>{{ tool.name }}</strong>
                  <p>{{ tool.use }}</p>
                </div>
                <span>{{ tool.label }}</span>
                <Icon name="lucide:arrow-up-right" class="learning-icon" />
              </a>
            </div>
          </article>
        </div>
      </section>

      <section id="resources" class="plan-section" aria-labelledby="resources-title">
        <div class="plan-section-head">
          <div>
            <p class="plans-section-kicker">Resource library</p>
            <h2 id="resources-title">Free material worth your time</h2>
          </div>
          <p>
            Every topic page repeats the exact videos and readings for that week. This is the
            shortlist if you want to browse the whole plan first.
          </p>
        </div>

        <div class="plan-resource-groups">
          <article
            v-for="group in resourceGroups"
            :key="group.key"
            class="plan-resource-card"
            :data-tone="group.tone"
          >
            <h3>{{ group.label }}</h3>
            <a
              v-for="item in group.items"
              :key="item.href"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.label }}
              <Icon name="lucide:arrow-up-right" class="learning-icon" />
            </a>
          </article>
        </div>

        <div class="plan-main-resources">
          <span>Start here</span>
          <a
            v-for="item in mainResources"
            :key="item.href"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ item.label }}
            <Icon name="lucide:arrow-up-right" class="learning-icon" />
          </a>
        </div>
      </section>

      <section class="plan-reset">
        <div>
          <h2>Want a clean run?</h2>
          <p>
            This clears topic passes, phase gates and quiz scores for this plan in this browser.
          </p>
        </div>
        <button type="button" class="learning-button learning-button-danger" @click="confirmReset">
          <Icon name="lucide:rotate-ccw" class="learning-icon" />
          Reset plan progress
        </button>
      </section>
    </template>

    <section v-else-if="plan" class="plan-coming-soon">
      <div class="plan-coming-card" :data-tone="plan.tone">
        <span class="plans-eyebrow">Plan {{ plan.number }}</span>
        <h1>{{ plan.title }} is coming next</h1>
        <p>{{ plan.description }}</p>
        <div class="plan-card-stats">
          <span
            ><strong>{{ plan.weeks }}</strong> weeks</span
          >
          <span
            ><strong>{{ plan.phases }}</strong> phases</span
          >
          <span
            ><strong>{{ plan.roles.length }}</strong> roles</span
          >
        </div>
        <ul class="plan-card-preview">
          <li v-for="item in plan.preview" :key="item">
            <Icon name="lucide:check" class="learning-icon" />
            {{ item }}
          </li>
        </ul>
        <NuxtLink :to="roadmapPath('plan-1')" class="learning-button learning-button-primary">
          Start with Plan 1
          <Icon name="lucide:arrow-right" class="learning-icon" />
        </NuxtLink>
      </div>
    </section>

    <section v-else class="plan-coming-soon">
      <div class="plan-coming-card">
        <h1>Plan not found</h1>
        <p>That learning plan does not exist yet.</p>
        <NuxtLink :to="plansPath()" class="learning-button learning-button-primary">
          Back to all plans
        </NuxtLink>
      </div>
    </section>
  </LearningShell>
</template>

<style scoped>
.plan-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 34px;
  align-items: center;
  padding: 38px;
  background:
    radial-gradient(
      circle at 92% 4%,
      color-mix(in oklab, var(--phase-color) 13%, transparent),
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

.plan-hero-copy h1 {
  margin: 9px 0 14px;
  font-size: clamp(2.7rem, 4.8vw, 4.2rem);
  line-height: 0.98;
  letter-spacing: -0.045em;
}

.plan-hero-copy > p:not(.plans-eyebrow, .plan-next-hint) {
  max-width: 680px;
  margin: 0;
  font-size: 1.06rem;
  line-height: 1.7;
  color: var(--muted);
}

.plan-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.plan-next-hint {
  display: flex;
  gap: 7px;
  align-items: center;
  margin: 14px 0 0;
  font-size: 0.86rem;
  color: var(--muted);
}

.plan-hero-side {
  display: grid;
  gap: 20px;
  padding: 22px;
  background: color-mix(in oklab, var(--surface) 84%, transparent);
  border: 1px solid var(--line);
  border-radius: 22px;
  backdrop-filter: blur(12px);
}

.plan-hero-side-head {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 2px;
  border-bottom: 1px solid var(--line);
}

.plan-hero-side-head > span {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.plan-hero-side-head small {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 650;
  color: var(--success);
}

.plan-hero-progress {
  display: flex;
  gap: 16px;
  align-items: center;
}

.plan-hero-progress > div:last-child {
  display: grid;
  gap: 3px;
}

.plan-hero-progress strong {
  font-size: 1rem;
}

.plan-hero-progress span {
  font-size: 0.82rem;
  color: var(--muted);
}

.plan-hero-phases {
  display: grid;
  gap: 11px;
}

.plan-hero-phase {
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 8px;
}

.plan-hero-phase[data-current='true'] {
  background: color-mix(in oklab, var(--phase-color) 7%, transparent);
  border-color: color-mix(in oklab, var(--phase-color) 22%, var(--line));
}

.plan-hero-phase-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.8rem;
  color: var(--muted);
}

.plan-hero-phase-row > span {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  min-width: 0;
}

.plan-hero-phase-row i {
  flex: none;
  width: 7px;
  height: 7px;
  background: var(--phase-color);
  border-radius: 999px;
}

.plan-hero-phase-row strong {
  flex: none;
  color: var(--phase-color);
}

.plan-hero-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.plan-hero-roles .plan-card-label {
  width: 100%;
}

.plan-role-chip {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 5px 9px;
  font-size: 0.78rem;
  color: var(--muted);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 7px;
}

.plan-role-chip[data-status='complete'] {
  color: var(--ink);
  background: var(--success-soft);
  border-color: color-mix(in oklab, var(--success) 28%, var(--line));
}

.plan-role-chip[data-status='complete'] .learning-icon {
  color: var(--success);
}

.plan-role-chip[data-status='locked'] .learning-icon {
  color: var(--line-strong);
}

.plan-jump-nav {
  position: sticky;
  top: 72px;
  z-index: 20;
  padding: 8px;
  margin-top: 22px;
  background: color-mix(in oklab, var(--bg) 86%, transparent);
  border: 1px solid var(--line);
  border-radius: 14px;
  backdrop-filter: blur(18px);
}

.plan-jump-inner {
  display: flex;
  gap: 5px;
  align-items: center;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.plan-jump-inner::-webkit-scrollbar {
  display: none;
}

.plan-jump-label {
  flex: none;
  padding: 0 8px 0 4px;
  font-size: 0.66rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.plan-jump-inner a {
  display: inline-flex;
  flex: none;
  gap: 5px;
  align-items: center;
  padding: 7px 10px;
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--muted) !important;
  text-decoration: none !important;
  border: 1px solid transparent;
  border-radius: 8px;
}

.plan-jump-inner a:hover {
  color: var(--ink) !important;
  background: var(--surface);
  border-color: var(--line);
}

.plan-jump-inner a .learning-icon {
  color: var(--brand);
}

.plan-jump-progress {
  display: inline-flex;
  flex: none;
  gap: 4px;
  align-items: center;
  padding: 6px 9px;
  margin-left: auto;
  font-size: 0.72rem;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.plan-jump-progress strong {
  color: var(--brand);
}

.plan-loop {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.plan-loop-card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
}

.plan-loop-top {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.plan-loop-top span {
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--brand);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.plan-loop-top small {
  font-size: 0.72rem;
  color: var(--muted);
}

.plan-loop-card h3 {
  margin: 0 0 6px;
  font-size: 1.06rem;
  line-height: 1.25;
}

.plan-loop-card p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--muted);
}

.plan-operations-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.plan-panel {
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
}

.plan-panel-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.plan-panel-head h3 {
  margin: 0;
  font-size: 1.12rem;
}

.plan-panel-head span {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.plan-check-list {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0 0 18px;
  list-style: none;
}

.plan-check-list li {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--muted);
}

.plan-check-list .learning-icon {
  margin-top: 4px;
  color: var(--brand);
}

.plan-schedule {
  display: grid;
  gap: 0;
  border-top: 1px solid var(--line);
}

.plan-schedule > div {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: baseline;
  padding: 9px 0;
  font-size: 0.84rem;
  border-bottom: 1px solid var(--line);
}

.plan-schedule span {
  font-weight: 700;
  color: var(--ink);
}

.plan-schedule strong {
  font-weight: 500;
  color: var(--muted);
}

.plan-schedule small {
  color: var(--muted);
}

.plan-team-roles {
  display: grid;
  gap: 15px;
}

.plan-team-roles strong {
  font-size: 0.94rem;
}

.plan-team-roles p {
  margin: 3px 0 0;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--muted);
}

.plan-conventions {
  display: grid;
  gap: 15px;
}

.plan-conventions strong {
  font-size: 0.94rem;
}

.plan-conventions p {
  margin: 3px 0 0;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--muted);
}

.plan-tools {
  display: grid;
  gap: 10px;
}

.plan-tools a {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  color: var(--ink) !important;
  text-decoration: none !important;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 11px;
}

.plan-tools a:hover {
  border-color: var(--brand);
}

.plan-tools strong {
  display: block;
  font-size: 0.9rem;
}

.plan-tools p {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: var(--muted);
}

.plan-tools span {
  font-size: 0.78rem;
  color: var(--muted);
}

.plan-tools .learning-icon {
  color: var(--brand);
}

.plan-resource-groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.plan-resource-card {
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-top: 4px solid var(--phase-color);
  border-radius: 18px;
}

.plan-resource-card h3 {
  margin: 0 0 12px;
  font-size: 1.02rem;
}

.plan-resource-card a {
  display: flex;
  gap: 7px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 0.86rem;
  line-height: 1.5;
  text-decoration: none;
  border-bottom: 1px solid var(--line);
}

.plan-resource-card a:last-child {
  border-bottom: 0;
}

.plan-resource-card a .learning-icon {
  margin-top: 4px;
  font-size: 0.9rem;
}

.plan-main-resources {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  align-items: center;
  padding: 16px 18px;
  margin-top: 16px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 16px;
}

.plan-main-resources > span {
  margin-right: 4px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.plan-main-resources a {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 5px 10px;
  font-size: 0.82rem;
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 7px;
}

.plan-reset {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  padding: 26px;
  margin-top: 68px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
}

.plan-reset h2 {
  margin: 0 0 4px;
  font-size: 1.18rem;
}

.plan-reset p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.plan-section {
  scroll-margin-top: 144px;
}

@media (max-width: 1080px) {
  .plan-hero {
    grid-template-columns: 1fr;
  }

  .plan-hero-side {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }

  .plan-hero-side-head,
  .plan-hero-progress,
  .plan-hero-roles {
    grid-column: span 2;
  }

  .plan-loop {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .plan-hero {
    padding: 24px;
  }

  .plan-hero-side {
    grid-template-columns: 1fr;
  }

  .plan-hero-side-head,
  .plan-hero-progress,
  .plan-hero-roles {
    grid-column: auto;
  }

  .plan-operations-grid,
  .plan-resource-groups {
    grid-template-columns: 1fr;
  }

  .plan-reset {
    display: block;
  }

  .plan-reset .learning-button {
    width: 100%;
    margin-top: 14px;
  }
}

@media (max-width: 680px) {
  .plan-jump-nav {
    top: 64px;
    padding: 6px;
    margin-top: 16px;
  }

  .plan-jump-label,
  .plan-jump-progress {
    display: none;
  }

  .plan-jump-inner {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
    overflow: visible;
  }

  .plan-jump-inner a {
    justify-content: center;
  }

  .plan-jump-inner a:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }

  .plan-section {
    scroll-margin-top: 152px;
  }
}

@media (max-width: 560px) {
  .plan-hero {
    padding: 20px;
    border-radius: 22px;
  }

  .plan-hero-actions .learning-button {
    width: 100%;
  }

  .plan-loop {
    grid-template-columns: 1fr;
  }

  .plan-panel {
    padding: 16px;
  }

  .plan-schedule > div {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .plan-schedule small {
    grid-column: 2;
  }
}
</style>
