export type ThemeMode = 'light' | 'dark' | 'auto';

export type AccentKey = 'slate' | 'terracotta' | 'teal' | 'rose' | 'indigo' | 'olive' | 'amber';

export interface AccentTone {
  primary: string;
  ring: string;
}

export interface AccentPreset {
  key: AccentKey;
  label: string;
  light: AccentTone;
  dark: AccentTone;
}

export const themeCookieName = 'theme';
export const accentCookieName = 'accent';

export const defaultTheme: ThemeMode = 'auto';
export const defaultAccent: AccentKey = 'slate';

export const themeCookieMaxAge = 60 * 60 * 24 * 365;

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

export const isThemeMode = (v: unknown): v is ThemeMode =>
  v === 'light' || v === 'dark' || v === 'auto';

export const isAccentKey = (v: unknown): v is AccentKey =>
  typeof v === 'string' && ACCENT_PRESETS.some((p) => p.key === v);

export const getAccentPreset = (key: unknown): AccentPreset =>
  (isAccentKey(key) && ACCENT_PRESETS.find((p) => p.key === key)) || ACCENT_PRESETS[0]!;
