<script setup lang="ts">
interface TreeLeaf {
  label: string;
  detail: string;
}

interface TreeBranch {
  key: string;
  kicker: string;
  title: string;
  subtitle: string;
  summary: string;
  icon: string;
  tone: string;
  leaves: TreeLeaf[];
}

const branches: TreeBranch[] = [
  {
    key: 'frontend',
    kicker: 'Branch 01 · Client',
    title: 'Frontend',
    subtitle: 'Vue 3 SPA',
    summary: 'The interface, navigation and state that turn user intent into API calls.',
    icon: 'lucide:monitor-smartphone',
    tone: 'violet',
    leaves: [
      { label: 'Vue Router', detail: 'Pages, layouts and navigation guards' },
      { label: 'Pinia stores', detail: 'Shared state and server-state caching' },
      { label: 'Components', detail: 'Reusable UI, forms and loading states' },
      { label: 'API client', detail: 'Typed requests, errors and retries' },
    ],
  },
  {
    key: 'backend',
    kicker: 'Branch 02 · Server',
    title: 'Backend',
    subtitle: 'Laravel API',
    summary: 'The contract, authorization and business rules that protect the domain.',
    icon: 'lucide:server',
    tone: 'blue',
    leaves: [
      { label: 'Routes & middleware', detail: 'Versioned endpoints and throttling' },
      { label: 'Validation', detail: 'Form requests before the domain runs' },
      { label: 'Controllers & actions', detail: 'Small entry points around real logic' },
      { label: 'Policies & resources', detail: 'Authorization and predictable JSON' },
    ],
  },
  {
    key: 'data',
    kicker: 'Branch 03 · Persistence',
    title: 'Data',
    subtitle: 'MySQL · Redis · S3',
    summary: 'The source of truth, the fast path and the work that happens later.',
    icon: 'lucide:database',
    tone: 'teal',
    leaves: [
      { label: 'MySQL', detail: 'Schema, indexes and transactions' },
      { label: 'Redis', detail: 'Cache, sessions and rate limits' },
      { label: 'Queue workers', detail: 'Jobs, events and retries' },
      { label: 'Object storage', detail: 'Uploads and generated files' },
    ],
  },
  {
    key: 'delivery',
    kicker: 'Branch 04 · Operations',
    title: 'Delivery',
    subtitle: 'CI/CD & observability',
    summary: 'The repeatable release path that turns working code into a safe deployment.',
    icon: 'lucide:rocket',
    tone: 'amber',
    leaves: [
      { label: 'Automated tests', detail: 'Unit, feature and API coverage' },
      { label: 'GitHub Actions', detail: 'Lint, test, build and release gates' },
      { label: 'Docker', detail: 'One image for staging and production' },
      { label: 'Logs & alerts', detail: 'Health checks, metrics and rollback' },
    ],
  },
];
</script>

<template>
  <div class="stack-tree" role="group" aria-label="Full-stack architecture tree">
    <div class="tree-toolbar">
      <div>
        <span class="tree-kicker">Tree view</span>
        <strong>One system, four branches</strong>
      </div>
      <span class="tree-note">
        <Icon name="lucide:git-fork" class="learning-icon" />
        Root → branch → capability
      </span>
    </div>

    <div class="tree-canvas">
      <div class="tree-root">
        <span class="tree-root-icon">
          <Icon name="lucide:workflow" class="learning-icon" />
        </span>
        <div>
          <span>Full-stack roadmap</span>
          <strong>Product engineering</strong>
          <small>Client → API → Data → Delivery</small>
        </div>
      </div>

      <div class="tree-root-stem" aria-hidden="true" />

      <div class="tree-branches">
        <section
          v-for="(branch, index) in branches"
          :key="branch.key"
          class="tree-branch"
          :data-tone="branch.tone"
        >
          <article class="tree-branch-head">
            <div class="tree-branch-top">
              <span class="tree-branch-icon">
                <Icon :name="branch.icon" class="learning-icon" />
              </span>
              <span class="tree-branch-index">0{{ index + 1 }}</span>
            </div>
            <span class="tree-branch-kicker">{{ branch.kicker }}</span>
            <h3>{{ branch.title }}</h3>
            <small>{{ branch.subtitle }}</small>
            <p>{{ branch.summary }}</p>
          </article>

          <ul class="tree-leaves">
            <li v-for="leaf in branch.leaves" :key="leaf.label" class="tree-leaf">
              <div>
                <strong>{{ leaf.label }}</strong>
                <span>{{ leaf.detail }}</span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div class="tree-legend">
      <span class="tree-legend-label">Read the tree</span>
      <span><i class="is-root" /> Root: the system</span>
      <span><i class="is-branch" /> Branch: a layer</span>
      <span><i class="is-leaf" /> Leaf: a capability</span>
    </div>
  </div>
</template>

<style scoped>
.stack-tree {
  position: relative;
  padding: 22px;
  overflow: hidden;
  background:
    radial-gradient(var(--dot) 1px, transparent 1px) 0 0 / 16px 16px,
    var(--surface);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: var(--shadow-sm);
}

.tree-toolbar {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px 16px;
  border-bottom: 1px solid var(--line);
}

.tree-toolbar > div {
  display: grid;
  gap: 2px;
}

.tree-kicker {
  font-size: 0.66rem;
  font-weight: 800;
  color: var(--brand);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.tree-toolbar strong {
  font-family: var(--font-display);
  font-size: 1rem;
  line-height: 1.3;
}

.tree-note {
  display: inline-flex;
  flex: none;
  gap: 5px;
  align-items: center;
  padding: 5px 9px;
  font-size: 0.7rem;
  font-weight: 650;
  color: var(--muted);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: 999px;
}

.tree-note .learning-icon {
  color: var(--brand);
}

.tree-canvas {
  padding: 24px 12px 18px;
}

.tree-root {
  display: flex;
  gap: 12px;
  align-items: center;
  width: min(100%, 390px);
  padding: 14px 16px;
  margin: 0 auto;
  background: linear-gradient(
    145deg,
    color-mix(in oklab, var(--brand) 12%, var(--surface)),
    var(--surface)
  );
  border: 1px solid color-mix(in oklab, var(--brand) 34%, var(--line));
  border-radius: 14px;
  box-shadow: 0 16px 30px -28px color-mix(in oklab, var(--brand) 55%, transparent);
}

.tree-root-icon {
  display: grid;
  flex: none;
  width: 38px;
  height: 38px;
  font-size: 1.05rem;
  color: var(--brand);
  background: var(--surface);
  border: 1px solid color-mix(in oklab, var(--brand) 24%, var(--line));
  border-radius: 10px;
  place-items: center;
}

.tree-root > div {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.tree-root > div > span {
  font-size: 0.58rem;
  font-weight: 800;
  color: var(--brand);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

.tree-root strong {
  font-family: var(--font-display);
  font-size: 1.08rem;
  line-height: 1.2;
}

.tree-root small {
  font-size: 0.7rem;
  color: var(--muted);
}

.tree-root-stem {
  width: 1px;
  height: 30px;
  margin: 0 auto;
  background: linear-gradient(var(--brand), var(--line-strong));
}

.tree-branches {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  padding-top: 28px;
}

.tree-branches::before {
  position: absolute;
  top: 0;
  right: 12.5%;
  left: 12.5%;
  height: 1px;
  content: '';
  background: linear-gradient(
    90deg,
    transparent,
    var(--line-strong) 8%,
    var(--line-strong) 92%,
    transparent
  );
}

.tree-branch {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.tree-branch::before {
  position: absolute;
  top: -28px;
  left: 50%;
  width: 1px;
  height: 28px;
  content: '';
  background: var(--line-strong);
}

.tree-branch::after {
  position: absolute;
  top: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  content: '';
  background: var(--surface);
  border: 2px solid var(--phase-color);
  border-radius: 999px;
  transform: translateX(-50%);
}

.tree-branch-head {
  display: flex;
  flex-direction: column;
  min-height: 178px;
  padding: 14px;
  background: linear-gradient(
    160deg,
    color-mix(in oklab, var(--phase-color) 9%, var(--surface)),
    var(--surface)
  );
  border: 1px solid color-mix(in oklab, var(--phase-color) 20%, var(--line));
  border-top: 3px solid var(--phase-color);
  border-radius: 12px;
}

.tree-branch-top {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tree-branch-icon {
  display: grid;
  width: 30px;
  height: 30px;
  font-size: 0.82rem;
  color: var(--phase-color);
  background: var(--surface);
  border: 1px solid color-mix(in oklab, var(--phase-color) 22%, var(--line));
  border-radius: 8px;
  place-items: center;
}

.tree-branch-index {
  font-family: var(--font-display);
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1;
  color: var(--phase-color);
  opacity: 0.35;
}

.tree-branch-kicker {
  font-size: 0.56rem;
  font-weight: 800;
  color: var(--phase-color);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tree-branch-head h3 {
  margin: 1px 0 0;
  font-size: 1rem;
  line-height: 1.2;
}

.tree-branch-head small {
  margin-top: 1px;
  font-size: 0.66rem;
  color: var(--muted);
}

.tree-branch-head p {
  margin: auto 0 0;
  padding-top: 9px;
  font-size: 0.7rem;
  line-height: 1.45;
  color: var(--muted);
}

.tree-leaves {
  position: relative;
  display: grid;
  gap: 6px;
  padding: 0 0 0 16px;
  margin: 0;
  list-style: none;
}

.tree-leaves::before {
  position: absolute;
  top: -10px;
  bottom: 17px;
  left: 4px;
  width: 1px;
  content: '';
  background: linear-gradient(var(--line-strong), var(--line));
}

.tree-leaf {
  position: relative;
  padding: 8px 9px;
  background: color-mix(in oklab, var(--phase-color) 3%, var(--surface));
  border: 1px solid var(--line);
  border-radius: 8px;
}

.tree-leaf::before {
  position: absolute;
  top: 17px;
  left: -12px;
  width: 12px;
  height: 1px;
  content: '';
  background: var(--line-strong);
}

.tree-leaf::after {
  position: absolute;
  top: 14px;
  left: -15px;
  width: 6px;
  height: 6px;
  content: '';
  background: var(--surface);
  border: 1px solid var(--phase-color);
  border-radius: 999px;
}

.tree-leaf > div {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.tree-leaf strong {
  font-size: 0.75rem;
  font-weight: 650;
  line-height: 1.3;
}

.tree-leaf span {
  font-size: 0.65rem;
  line-height: 1.4;
  color: var(--muted);
}

.tree-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  padding: 12px 2px 0;
  font-size: 0.68rem;
  color: var(--muted);
  border-top: 1px solid var(--line);
}

.tree-legend-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--ink);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tree-legend > span {
  display: inline-flex;
  gap: 5px;
  align-items: center;
}

.tree-legend i {
  width: 7px;
  height: 7px;
  border-radius: 999px;
}

.tree-legend .is-root {
  background: var(--brand);
}

.tree-legend .is-branch {
  background: var(--surface);
  border: 2px solid var(--brand);
}

.tree-legend .is-leaf {
  background: var(--line-strong);
}

@media (max-width: 1180px) {
  .tree-root {
    width: min(100%, 390px);
    margin: 0;
  }

  .tree-root-stem {
    height: 20px;
    margin-left: 20px;
  }

  .tree-branches {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 0 0 0 24px;
    margin-left: 20px;
    border-left: 1px solid var(--line-strong);
  }

  .tree-branches::before {
    display: none;
  }

  .tree-branch::before {
    top: 28px;
    left: -24px;
    width: 24px;
    height: 1px;
  }

  .tree-branch::after {
    top: 25px;
    left: -28px;
    width: 7px;
    height: 7px;
    border-width: 2px;
    transform: none;
  }

  .tree-branch-head {
    min-height: 0;
  }
}

@media (max-width: 760px) {
  .stack-tree {
    padding: 16px;
    border-radius: 18px;
  }

  .tree-toolbar {
    display: block;
  }

  .tree-note {
    margin-top: 9px;
  }

  .tree-canvas {
    padding: 18px 0 14px;
  }

  .tree-root {
    width: 100%;
  }

  .tree-branches {
    margin-left: 16px;
    padding-left: 20px;
  }

  .tree-root-stem {
    margin-left: 16px;
  }

  .tree-branch::before {
    left: -20px;
    width: 20px;
  }

  .tree-branch::after {
    left: -24px;
  }
}
</style>
