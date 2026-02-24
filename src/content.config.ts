// ─────────────────────────────────────────────────────────────
// Content Collections Configuration
//
// Astro's Content Collections give us typed, validated content.
// Each collection is a folder inside src/content/, and this file
// defines what fields each piece of content must have.
//
// If you add a blog post without a title, Astro will throw an
// error at build time — not silently deploy a broken page.
// ─────────────────────────────────────────────────────────────

import { defineCollection, z } from 'astro:content';

// ─── Blog: Long-form writing ───────────────────────────────
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

// ─── Lived In: Restaurant & café reviews ────────────────────
// Each review has coordinates for map integration.
// The "city" field is inferred from the folder structure
// (lisbon/, dc/, atx/) so you don't need to type it manually.
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
    }).optional(), // Optional for now — we'll geocode from Google Maps links
    googleMapsUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// ─── Playground: Project dashboard ──────────────────────────
const playground = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    emoji: z.string().default('🧪'),
    status: z.enum(['building', 'built', 'killed']).default('building'),
    pinned: z.boolean().default(false),
    url: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Export all collections — Astro picks these up automatically
export const collections = { blog, livedin, playground };
