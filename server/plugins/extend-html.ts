import { parseCookies, setCookie } from 'h3';
import { defaultLocale, getHtmlAttributes, localeCookieName, type Locales } from '~/constants/i18n';
import {
  accentCookieName,
  defaultTheme,
  getAccentPreset,
  isThemeMode,
  themeCookieName,
} from '~/constants/theme';

const KNOWN_LOCALES: readonly Locales[] = ['en-us', 'ar-eg', 'ar-sa'] as const;
const isKnownLocale = (v: string): v is Locales => (KNOWN_LOCALES as readonly string[]).includes(v);

const escapeAttr = (v: string) => v.replace(/"/g, '&quot;');

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

    const themeCookie = cookies[themeCookieName];
    const mode = isThemeMode(themeCookie) ? themeCookie : defaultTheme;
    const preset = getAccentPreset(cookies[accentCookieName]);
    // Server can't read prefers-color-scheme, so 'auto' is rendered as light;
    // the inline <head> script swaps to dark before paint when needed.
    const tone = mode === 'dark' ? preset.dark : preset.light;
    const styleAttr = `style="--primary:oklch(${escapeAttr(tone.primary)});--ring:oklch(${escapeAttr(tone.ring)})"`;

    html.htmlAttrs = [...html.htmlAttrs, `dir="${dir}"`, `lang="${lang}"`, styleAttr];
    if (mode === 'dark') html.htmlAttrs.push('class="dark"');
  });
});
