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
    // SSR payload snapshots the default. Re-sync from the live cookie before
    // applying so a user-chosen mode survives a hard refresh.
    if (isThemeMode(modeCookie.value) && modeCookie.value !== mode.value) {
      mode.value = modeCookie.value;
    }
    if (isAccentKey(accentCookie.value) && accentCookie.value !== accent.value) {
      accent.value = accentCookie.value;
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
