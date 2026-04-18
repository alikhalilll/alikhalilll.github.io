export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600');

  return [`User-agent: *`, `Allow: /`, ``, `Sitemap: ${siteUrl}/sitemap.xml`, ``].join('\n');
});
