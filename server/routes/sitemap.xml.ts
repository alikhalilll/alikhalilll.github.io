const STATIC_PATHS = ['/', '/about', '/projects', '/blog', '/contact'];

function isoDate(d?: string) {
  if (!d) return new Date().toISOString();
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function xmlEscape(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');

  const posts = await queryCollection(event, 'blog').order('date', 'DESC').all();
  const now = new Date().toISOString();

  const urls = [
    ...STATIC_PATHS.map((p) => ({ loc: `${siteUrl}${p}`, lastmod: now })),
    ...posts.map((p) => ({
      loc: `${siteUrl}${p.path}`,
      lastmod: isoDate(p.date),
    })),
  ];

  const body = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls.map(
      (u) => `  <url><loc>${xmlEscape(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`
    ),
    `</urlset>`,
  ].join('\n');

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600');
  return body;
});
