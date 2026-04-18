export type ThemeMode = 'light' | 'dark' | 'auto';

export type AccentKey = 'slate' | 'terracotta' | 'teal' | 'rose' | 'indigo' | 'olive' | 'amber';

export interface AccentPreset {
  key: AccentKey;
  label: string;
  // OKLCH triplet "L C H" — used to build var(--primary) / var(--ring) at runtime.
  light: { primary: string; ring: string };
  dark: { primary: string; ring: string };
}

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    key: 'slate',
    label: 'Slate',
    light: { primary: '0.32 0.015 250', ring: '0.32 0.015 250' },
    dark: { primary: '0.85 0.015 250', ring: '0.85 0.015 250' },
  },
  {
    key: 'terracotta',
    label: 'Terracotta',
    light: { primary: '0.58 0.13 40', ring: '0.58 0.13 40' },
    dark: { primary: '0.72 0.14 45', ring: '0.72 0.14 45' },
  },
  {
    key: 'teal',
    label: 'Teal',
    light: { primary: '0.55 0.12 195', ring: '0.55 0.12 195' },
    dark: { primary: '0.72 0.13 195', ring: '0.72 0.13 195' },
  },
  {
    key: 'rose',
    label: 'Rose',
    light: { primary: '0.6 0.18 15', ring: '0.6 0.18 15' },
    dark: { primary: '0.72 0.18 15', ring: '0.72 0.18 15' },
  },
  {
    key: 'indigo',
    label: 'Indigo',
    light: { primary: '0.5 0.18 270', ring: '0.5 0.18 270' },
    dark: { primary: '0.7 0.16 270', ring: '0.7 0.16 270' },
  },
  {
    key: 'olive',
    label: 'Olive',
    light: { primary: '0.5 0.09 130', ring: '0.5 0.09 130' },
    dark: { primary: '0.72 0.1 130', ring: '0.72 0.1 130' },
  },
  {
    key: 'amber',
    label: 'Amber',
    light: { primary: '0.62 0.16 70', ring: '0.62 0.16 70' },
    dark: { primary: '0.78 0.15 75', ring: '0.78 0.15 75' },
  },
];

const MODE_KEY = 'theme';
const ACCENT_KEY = 'accent';

const isDark = (m: ThemeMode) =>
  m === 'dark' ||
  (m === 'auto' &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches);

const applyMode = (m: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDark(m));
};

const applyAccent = (key: AccentKey) => {
  if (typeof document === 'undefined') return;
  const preset = ACCENT_PRESETS.find((p) => p.key === key) ?? ACCENT_PRESETS[0]!;
  const root = document.documentElement;
  const dark = root.classList.contains('dark');
  const tone = dark ? preset.dark : preset.light;
  root.style.setProperty('--primary', `oklch(${tone.primary})`);
  root.style.setProperty('--ring', `oklch(${tone.ring})`);
};

export const useTheme = () => {
  const mode = useState<ThemeMode>('theme-mode', () => 'auto');
  const accent = useState<AccentKey>('theme-accent', () => 'slate');

  onMounted(() => {
    const storedMode = (localStorage.getItem(MODE_KEY) as ThemeMode | null) ?? 'auto';
    const storedAccent = (localStorage.getItem(ACCENT_KEY) as AccentKey | null) ?? 'slate';
    mode.value = storedMode;
    accent.value = storedAccent;
    applyMode(storedMode);
    applyAccent(storedAccent);

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
    if (typeof window === 'undefined') return;
    localStorage.setItem(MODE_KEY, m);
    applyMode(m);
    applyAccent(accent.value);
  });

  watch(accent, (a) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCENT_KEY, a);
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
