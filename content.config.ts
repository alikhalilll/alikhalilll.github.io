import { defineCollection, defineContentConfig, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        updatedAt: z.string().optional(),
        draft: z.boolean().optional(),
        lang: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        image: z.string().optional(),
      }),
    }),
  },
});
