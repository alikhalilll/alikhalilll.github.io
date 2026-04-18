import { defaultLocale, localeCookieName, type Locales } from '~/constants/i18n';

export function useI18nHandler() {
  const { locale, locales, setLocale } = useI18n();
  const switchLocalePath = useSwitchLocalePath();

  const langCookie = useCookie<Locales>(localeCookieName, {
    default: () => defaultLocale,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  const handleSetLocale = async (next: Locales) => {
    if (locale.value === next) return;

    // Persist the cookie immediately so SSR reads the new locale on reload.
    langCookie.value = next;

    // Compute the equivalent URL for the target locale based on the current route.
    const target = switchLocalePath(next);

    // Force a full page reload so every SSR-driven attribute (<html dir/lang>,
    // meta tags, initial state) is regenerated cleanly for the new locale.
    if (typeof window !== 'undefined' && target) {
      window.location.href = target;
      return;
    }

    // SSR / edge fallback — still switch the runtime locale.
    await setLocale(next);
  };

  return {
    activeLocale: locale,
    localeList: locales,
    handleSetLocale,
    langCookie,
  };
}
