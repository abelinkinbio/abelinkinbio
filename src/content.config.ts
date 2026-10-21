import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// City comes from the folder (lisbon/, dc/, atx/), not a frontmatter field.
const livedin = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    emoji: z.string().default('📍'),
    category: z.enum([
      'coffee', 'dinner', 'drinks', 'bbq', 'pizza',
      'tacos', 'ramen', 'brunch', 'bar', 'bakery',
      'dessert', 'lunch', 'sushi', 'burger', 'other'
    ]).default('other'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const playground = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    status: z.enum(['building', 'built', 'killed']).default('building'),
    pinned: z.boolean().default(false),
    url: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, livedin, playground };
