import {
  ACCENT_PRESETS,
  accentCookieName,
  defaultAccent,
  defaultTheme,
  getAccentPreset,
  isAccentKey,
  isThemeMode,
  themeCookieMaxAge,
  themeCookieName,
  type AccentKey,
  type ThemeMode,
} from '~/constants/theme';

export type { AccentKey, AccentPreset, ThemeMode } from '~/constants/theme';

const isDarkMode = (m: ThemeMode) =>
  m === 'dark' ||
  (m === 'auto' &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches);

const applyMode = (m: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDarkMode(m));
};

const applyAccent = (key: AccentKey) => {
  if (typeof document === 'undefined') return;
  const preset = getAccentPreset(key);
  const root = document.documentElement;
  const tone = root.classList.contains('dark') ? preset.dark : preset.light;
  root.style.setProperty('--primary', `oklch(${tone.primary})`);
  root.style.setProperty('--ring', `oklch(${tone.ring})`);
};

// Read a cookie straight off document.cookie — bypasses any ref-rehydration
// timing questions after SSG hydrates with build-time defaults.
const readCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const entries = document.cookie.split(';');
  for (const raw of entries) {
    const eq = raw.indexOf('=');
    if (eq < 0) continue;
    const k = raw.slice(0, eq).trim();
    if (k === name) return decodeURIComponent(raw.slice(eq + 1).trim());
  }
  return undefined;
};

export const useTheme = () => {
  const modeCookie = useCookie<ThemeMode>(themeCookieName, {
    default: () => defaultTheme,
    maxAge: themeCookieMaxAge,
    sameSite: 'lax',
    path: '/',
  });
  const accentCookie = useCookie<AccentKey>(accentCookieName, {
    default: () => defaultAccent,
    maxAge: themeCookieMaxAge,
    sameSite: 'lax',
    path: '/',
  });

  const mode = useState<ThemeMode>('theme-mode', () =>
    isThemeMode(modeCookie.value) ? modeCookie.value : defaultTheme
  );
  const accent = useState<AccentKey>('theme-accent', () =>
    isAccentKey(accentCookie.value) ? accentCookie.value : defaultAccent
  );

  onMounted(() => {
    // SSG pre-renders at build time with no browser cookie, so useState's
    // SSR payload snapshots the default. Re-read straight from document.cookie
    // and sync the state so a user-chosen mode survives a hard refresh.
    const rawMode = readCookie(themeCookieName);
    if (isThemeMode(rawMode) && rawMode !== mode.value) {
      mode.value = rawMode;
      modeCookie.value = rawMode;
    }
    const rawAccent = readCookie(accentCookieName);
    if (isAccentKey(rawAccent) && rawAccent !== accent.value) {
      accent.value = rawAccent;
      accentCookie.value = rawAccent;
    }
    applyMode(mode.value);
    applyAccent(accent.value);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (mode.value === 'auto') {
        applyMode('auto');
        applyAccent(accent.value);
      }
    };
    mql.addEventListener('change', onChange);
    onScopeDispose(() => mql.removeEventListener('change', onChange));
  });

  watch(mode, (m) => {
    modeCookie.value = m;
    applyMode(m);
    applyAccent(accent.value);
  });

  watch(accent, (a) => {
    accentCookie.value = a;
    applyAccent(a);
  });

  const cycle = () => {
    mode.value = mode.value === 'light' ? 'dark' : mode.value === 'dark' ? 'auto' : 'light';
  };

  const setMode = (next: ThemeMode) => {
    mode.value = next;
  };

  const setAccent = (next: AccentKey) => {
    accent.value = next;
  };

  return { mode, accent, cycle, setMode, setAccent, presets: ACCENT_PRESETS };
};
