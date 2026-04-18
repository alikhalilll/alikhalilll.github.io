export type Locales = 'en-us' | 'ar-eg' | 'ar-sa';

export const localeCookieName = 'locale';
export const defaultLocale: Locales = 'en-us';

export const rtlLanguages: Locales[] = ['ar-eg', 'ar-sa'];

export const localeLabels: Record<Locales, { native: string; english: string; flag: string }> = {
  'en-us': { native: 'English', english: 'English (US)', flag: '🇺🇸' },
  'ar-eg': { native: 'العربية', english: 'Arabic (Egypt)', flag: '🇪🇬' },
  'ar-sa': { native: 'العربية', english: 'Arabic (Saudi Arabia)', flag: '🇸🇦' },
};

export const getHtmlAttributes = (
  locale: Locales = defaultLocale
): { lang: Locales; dir: 'ltr' | 'rtl' } => {
  const isRtl = rtlLanguages.includes(locale);
  return {
    lang: locale.toLowerCase() as Locales,
    dir: isRtl ? 'rtl' : 'ltr',
  };
};
