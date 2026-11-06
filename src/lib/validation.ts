import { z } from "zod";

const httpUrlSchema = z.string().trim().url().max(2048).refine((value) => {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}, "Use an HTTP or HTTPS address.");

export const projectPayloadSchema = z.object({
  id: z.string().min(1).max(120),
  revision: z.number().int().positive().optional(),
  updatedAt: z.string().datetime().optional(),
  name: z.string().trim().min(1).max(100),
  client: z.string().trim().max(100),
  url: httpUrlSchema,
  pages: z.array(z.object({
    id: z.string().min(1).max(120),
    name: z.string().trim().min(1).max(100),
    path: z.string().trim().min(1).max(500),
    url: httpUrlSchema,
    reviewed: z.boolean(),
    screenshotAssetId: z.string().min(1).max(120).optional(),
  })).min(1).max(100),
  issues: z.array(z.object({
    id: z.string().min(1).max(120),
    pageId: z.string().min(1).max(120),
    title: z.string().trim().min(1).max(90),
    description: z.string().max(600),
    category: z.enum(["Visual", "Accessibility", "Content", "Interaction"]),
    priority: z.enum(["High", "Medium", "Low"]),
    status: z.enum(["Open", "Resolved"]),
    x: z.number().finite().min(0).max(100),
    y: z.number().finite().min(0).max(100),
    author: z.string().min(1).max(120),
    createdAt: z.string().datetime(),
    comments: z.array(z.object({
      id: z.string().min(1).max(120),
      text: z.string().trim().min(1).max(2000),
      author: z.string().min(1).max(120),
      createdAt: z.string().datetime(),
    })).max(500),
  })).max(2000),
  checklist: z.array(z.object({
    id: z.string().min(1).max(120),
    label: z.string().trim().min(1).max(250),
    complete: z.boolean(),
  })).max(500),
}).strict();

export type ProjectPayload = z.infer<typeof projectPayloadSchema>;
