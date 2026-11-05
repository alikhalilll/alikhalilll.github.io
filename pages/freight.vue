<script setup lang="ts">
definePageMeta({
  layout: false,
});

defineI18nRoute({
  locales: ['en-us'],
});

useHead({
  title: 'Freight — Logistics that works as hard as you do',
  meta: [
    {
      name: 'description',
      content:
        'Scroll-driven aerial freight hero: climb above a container train, through drifting mist, into cloud.',
    },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@800&family=Public+Sans:wght@400;700&display=swap',
    },
  ],
});

const VIDEO_1080 =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/e02bb27f-80d8-445f-a03e-1b609dac4261.mp4';
const VIDEO_720 =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/e8eb434f-d097-4b1b-b9e6-c8b46fa43040.mp4';
const POSTER =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/5e018553-cb8a-420a-819f-fcdfa08e5df0.jpg';
const DURATION = 5.04;

const trackEl = ref<HTMLElement | null>(null);
const sceneEl = ref<HTMLElement | null>(null);
const videoEl = ref<HTMLVideoElement | null>(null);
const contentEl = ref<HTMLElement | null>(null);
const lastBlockEl = ref<HTMLElement | null>(null);

const videoSrc = computed(() => {
  if (typeof window === 'undefined') return VIDEO_1080;
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  // @ts-expect-error connection on navigator is non-standard
  const saveData = navigator.connection?.saveData === true;
  return narrow || saveData ? VIDEO_720 : VIDEO_1080;
});

onMounted(() => {
  const video = videoEl.value;
  const track = trackEl.value;
  const lastBlock = lastBlockEl.value;
  if (!video || !track || !lastBlock) return;

  video.muted = true;
  video.playsInline = true;
  // @ts-expect-error webkit vendor attribute
  video.webkitPlaysinline = true;
  video.preload = 'auto';
  video.crossOrigin = 'anonymous';
  // kick the pipeline — muted videos are allowed to start, and the browser
  // will populate buffers so that seeking works.
  video.play().catch(() => {
    /* ignored — scroll will drive seek even if autoplay was blocked */
  });
  video.addEventListener('loadeddata', () => video.pause());

  let seeking = false;
  video.addEventListener('seeked', () => {
    seeking = false;
  });
  video.addEventListener('error', () => {
    seeking = false;
  });

  const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

  let target = 0;
  let cur = 0;
  let trackTop = 0;
  let end = 0;
  let knee = 0;

  const measure = () => {
    const vh = window.innerHeight;
    const rect = track.getBoundingClientRect();
    trackTop = rect.top + window.scrollY;
    const lastRect = lastBlock.getBoundingClientRect();
    const lastBottom = lastRect.bottom + window.scrollY - trackTop;
    end = Math.max(1, lastBottom + 0.75 * vh);
    knee = lastBottom / end;
    track.style.height = `${end + vh}px`;
  };

  const onScroll = () => {
    if (end <= 0) return;
    const p = clamp((window.scrollY - trackTop) / end);
    let clipP: number;
    if (p < knee) clipP = (p / knee) * 0.46;
    else clipP = 0.46 + ((p - knee) / (1 - knee)) * 0.54;
    target = clipP * (DURATION - 1 / 48);
  };

  let raf = 0;
  const tick = () => {
    cur += (target - cur) * 0.22;
    // readyState >= 2 (HAVE_CURRENT_DATA) means we can seek
    if (!seeking && video.readyState >= 2 && Math.abs(cur - video.currentTime) > 1 / 60) {
      try {
        seeking = true;
        video.currentTime = cur;
      } catch {
        seeking = false;
      }
    }
    raf = requestAnimationFrame(tick);
  };

  const onResize = () => {
    measure();
    onScroll();
  };

  // Measure as early as possible so the page is scrollable immediately.
  measure();
  // Re-measure after layout settles and after fonts/metadata change block sizes.
  requestAnimationFrame(() => {
    measure();
    onScroll();
  });
  onScroll();
  raf = requestAnimationFrame(tick);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  video.addEventListener('loadedmetadata', onResize);
  video.addEventListener('loadeddata', onResize);

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  });
});
</script>

<template>
  <div class="freight-root">
    <div ref="trackEl" class="track">
      <div ref="sceneEl" class="scene">
        <video
          ref="videoEl"
          :src="videoSrc"
          :poster="POSTER"
          muted
          playsinline
          preload="auto"
          disablepictureinpicture
        />
        <div class="tint" />
      </div>

      <div ref="contentEl" class="content">
        <!-- intro -->
        <div class="intro">
          <div class="eyebrow">WHY US</div>
          <h1 class="headline">
            <span>LOGISTICS</span>
            <span>THAT WORKS</span>
            <span>AS HARD AS</span>
            <span>YOU DO.</span>
          </h1>
        </div>

        <!-- row 1 -->
        <div class="feature left row1">
          <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#F9F9F9"
              stroke-width="1.4"
              fill="none"
              stroke-dasharray="2 4"
            />
            <circle cx="24" cy="24" r="10" fill="#F9F9F9" />
            <path
              d="M14 24h20M24 14v20M17 17c3 4 11 4 14 0M17 31c3-4 11-4 14 0"
              stroke="#0a0b0c"
              stroke-width="1"
              fill="none"
            />
          </svg>
          <div class="ftitle">ONE POINT OF<br />CONTACT</div>
          <div class="fbody">
            No more chasing multiple vendors. One<br />
            team manages your entire end-to-end flow,<br />
            origin to destination.
          </div>
        </div>
        <div class="feature right row1">
          <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
            <rect x="6" y="28" width="14" height="8" fill="#F9F9F9" />
            <rect x="17" y="20" width="14" height="8" fill="#F9F9F9" />
            <rect x="28" y="12" width="14" height="8" fill="#F9F9F9" />
          </svg>
          <div class="ftitle">FULL SUPPLY CHAIN<br />VISIBILITY</div>
          <div class="fbody">
            Track your freight in real time and get<br />
            proactive updates before issues become<br />
            delays.
          </div>
        </div>

        <!-- row 2 -->
        <div class="feature left row2">
          <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#F9F9F9"
              stroke-width="1.4"
              fill="none"
              stroke-dasharray="2 4"
            />
            <circle cx="24" cy="24" r="12" fill="#F9F9F9" />
            <path
              d="M18 24l4 4 8-8"
              stroke="#0a0b0c"
              stroke-width="2.4"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <div class="ftitle">COMPLIANCE YOU<br />CAN TRUST</div>
          <div class="fbody">
            Licensed customs brokers keep your<br />
            shipments moving within every regulatory<br />
            requirement, border to border.
          </div>
        </div>
        <div class="feature right row2">
          <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
            <path
              d="M30 12h-8a7 7 0 0 0 0 14h4a7 7 0 0 1 0 14h-8M24 8v4M24 36v4"
              stroke="#F9F9F9"
              stroke-width="3.2"
              fill="none"
              stroke-linecap="round"
            />
          </svg>
          <div class="ftitle">COMPETITIVE,<br />TRANSPARENT PRICING</div>
          <div class="fbody">
            No hidden fees. Clear, competitive pricing<br />
            backed by responsive sales support<br />
            throughout the shipment.
          </div>
        </div>

        <!-- row 3 (centered fifth block) -->
        <div ref="lastBlockEl" class="feature center row3">
          <svg class="icon" viewBox="0 0 48 48" aria-hidden="true">
            <path
              d="M12 16l10 10-10 10M22 16l10 10-10 10"
              stroke="#F9F9F9"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <div class="ftitle">FAST ISSUE<br />RESOLUTION</div>
          <div class="fbody">
            When something unexpected happens, we<br />
            do not point fingers, we solve it. Our team<br />
            acts at once to protect your timeline.
          </div>
        </div>
      </div>
    </div>

    <section class="trust">
      <div class="trust-wrap">
        <header class="trust-head">
          <h2>
            TRUSTED<br />
            BY BUSINESSES<br />
            <span class="muted">ACROSS THE REGION</span>
          </h2>
          <p class="note">
            From first-time importers to high-volume shippers, our customers stay because every
            consignment is treated like it matters.
          </p>
        </header>

        <div class="quote">
          <div class="who">
            <div class="name">THOMAS REID</div>
            <div class="role">Director, Harbour Fit Group</div>
          </div>
          <div class="said">
            My business would not function without this team. They treat every consignment on its
            own merits, and our account managers know our business well enough to answer before we
            ask. We have never had that from a bigger carrier.
          </div>
        </div>
        <div class="quote">
          <div class="who">
            <div class="name">ANA PARK</div>
            <div class="role">Supply Chain Lead, Northline Projects</div>
          </div>
          <div class="said">
            As a first-time shipper on a major infrastructure job, we were in unfamiliar territory.
            They planned the whole route with us, flagged every risk early, and our first delivery
            reached site on the day they promised.
          </div>
        </div>
        <div class="quote">
          <div class="who">
            <div class="name">LIAM CARTER</div>
            <div class="role">Operations Manager, Coastline Foods</div>
          </div>
          <div class="said">
            One contact, one dashboard, no surprises. When a vessel slipped two days, we heard about
            it before our customers did, and the new plan was already in place.
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.freight-root {
  --u: min(calc(100vh / 800), calc(100vw / 716));
  --cream: #f7f5ef;
  --white: #f9f9f9;
  --ink: #141516;
  --page: #0a0b0c;
  --cloud: #e2dedd;
  background: var(--page);
  color: var(--white);
  font-family: 'Public Sans', system-ui, sans-serif;
  overflow-x: hidden;
}
.freight-root * {
  box-sizing: border-box;
}

.freight-root .track {
  position: relative;
  width: 100%;
  /* JS sets the exact height. This fallback guarantees the page is
     scrollable immediately, so a scroll gesture starts scrubbing even
     before the video has reported its metadata. */
  min-height: 420vh;
}

.freight-root .scene {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  height: 100lvh;
  overflow: hidden;
  background: var(--page);
}
.freight-root .scene video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.freight-root .scene .tint {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.12) 0%,
    transparent 18%,
    transparent 82%,
    rgba(0, 0, 0, 0.04) 100%
  );
}

.freight-root .content {
  position: absolute;
  inset: 0;
  width: 100%;
  pointer-events: none;
}

/* ---------- intro / headline ---------- */
.freight-root .intro {
  position: absolute;
  left: 50%;
  top: calc(940 / 8 * 1vh);
  transform: translateX(-50%);
  width: calc(1280 * var(--u));
  text-align: center;
}
.freight-root .eyebrow {
  color: var(--cream);
  font-family: 'Public Sans', sans-serif;
  font-weight: 700;
  font-size: calc(7.4 * var(--u));
  letter-spacing: 0.304em;
  margin-bottom: calc(22 * var(--u));
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
}
.freight-root .headline {
  font-family: 'Exo 2', sans-serif;
  font-weight: 800;
  color: var(--cream);
  font-size: calc(56 * var(--u));
  line-height: calc(62 * var(--u));
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-shadow: 0 calc(12 * var(--u)) calc(32 * var(--u)) rgba(0, 0, 0, 0.5);
}
.freight-root .headline span {
  white-space: nowrap;
  display: block;
}

/* ---------- features ---------- */
.freight-root .feature {
  position: absolute;
  width: calc(300 * var(--u));
  color: var(--white);
}
.freight-root .feature .icon {
  display: block;
  width: calc(34 * var(--u));
  height: calc(34 * var(--u));
  margin-bottom: calc(30 * var(--u));
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.55));
}
.freight-root .feature .ftitle {
  font-family: 'Public Sans', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: calc(19.6 * var(--u));
  line-height: calc(20 * var(--u));
  text-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
  margin-bottom: calc(14 * var(--u));
}
.freight-root .feature .fbody {
  font-family: 'Public Sans', sans-serif;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.88);
  font-size: calc(12.3 * var(--u));
  line-height: calc(15.4 * var(--u));
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.freight-root .feature.left {
  text-align: right;
}
.freight-root .feature.right {
  text-align: left;
}
.freight-root .feature.left .icon {
  margin-left: auto;
}

.freight-root .row1 {
  top: calc(1500 / 8 * 1vh);
}
.freight-root .row2 {
  top: calc(1759 / 8 * 1vh);
}
.freight-root .row3 {
  top: calc(2063 / 8 * 1vh);
}

.freight-root .row1.left {
  right: calc(50% + 78 * var(--u));
}
.freight-root .row1.right {
  left: calc(50% + 78 * var(--u));
}
.freight-root .row2.left {
  right: calc(50% + 88 * var(--u));
}
.freight-root .row2.right {
  left: calc(50% + 88 * var(--u));
}

.freight-root .feature.center {
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.freight-root .feature.center .icon {
  margin-left: auto;
  margin-right: auto;
}

/* ---------- testimonial ---------- */
.freight-root .trust {
  position: relative;
  margin-top: -34vh;
  padding-top: 34vh;
  background: linear-gradient(180deg, transparent 0%, var(--cloud) 34vh), var(--cloud);
  color: var(--ink);
  font-family: 'Public Sans', sans-serif;
}
.freight-root .trust-wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 64px 140px;
}
.freight-root .trust-head {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 48px;
  align-items: end;
  padding: 80px 0 32px;
  border-bottom: 1px solid rgba(20, 21, 22, 0.16);
}
.freight-root .trust-head h2 {
  font-family: 'Exo 2', sans-serif;
  font-weight: 800;
  font-size: clamp(34px, 4.4vw, 60px);
  line-height: 1;
  letter-spacing: -0.01em;
  margin: 0;
}
.freight-root .trust-head h2 .muted {
  color: #8f8b8a;
}
.freight-root .trust-head .note {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(20, 21, 22, 0.7);
  margin: 0;
}

.freight-root .quote {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 48px;
  padding: 44px 0;
  border-bottom: 1px solid rgba(20, 21, 22, 0.16);
}
.freight-root .quote .name {
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.freight-root .quote .role {
  font-size: 12px;
  color: rgba(20, 21, 22, 0.6);
  margin-top: 6px;
}
.freight-root .quote .said {
  font-weight: 400;
  font-size: clamp(17px, 1.6vw, 21px);
  line-height: 1.42;
  max-width: 680px;
}

/* ---------- portrait ---------- */
@media (max-width: 609px), (orientation: portrait) {
  .freight-root {
    --u: min(calc(100vw / 390), 1.6px);
  }

  .freight-root .intro {
    width: min(92vw, 420px);
    top: 112vh;
  }
  .freight-root .headline {
    font-size: clamp(34px, calc(46 * var(--u)), 72px);
    line-height: 1;
  }
  .freight-root .headline span {
    white-space: normal;
  }

  .freight-root .feature {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    width: min(88vw, 360px);
  }
  .freight-root .feature .icon {
    margin-left: auto;
    margin-right: auto;
  }

  .freight-root .row1.left {
    right: auto;
    top: calc(112vh + 24vh + 220px);
  }
  .freight-root .row1.right {
    left: 50%;
    top: calc(112vh + 40vh + 220px);
  }
  .freight-root .row2.left {
    right: auto;
    top: calc(112vh + 56vh + 220px);
  }
  .freight-root .row2.right {
    left: 50%;
    top: calc(112vh + 72vh + 220px);
  }
  .freight-root .row3 {
    top: calc(112vh + 88vh + 220px);
  }

  .freight-root .trust-wrap {
    padding: 0 22px 100px;
  }
  .freight-root .trust-head {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 56px 0 20px;
  }
  .freight-root .quote {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 32px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .freight-root .scene video {
    display: none;
  }
  .freight-root .scene {
    background: #111;
  }
}
</style>
