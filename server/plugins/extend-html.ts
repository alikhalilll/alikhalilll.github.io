import { parseCookies, setCookie } from 'h3';
import { defaultLocale, getHtmlAttributes, localeCookieName, type Locales } from '~/constants/i18n';

const KNOWN_LOCALES: readonly Locales[] = ['en-us', 'ar-eg', 'ar-sa'] as const;
const isKnownLocale = (v: string): v is Locales => (KNOWN_LOCALES as readonly string[]).includes(v);

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const cookies = parseCookies(event);
    const localeFromCookie = cookies[localeCookieName];

    const urlParts = event.path?.split('/').filter(Boolean) ?? [];
    const maybeFromUrl = urlParts[0]?.toLowerCase() ?? '';
    const localeFromUrl = isKnownLocale(maybeFromUrl) ? maybeFromUrl : '';

    const effectiveLocale: Locales = isKnownLocale(localeFromCookie ?? '')
      ? (localeFromCookie as Locales)
      : localeFromUrl || defaultLocale;

    if (!localeFromCookie && localeFromUrl) {
      setCookie(event, localeCookieName, localeFromUrl, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        httpOnly: false,
      });
    }

    const { dir, lang } = getHtmlAttributes(effectiveLocale);
    html.htmlAttrs = [...html.htmlAttrs, `dir="${dir}"`, `lang="${lang}"`];
  });
});
