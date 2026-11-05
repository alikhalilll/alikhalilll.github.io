<script setup lang="ts">
definePageMeta({
  layout: false,
});

defineI18nRoute({
  locales: ['en-us'],
});

useHead({
  title: 'Fernhollow',
  meta: [
    {
      name: 'description',
      content:
        'A regenerative design studio. Wander through a night valley of flowers that grows as you move.',
    },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Antonio:wght@400&family=Manrope:wght@400;500&display=swap',
    },
  ],
});

const valleyEl = ref<HTMLElement | null>(null);
const uiEl = ref<HTMLElement | null>(null);
const loaderEl = ref<HTMLElement | null>(null);
const soundBtn = ref<HTMLButtonElement | null>(null);
const goBtn = ref<HTMLAnchorElement | null>(null);

// three.js r154 is the version referenced by the real gladeye.com engine
const THREE_URL = 'https://unpkg.com/three@0.154.0/build/three.min.js';

// three.js is loaded from CDN at runtime, so we don't import its types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThreeNS = any;

const loadThree = () =>
  new Promise<ThreeNS>((resolve, reject) => {
    const w = window as unknown as { THREE?: ThreeNS };
    if (w.THREE) return resolve(w.THREE);
    const existing = document.querySelector(`script[src="${THREE_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () =>
        resolve((window as unknown as { THREE: ThreeNS }).THREE)
      );
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.src = THREE_URL;
    s.async = true;
    s.onload = () => resolve((window as unknown as { THREE: ThreeNS }).THREE);
    s.onerror = reject;
    document.head.appendChild(s);
  });

onMounted(async () => {
  const container = valleyEl.value;
  if (!container) return;

  const THREE = await loadThree();

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x05070a, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a08, 0.042);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 800);
  // slightly above the field, tilted gently down the valley
  camera.position.set(0, 2.4, 0);
  camera.lookAt(0, 1.1, -10);

  // dark soil ground plane
  const groundGeo = new THREE.PlaneGeometry(600, 600, 1, 1);
  const groundMat = new THREE.MeshBasicMaterial({ color: 0x0a0c08, fog: true });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.3;
  scene.add(ground);

  // ---------- flowers ----------
  const COUNT = 11000;
  const Z_SPAN = 220;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  const sizes = new Float32Array(COUNT);

  // warm palette weighted toward amber / red / gold, with a few cool accents
  const palette: Array<[number, number, number]> = [
    [1.0, 0.45, 0.12], // orange
    [1.0, 0.32, 0.18], // red-orange
    [1.0, 0.68, 0.22], // amber
    [1.0, 0.88, 0.42], // gold
    [1.0, 0.55, 0.28], // peach
    [1.0, 0.25, 0.22], // red
    [0.98, 0.78, 0.5], // warm cream
    [0.6, 0.85, 1.0], // cool accent (occasional)
    [1.0, 0.55, 0.8], // pink accent
  ];
  const weights = [18, 14, 16, 14, 12, 10, 8, 4, 4]; // probability weights
  const wSum = weights.reduce((a, b) => a + b, 0);
  const pickColor = (): [number, number, number] => {
    let r = Math.random() * wSum;
    for (let i = 0; i < palette.length; i++) {
      r -= weights[i]!;
      if (r <= 0) return palette[i]!;
    }
    return palette[0]!;
  };

  for (let i = 0; i < COUNT; i++) {
    // denser near the centerline, thinning outward (wider valley)
    const xRaw = (Math.random() - 0.5) * 2;
    const x = Math.sign(xRaw) * Math.pow(Math.abs(xRaw), 1.3) * 50;
    // flowers sit near the ground with some bush variation
    const y = Math.random() * Math.random() * 0.9 - 0.15;
    // push them away from the camera so the near plane doesn't saturate
    const z = -4 - Math.random() * Z_SPAN;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    const c = pickColor();
    colors[i * 3] = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
    seeds[i] = Math.random();
    sizes[i] = 2.2 + Math.random() * 4.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const flowerMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(10, 10) },
      uMouseActive: { value: 0 },
      uCamZ: { value: 0 },
      uZSpan: { value: Z_SPAN },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uHoverT: { value: 0 },
      uViewport: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      attribute float aSize;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vGlow;
      varying float vBloom;
      uniform float uTime;
      uniform vec2  uMouse;
      uniform float uMouseActive;
      uniform float uCamZ;
      uniform float uZSpan;
      uniform float uPixelRatio;
      uniform float uHoverT;
      uniform vec2  uViewport;

      void main() {
        vColor = color;

        // Recycle in shader: loop the valley along -z
        vec3 p = position;
        p.z = mod(position.z + uCamZ, uZSpan) - uZSpan;

        // Gentle sway so the field feels alive
        p.x += sin(uTime * 0.6 + aSeed * 40.0) * 0.08;
        p.y += sin(uTime * 0.9 + aSeed * 60.0) * 0.04;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vec4 proj = projectionMatrix * mv;

        // Screen-space mouse push (strongest close by)
        vec2 ndc = proj.xy / proj.w;
        vec2 toMouse = ndc - uMouse;
        float d = length(toMouse);
        float push = smoothstep(0.55, 0.0, d) * uMouseActive;
        vGlow = push;
        ndc += normalize(toMouse + vec2(0.0001)) * push * 0.18;

        // Hover transition: disperse outward from screen centre
        float hp = uHoverT;
        if (hp > 0.001) {
          vec2 outward = normalize(ndc + vec2(0.0001));
          ndc += outward * hp * 0.6;
        }

        proj.xy = ndc * proj.w;

        // Bloom in: point grows as it approaches the camera, but with a
        // ceiling so the near plane doesn't blow out to white.
        float dist = -mv.z;
        float bloom = clamp(1.0 - dist / 60.0, 0.0, 1.0);
        vBloom = bloom;
        float px = aSize * uPixelRatio * (200.0 / max(dist, 1.0)) * (0.4 + bloom * 0.6);
        gl_PointSize = min(px, 70.0 * uPixelRatio);

        gl_Position = proj;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3  vColor;
      varying float vGlow;
      varying float vBloom;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float r = length(c);
        if (r > 0.5) discard;

        // Soft blossom: warm core + modest halo. Five-petal radial falloff.
        float ang = atan(c.y, c.x);
        float petals = 1.0 + 0.2 * cos(ang * 5.0);
        float rr = r * petals;
        float core = exp(-rr * rr * 28.0);
        float halo = exp(-r * r * 6.0) * 0.18;
        float a = (core + halo) * (0.55 + vBloom * 0.45);

        vec3 col = vColor * (0.6 + vBloom * 0.5);
        col += vec3(0.7, 0.55, 0.3) * vGlow * 0.3;

        gl_FragColor = vec4(col, a);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const flowers = new THREE.Points(geo, flowerMat);
  scene.add(flowers);

  // ---------- dust layer ----------
  const DUST_COUNT = 1200;
  const dPos = new Float32Array(DUST_COUNT * 3);
  const dSeed = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i++) {
    dPos[i * 3] = (Math.random() - 0.5) * 80;
    dPos[i * 3 + 1] = Math.random() * 6 - 1;
    dPos[i * 3 + 2] = -Math.random() * Z_SPAN;
    dSeed[i] = Math.random();
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('aSeed', new THREE.BufferAttribute(dSeed, 1));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCamZ: { value: 0 },
      uZSpan: { value: Z_SPAN },
      uPixelRatio: { value: renderer.getPixelRatio() },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime;
      uniform float uCamZ;
      uniform float uZSpan;
      uniform float uPixelRatio;
      varying float vA;
      void main() {
        vec3 p = position;
        p.z = mod(position.z + uCamZ, uZSpan) - uZSpan;
        p.x += sin(uTime * 0.2 + aSeed * 20.0) * 0.6;
        p.y += cos(uTime * 0.25 + aSeed * 30.0) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dist = -mv.z;
        gl_PointSize = (1.4 + aSeed * 2.0) * uPixelRatio * (160.0 / max(dist, 0.001));
        vA = clamp(1.0 - dist / 100.0, 0.0, 1.0) * (0.35 + aSeed * 0.35);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float r = length(c);
        if (r > 0.5) discard;
        float a = exp(-r * r * 10.0) * vA;
        gl_FragColor = vec4(0.95, 0.92, 0.85, a * 0.35);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  scene.add(new THREE.Points(dGeo, dustMat));

  // ---------- camera control state ----------
  let camZ = 0; // how far we have travelled
  let camTarget = 0; // pending delta from wheel/touch
  const drift = 0.9; // units per second (idle forward drift)
  let hoverT = 0;
  let hoverTarget = 0;
  const mouse = new THREE.Vector2(10, 10);
  let mouseActive = 0;
  const targetLook = new THREE.Vector3(0, 1.1, -10);
  const curLook = new THREE.Vector3(0, 1.1, -10);

  const onPointerMove = (e: PointerEvent) => {
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    mouseActive = 1;
  };
  const onPointerLeave = () => {
    mouseActive = 0;
  };
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerleave', onPointerLeave);

  const onWheel = (e: WheelEvent) => {
    camTarget += e.deltaY * 0.02;
    e.preventDefault();
  };
  window.addEventListener('wheel', onWheel, { passive: false });

  let touchY: number | null = null;
  const onTouchStart = (e: TouchEvent) => {
    touchY = e.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (touchY == null) return;
    const y = e.touches[0]?.clientY;
    if (y == null) return;
    const dy = touchY - y;
    camTarget += dy * 0.02 * 20;
    touchY = y;
  };
  window.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchmove', onTouchMove);

  const go = goBtn.value;
  const onEnter = () => {
    hoverTarget = 1;
  };
  const onLeaveGo = () => {
    hoverTarget = 0;
  };
  go?.addEventListener('pointerenter', onEnter);
  go?.addEventListener('pointerleave', onLeaveGo);

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    flowerMat.uniforms.uViewport.value.set(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  // ---------- loop ----------
  const clock = new THREE.Clock();
  let raf = 0;
  const tick = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    hoverT += (hoverTarget - hoverT) * Math.min(1, dt * 3);

    const driftActive = drift * (1 - hoverT);
    camZ += driftActive * dt;
    camZ += camTarget * 2.2 * dt;
    camTarget *= Math.pow(0.001, dt);

    // tilt the camera slightly toward the mouse — gentle angle over the field
    targetLook.set(mouse.x * 2.0, 1.1 + mouse.y * 0.9, -10);
    curLook.lerp(targetLook, Math.min(1, dt * 3.5));
    camera.lookAt(curLook);

    flowerMat.uniforms.uTime.value = t;
    flowerMat.uniforms.uCamZ.value = camZ;
    flowerMat.uniforms.uMouse.value.copy(mouse);
    flowerMat.uniforms.uMouseActive.value = mouseActive;
    flowerMat.uniforms.uHoverT.value = hoverT;

    dustMat.uniforms.uTime.value = t;
    dustMat.uniforms.uCamZ.value = camZ * 0.4;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  // Mimic the real engine's onLoaded / onIntroDone callbacks
  const loaderTimer = window.setTimeout(() => loaderEl.value?.classList.add('gone'), 450);
  const uiTimer = window.setTimeout(() => uiEl.value?.classList.add('on'), 900);

  const sound = soundBtn.value;
  const onSoundClick = () => {
    const on = sound?.getAttribute('aria-pressed') === 'true';
    sound?.setAttribute('aria-pressed', String(!on));
  };
  sound?.addEventListener('click', onSoundClick);

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
    window.clearTimeout(loaderTimer);
    window.clearTimeout(uiTimer);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    go?.removeEventListener('pointerenter', onEnter);
    go?.removeEventListener('pointerleave', onLeaveGo);
    sound?.removeEventListener('click', onSoundClick);
    renderer.dispose();
    geo.dispose();
    dGeo.dispose();
    flowerMat.dispose();
    dustMat.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  });
});
</script>

<template>
  <div class="fernhollow-root">
    <div id="valley" ref="valleyEl" aria-hidden="true" />
    <div ref="uiEl" class="ui">
      <header>
        <a class="logo" href="#" aria-label="Fernhollow">Fernhollow</a>
        <nav aria-label="Main">
          <a href="#">Work</a>
          <a href="#">About</a>
          <a href="#">Journal</a>
          <a class="pill" href="#">Let’s talk</a>
        </nav>
      </header>
      <section class="hero">
        <h1>Grown, not built.</h1>
        <p class="cap">Rooted in nature.<br />Built for what’s next.</p>
        <a ref="goBtn" class="go" href="#" aria-label="See our work">
          <svg viewBox="0 0 24 24">
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </a>
      </section>
      <div class="corner">
        <span>Scroll to wander</span>
        <i />
        <button ref="soundBtn" class="sound" aria-pressed="false" aria-label="Ambient sound">
          <svg viewBox="0 0 24 24">
            <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5Z" />
            <path class="w" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
            <path class="x" d="m16 10 4 4m0-4-4 4" />
          </svg>
        </button>
      </div>
    </div>
    <div ref="loaderEl" class="loader">
      <span />
    </div>
  </div>
</template>

<style>
.fernhollow-root {
  --u: min(calc(100vw / 1600), calc(100vh / 900));
  --cream: #f5efe2;
  position: fixed;
  inset: 0;
  background: #000;
  color: var(--cream);
  font-family: Manrope, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}
.fernhollow-root * {
  box-sizing: border-box;
}
.fernhollow-root a {
  color: inherit;
  text-decoration: none;
}
.fernhollow-root button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}

.fernhollow-root #valley {
  position: fixed;
  inset: 0;
}
.fernhollow-root #valley canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

/* a vignette on top of the webgl scene, tightening the frame */
.fernhollow-root #valley::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.65) 100%);
  pointer-events: none;
  z-index: 1;
}

.fernhollow-root .ui {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.6s ease;
}
.fernhollow-root .ui.on {
  opacity: 1;
}
.fernhollow-root .ui a,
.fernhollow-root .ui button {
  pointer-events: auto;
}

.fernhollow-root header {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(24 * var(--u)) calc(44 * var(--u)) 0;
}
.fernhollow-root .logo {
  font-size: calc(26 * var(--u));
  font-weight: 500;
  letter-spacing: -0.02em;
}
.fernhollow-root nav {
  display: flex;
  align-items: center;
  gap: calc(44 * var(--u));
  font-size: calc(14.5 * var(--u));
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.fernhollow-root nav a:not(.pill) {
  transition: opacity 0.2s;
}
.fernhollow-root nav a:not(.pill):hover {
  opacity: 0.6;
}
.fernhollow-root .pill {
  display: inline-flex;
  align-items: center;
  height: calc(46 * var(--u));
  padding: 0 calc(26 * var(--u));
  border-radius: 99px;
  background: var(--cream);
  color: #151510;
  transition: transform 0.25s;
}
.fernhollow-root .pill:hover {
  transform: translateY(-1px);
}

.fernhollow-root .hero {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-46%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.fernhollow-root h1 {
  font:
    400 calc(158 * var(--u)) / 0.92 Antonio,
    'Arial Narrow',
    sans-serif;
  letter-spacing: -0.012em;
  white-space: nowrap;
  text-shadow: 0 2px 40px rgba(0, 0, 0, 0.35);
}
.fernhollow-root .cap {
  margin-top: calc(48 * var(--u));
  font-size: calc(20 * var(--u));
  line-height: 1.3;
}
.fernhollow-root .go {
  display: grid;
  place-items: center;
  margin-top: calc(34 * var(--u));
  width: calc(58 * var(--u));
  height: calc(58 * var(--u));
  border: 1.5px solid var(--cream);
  border-radius: 50%;
  transition:
    background 0.3s,
    color 0.3s;
}
.fernhollow-root .go:hover {
  background: var(--cream);
  color: #151510;
}
.fernhollow-root .go svg {
  width: calc(22 * var(--u));
  height: calc(22 * var(--u));
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.fernhollow-root .corner {
  position: absolute;
  right: calc(44 * var(--u));
  bottom: calc(44 * var(--u));
  display: flex;
  align-items: center;
  gap: calc(18 * var(--u));
  font-size: calc(12.5 * var(--u));
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.fernhollow-root .corner i {
  width: 1px;
  height: calc(26 * var(--u));
  background: rgba(245, 239, 226, 0.45);
}
.fernhollow-root .sound {
  display: grid;
  place-items: center;
  width: calc(28 * var(--u));
  height: calc(28 * var(--u));
}
.fernhollow-root .sound svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.fernhollow-root .sound .w {
  transition: opacity 0.3s;
}
.fernhollow-root .sound[aria-pressed='false'] .w {
  opacity: 0;
}
.fernhollow-root .sound[aria-pressed='true'] .x {
  opacity: 0;
}

.fernhollow-root .loader {
  position: fixed;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  background: #000;
  transition: opacity 1s ease;
  pointer-events: none;
}
.fernhollow-root .loader.gone {
  opacity: 0;
}
.fernhollow-root .loader span {
  width: calc(9 * var(--u));
  height: calc(9 * var(--u));
  min-width: 6px;
  min-height: 6px;
  border-radius: 50%;
  background: var(--cream);
  animation: fh-pulse 1.2s ease-in-out infinite;
}
@keyframes fh-pulse {
  50% {
    transform: scale(0.4);
    opacity: 0.4;
  }
}

.fernhollow-root a:focus-visible,
.fernhollow-root button:focus-visible {
  outline: 2px solid var(--cream);
  outline-offset: 3px;
}

@media (max-width: 820px) {
  .fernhollow-root {
    --u: 1px;
  }
  .fernhollow-root header {
    padding: 18px 18px 0;
  }
  .fernhollow-root nav a:not(.pill) {
    display: none;
  }
  .fernhollow-root .pill {
    height: 40px;
    padding: 0 18px;
    font-size: 12px;
  }
  .fernhollow-root .hero {
    left: 20px;
    right: 20px;
  }
  .fernhollow-root h1 {
    font-size: clamp(64px, 19vw, 96px);
    white-space: normal;
  }
  .fernhollow-root .cap {
    font-size: 17px;
  }
  .fernhollow-root .corner {
    right: 20px;
    bottom: 30px;
    left: 20px;
    justify-content: center;
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fernhollow-root .loader span {
    animation: none;
  }
}
</style>
