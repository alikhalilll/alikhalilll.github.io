<script setup lang="ts">
import { useHead } from '#imports';

import { useLearningTheme } from '../composables/useLearningTheme';
import { plansPath } from '../routes';

withDefaults(
  defineProps<{
    backLabel?: string;
    backTo?: string;
    progressLabel?: string;
    progressPercent?: number;
    wide?: boolean;
  }>(),
  {
    backLabel: 'Back',
    backTo: undefined,
    progressLabel: undefined,
    progressPercent: undefined,
    wide: false,
  }
);

const { theme, toggleTheme } = useLearningTheme();

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap',
    },
  ],
});
</script>

<template>
  <div class="learning-page" :data-theme="theme">
    <header class="learning-topbar">
      <div class="learning-topbar-inner" :class="{ 'is-wide': wide }">
        <NuxtLink :to="plansPath()" class="learning-brand">
          <span class="learning-brand-mark">LP</span>
          <span class="learning-brand-copy">
            <strong>Learning Paths</strong>
            <small>2 complete plans</small>
          </span>
        </NuxtLink>

        <NuxtLink v-if="backTo" :to="backTo" class="learning-back">
          <Icon name="lucide:arrow-left" class="learning-icon" />
          {{ backLabel }}
        </NuxtLink>

        <div class="learning-topbar-actions">
          <div v-if="progressLabel" class="learning-progress-pill">
            <span class="learning-progress-ring" :style="{ '--p': progressPercent ?? 0 }">
              <span>{{ progressPercent ?? 0 }}%</span>
            </span>
            <span>{{ progressLabel }}</span>
          </div>
          <button
            type="button"
            class="learning-icon-button"
            :aria-pressed="theme === 'dark'"
            :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleTheme"
          >
            <Icon :name="theme === 'dark' ? 'lucide:sun' : 'lucide:moon'" class="learning-icon" />
          </button>
        </div>
      </div>
    </header>

    <main class="learning-main" :class="{ 'is-wide': wide }">
      <slot />
    </main>

    <footer class="learning-footer" :class="{ 'is-wide': wide }">
      <span>A focused learning workspace. Progress is saved in this browser.</span>
      <NuxtLink :to="plansPath()">All plans</NuxtLink>
    </footer>
  </div>
</template>

<style scoped>
.learning-page {
  --bg: #f1f4fb;
  --surface: #ffffff;
  --surface-2: #f5f8fe;
  --surface-3: #e8eef9;
  --ink: #101a2f;
  --muted: #586685;
  --line: #dde4f1;
  --line-strong: #b8c4db;
  --brand: #2f4fe0;
  --brand-soft: #e8edff;
  --on-brand: #ffffff;
  --info: #0b6acb;
  --info-soft: #e5f1ff;
  --success: #087e64;
  --success-soft: #dff7ef;
  --warning-ink: #994a06;
  --warning-soft: #fff3e2;
  --warning-line: #f0c896;
  --phase-blue: #2f5ce0;
  --phase-violet: #7b45d6;
  --phase-teal: #078477;
  --phase-amber: #b45309;
  --phase-rose: #be3c70;
  --phase-indigo: #4f46e5;
  --accent: #e2693b;
  --dot: rgba(16, 26, 47, 0.085);
  --shadow: 0 26px 70px rgba(18, 30, 58, 0.11);
  --shadow-sm: 0 10px 30px rgba(18, 30, 58, 0.07);
  --radius: 20px;
  --radius-lg: 30px;
  --font-display:
    'Manrope', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-body: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --serif: var(--font-display);

  min-height: 100vh;
  color: var(--ink);
  background:
    radial-gradient(circle at 8% -4%, rgba(47, 79, 224, 0.1), transparent 30rem),
    radial-gradient(circle at 96% 2%, rgba(7, 132, 119, 0.07), transparent 26rem), var(--bg);
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.6;
  overflow-wrap: break-word;
}

.learning-page[data-theme='dark'] {
  --bg: #080e1a;
  --surface: #111a2c;
  --surface-2: #0b1322;
  --surface-3: #17233a;
  --ink: #eef2fb;
  --muted: #9aa8c5;
  --line: #24314b;
  --line-strong: #3e5071;
  --brand: #8ca3ff;
  --brand-soft: #182750;
  --on-brand: #08101f;
  --info: #7db8ff;
  --info-soft: #102a4c;
  --success: #5fddbd;
  --success-soft: #0d3831;
  --warning-ink: #f5b97a;
  --warning-soft: #3a2815;
  --warning-line: #6d4b25;
  --phase-blue: #8ca3ff;
  --phase-violet: #c3a5ff;
  --phase-teal: #5fddbd;
  --phase-amber: #f5b97a;
  --phase-rose: #ff9cc2;
  --phase-indigo: #a5b4fc;
  --accent: #ffa071;
  --dot: rgba(255, 255, 255, 0.06);
  --shadow: 0 26px 70px rgba(0, 0, 0, 0.34);
  --shadow-sm: 0 10px 30px rgba(0, 0, 0, 0.24);
}

.learning-page,
.learning-page *,
.learning-page *::before,
.learning-page *::after {
  box-sizing: border-box;
}

.learning-page ::selection {
  color: var(--on-brand);
  background: var(--brand);
}

.learning-page :focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 3px;
}

.learning-page :deep(a) {
  color: var(--brand);
  text-underline-offset: 2px;
}

.learning-topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in oklab, var(--bg) 84%, transparent);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(18px);
}

.learning-topbar-inner {
  display: flex;
  gap: 18px;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  height: 72px;
  padding: 0 22px;
  margin: 0 auto;
}

.learning-topbar-inner.is-wide {
  max-width: 1740px;
}

.learning-brand {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  color: var(--ink) !important;
  text-decoration: none !important;
}

.learning-brand-mark {
  display: grid;
  flex: none;
  width: 42px;
  height: 42px;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(145deg, #5d76ff, #2039b8);
  border-radius: 13px;
  box-shadow: 0 8px 20px rgba(47, 79, 224, 0.3);
  place-items: center;
}

.learning-brand-copy strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.learning-brand-copy small {
  display: block;
  margin-top: 3px;
  font-size: 0.72rem;
  color: var(--muted);
}

.learning-back {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--muted) !important;
  text-decoration: none !important;
  border-radius: 9px;
}

.learning-back:hover {
  color: var(--ink) !important;
  background: var(--surface-2);
}

.learning-topbar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.learning-progress-pill {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  padding: 5px 13px 5px 6px;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
}

.learning-progress-ring {
  display: grid;
  flex: none;
  width: 34px;
  height: 34px;
  font-size: 0.58rem;
  font-weight: 800;
  color: var(--ink);
  background: conic-gradient(var(--brand) calc(var(--p) * 1%), var(--line) 0);
  border-radius: 999px;
  place-items: center;
}

.learning-progress-ring::before {
  position: absolute;
  width: 25px;
  height: 25px;
  content: '';
  background: var(--surface);
  border-radius: 999px;
}

.learning-progress-ring {
  position: relative;
}

.learning-progress-ring span {
  position: relative;
  z-index: 1;
}

.learning-icon-button {
  display: grid;
  width: 40px;
  height: 40px;
  font-size: 1.05rem;
  color: var(--ink);
  cursor: pointer;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 11px;
  place-items: center;
}

.learning-icon-button:hover {
  border-color: var(--line-strong);
}

.learning-icon {
  width: 1em;
  height: 1em;
  font-size: 1em;
}

.learning-main {
  width: 100%;
  max-width: 1200px;
  padding: 44px 22px 88px;
  margin: 0 auto;
}

.learning-main.is-wide {
  max-width: 1740px;
}

.learning-footer {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  padding: 24px 22px;
  margin: 0 auto;
  font-size: 0.86rem;
  color: var(--muted);
  border-top: 1px solid var(--line);
}

.learning-footer.is-wide {
  max-width: 1740px;
}

.learning-footer a {
  font-weight: 600;
  text-decoration: none;
}

.learning-page :deep(h1),
.learning-page :deep(h2),
.learning-page :deep(h3) {
  font-family: var(--font-display);
  color: var(--ink);
}

.learning-page :deep(h1) {
  font-weight: 750;
  letter-spacing: -0.04em;
}

.learning-page :deep(h2),
.learning-page :deep(h3) {
  font-weight: 700;
  letter-spacing: -0.025em;
}

.learning-page :deep(p) {
  line-height: 1.7;
}

.learning-page :deep(.learning-icon) {
  display: inline-block;
  flex: none;
  width: 1em;
  height: 1em;
}

.learning-page :deep(.learning-button) {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  justify-content: center;
  padding: 12px 19px;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 650;
  line-height: 1.2;
  text-decoration: none !important;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 11px;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease;
}

.learning-page :deep(.learning-button:hover) {
  transform: translateY(-1px);
}

.learning-page :deep(.learning-button:disabled) {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.learning-page :deep(.learning-button-primary) {
  color: var(--on-brand) !important;
  background: var(--brand);
  border-color: var(--brand);
  box-shadow: 0 7px 18px color-mix(in oklab, var(--brand) 22%, transparent);
}

.learning-page :deep(.learning-button-primary:hover) {
  box-shadow: 0 10px 24px color-mix(in oklab, var(--brand) 30%, transparent);
}

.learning-page :deep(.learning-button-soft) {
  color: var(--ink) !important;
  background: var(--surface);
  border-color: var(--line);
}

.learning-page :deep(.learning-button-soft:hover) {
  border-color: var(--brand);
}

.learning-page :deep(.learning-button-danger) {
  color: var(--warning-ink) !important;
  background: transparent;
  border-color: var(--warning-line);
}

.learning-page :deep(.learning-button-disabled) {
  color: var(--muted) !important;
  cursor: not-allowed;
  background: var(--surface-2);
  border-color: var(--line);
}

.learning-page :deep(.plans-eyebrow),
.learning-page :deep(.plans-section-kicker) {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--brand);
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.learning-page :deep(.plan-card-label) {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.learning-page :deep(.plans-progress-ring) {
  position: relative;
  display: grid;
  flex: none;
  width: 104px;
  height: 104px;
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 750;
  color: var(--ink);
  background: conic-gradient(var(--brand) calc(var(--p) * 1%), var(--line) 0);
  border-radius: 999px;
  place-items: center;
}

.learning-page :deep(.plans-progress-ring::before) {
  position: absolute;
  inset: 9px;
  content: '';
  background: var(--surface);
  border-radius: 999px;
}

.learning-page :deep(.plans-progress-ring span) {
  position: relative;
  z-index: 1;
}

.learning-page :deep(.roadmap-progress-track) {
  flex: 1;
  height: 5px;
  overflow: hidden;
  background: var(--line);
  border-radius: 999px;
}

.learning-page :deep(.roadmap-progress-track span) {
  display: block;
  height: 100%;
  background: var(--brand);
  border-radius: inherit;
  transition: width 0.35s ease;
}

.learning-page :deep(.plan-section),
.learning-page :deep(.topic-section) {
  margin-top: 68px;
}

.learning-page :deep(.plan-section-head) {
  display: flex;
  gap: 32px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.learning-page :deep(.plan-section-head > div) {
  min-width: 0;
}

.learning-page :deep(.plan-section-head h2) {
  margin: 5px 0 0;
  font-size: clamp(1.7rem, 2.6vw, 2.35rem);
  line-height: 1.12;
}

.learning-page :deep(.plan-section-head > p) {
  max-width: 540px;
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--muted);
}

.learning-page :deep(.plan-hero-stats) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 26px;
  padding: 0;
  margin: 22px 0 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.learning-page :deep(.plan-hero-stats span) {
  display: inline-flex;
  gap: 6px;
  align-items: baseline;
}

.learning-page :deep(.plan-hero-stats strong) {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 750;
  color: var(--ink);
}

.learning-page :deep(.plan-card-stats) {
  display: flex;
  gap: 14px;
  font-size: 0.86rem;
  color: var(--muted);
}

.learning-page :deep(.plan-card-stats strong) {
  color: var(--ink);
}

.learning-page :deep(.plan-card-preview) {
  display: grid;
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.learning-page :deep(.plan-card-preview li) {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.9rem;
  color: var(--muted);
}

.learning-page :deep(.plan-card-preview li .learning-icon) {
  margin-top: 3px;
  color: var(--brand);
}

.learning-page :deep(.plan-roles) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.learning-page :deep(.plan-role-card) {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-top: 4px solid var(--phase-color, var(--brand));
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
}

.learning-page :deep(.plan-role-card[data-status='locked']) {
  opacity: 0.68;
}

.learning-page :deep(.plan-role-card-top) {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.learning-page :deep(.plan-role-status) {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  color: var(--phase-color, var(--brand));
  text-transform: none;
  letter-spacing: 0;
}

.learning-page :deep(.plan-role-card h3) {
  margin: 0;
  font-size: 1.18rem;
}

.learning-page :deep(.plan-role-card p) {
  margin: 0;
  font-size: 0.92rem;
  color: var(--muted);
}

.learning-page :deep(.plan-role-card ul) {
  display: grid;
  gap: 7px;
  padding: 0;
  margin: 2px 0 0;
  list-style: none;
}

.learning-page :deep(.plan-role-card li) {
  padding-left: 15px;
  font-size: 0.88rem;
  color: var(--muted);
  text-indent: -15px;
}

.learning-page :deep(.plan-role-card li::before) {
  margin-right: 6px;
  color: var(--phase-color, var(--brand));
  content: '·';
}

.learning-page :deep(.topic-breadcrumb) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.86rem;
  color: var(--muted);
}

.learning-page :deep(.topic-breadcrumb a) {
  font-weight: 600;
  text-decoration: none;
}

.learning-page :deep(.topic-next) {
  display: flex;
  gap: 22px;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px;
  margin-top: 20px;
  background: linear-gradient(
    110deg,
    color-mix(in oklab, var(--brand) 11%, var(--surface)),
    var(--surface)
  );
  border: 1px solid color-mix(in oklab, var(--brand) 32%, var(--line));
  border-radius: 18px;
}

.learning-page :deep(.topic-next h3) {
  margin: 4px 0 3px;
  font-size: 1.18rem;
}

.learning-page :deep(.topic-next p) {
  margin: 0;
  font-size: 0.92rem;
  color: var(--muted);
}

.learning-page :deep(.topic-locked) {
  display: grid;
  min-height: 60vh;
  place-items: center;
}

.learning-page :deep(.topic-locked-card) {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  max-width: 660px;
  padding: 36px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow);
}

.learning-page :deep(.topic-locked-card h1) {
  margin: 0;
  font-size: clamp(2rem, 3.2vw, 2.9rem);
  line-height: 1.05;
}

.learning-page :deep(.topic-locked-card > p) {
  margin: 0;
  font-size: 1.02rem;
  color: var(--muted);
}

.learning-page :deep(.topic-locked-icon) {
  display: grid;
  width: 48px;
  height: 48px;
  font-size: 1.2rem;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 14px;
  place-items: center;
}

.learning-page :deep(.topic-locked-actions) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.learning-page :deep(.plan-coming-soon) {
  display: grid;
  min-height: 60vh;
  padding: 30px 0;
  place-items: center;
}

.learning-page :deep(.plan-coming-card) {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
  max-width: 700px;
  padding: 38px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 26px;
  box-shadow: var(--shadow);
}

.learning-page :deep(.plan-coming-card h1) {
  margin: 0;
  font-size: clamp(2.1rem, 3.6vw, 3rem);
  line-height: 1.05;
}

.learning-page :deep(.plan-coming-card > p) {
  margin: 0;
  font-size: 1.02rem;
  color: var(--muted);
}

.learning-page :deep([data-tone='blue']) {
  --phase-color: var(--phase-blue);
}

.learning-page :deep([data-tone='violet']) {
  --phase-color: var(--phase-violet);
}

.learning-page :deep([data-tone='teal']) {
  --phase-color: var(--phase-teal);
}

.learning-page :deep([data-tone='amber']) {
  --phase-color: var(--phase-amber);
}

.learning-page :deep([data-tone='rose']) {
  --phase-color: var(--phase-rose);
}

.learning-page :deep([data-tone='indigo']) {
  --phase-color: var(--phase-indigo);
}

@media (max-width: 900px) {
  .learning-page :deep(.plan-roles) {
    grid-template-columns: 1fr;
  }

  .learning-page :deep(.plan-section-head) {
    display: block;
  }

  .learning-page :deep(.plan-section-head > p) {
    margin-top: 10px;
  }
}

@media (max-width: 680px) {
  .learning-topbar-inner {
    height: 64px;
    padding: 0 15px;
  }

  .learning-brand-copy small {
    display: none;
  }

  .learning-progress-pill > span:last-child {
    display: none;
  }

  .learning-main {
    padding: 28px 15px 64px;
  }

  .learning-footer {
    display: block;
    padding: 18px 15px;
    font-size: 0.8rem;
    line-height: 1.8;
  }

  .learning-page :deep(.plan-section),
  .learning-page :deep(.topic-section) {
    margin-top: 48px;
  }

  .learning-page :deep(.topic-next) {
    display: block;
  }

  .learning-page :deep(.topic-next .learning-button) {
    width: 100%;
    margin-top: 12px;
  }

  .learning-page :deep(.topic-locked-card),
  .learning-page :deep(.plan-coming-card) {
    padding: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .learning-page :deep(*) {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
