type SeoInput = {
  title: string;
  description?: string;
  path?: string;
  ogType?: 'website' | 'article' | 'profile';
  image?: string;
  noindex?: boolean;
};

const OG_LOCALE: Record<string, string> = {
  'en-us': 'en_US',
  'ar-eg': 'ar_EG',
  'ar-sa': 'ar_SA',
};

const HREFLANG: Record<string, string> = {
  'en-us': 'en-US',
  'ar-eg': 'ar-EG',
  'ar-sa': 'ar-SA',
};

/**
 * Single entry point for per-page SEO. Handles title suffix, canonical,
 * Open Graph, Twitter cards, and hreflang alternates so pages only declare
 * what's unique.
 */
export function useSiteSeo(input: SeoInput) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const { locale, locales } = useI18n();
  const switchLocalePath = useSwitchLocalePath();

  const siteName = config.public.siteName as string;
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');
  const fallbackDesc = config.public.siteDescription as string;

  const path = input.path ?? route.path;
  const url = `${siteUrl}${path}`;
  const image = `${siteUrl}${input.image ?? '/og.svg'}`;
  const description = input.description ?? fallbackDesc;
  const fullTitle = input.title.includes(siteName) ? input.title : `${input.title} — ${siteName}`;

  const currentLocale = locale.value as keyof typeof OG_LOCALE;
  const availableLocales = locales.value.map((l) => (typeof l === 'string' ? l : l.code));
  const alternateLocales = availableLocales.filter((l) => l !== currentLocale);

  useSeoMeta({
    title: fullTitle,
    description,
    ogType: input.ogType ?? 'website',
    ogTitle: input.title,
    ogDescription: description,
    ogUrl: url,
    ogSiteName: siteName,
    ogImage: image,
    ogImageAlt: input.title,
    ogLocale: OG_LOCALE[currentLocale] ?? 'en_US',
    ogLocaleAlternate: alternateLocales.map((l) => OG_LOCALE[l]).filter(Boolean),
    twitterCard: 'summary_large_image',
    twitterTitle: input.title,
    twitterDescription: description,
    twitterImage: image,
    twitterImageAlt: input.title,
    robots: input.noindex ? 'noindex, nofollow' : 'index, follow',
  });

  const alternateLinks = availableLocales
    .map((l) => {
      const lp = switchLocalePath(l);
      if (!lp) return null;
      return {
        rel: 'alternate',
        hreflang: HREFLANG[l] ?? l,
        href: `${siteUrl}${lp}`,
      };
    })
    .filter((v): v is { rel: string; hreflang: string; href: string } => v !== null);

  const defaultPath = switchLocalePath('en-us') || path;
  alternateLinks.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: `${siteUrl}${defaultPath}`,
  });

  useHead({
    link: [{ rel: 'canonical', href: url }, ...alternateLinks],
  });
}
