type SeoInput = {
  title: string;
  description?: string;
  path?: string;
  ogType?: 'website' | 'article' | 'profile';
  image?: string;
  noindex?: boolean;
};

/**
 * Single entry point for per-page SEO. Handles title suffix, canonical,
 * Open Graph, and Twitter cards so pages only declare what's unique.
 */
export function useSiteSeo(input: SeoInput) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const siteName = config.public.siteName as string;
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');
  const fallbackDesc = config.public.siteDescription as string;

  const path = input.path ?? route.path;
  const url = `${siteUrl}${path}`;
  const image = `${siteUrl}${input.image ?? '/og.svg'}`;
  const description = input.description ?? fallbackDesc;
  const fullTitle = input.title.includes(siteName) ? input.title : `${input.title} — ${siteName}`;

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
    twitterCard: 'summary_large_image',
    twitterTitle: input.title,
    twitterDescription: description,
    twitterImage: image,
    twitterImageAlt: input.title,
    robots: input.noindex ? 'noindex, nofollow' : 'index, follow',
  });

  useHead({
    link: [{ rel: 'canonical', href: url }],
  });
}
