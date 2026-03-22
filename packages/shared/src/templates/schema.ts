import { z } from 'zod';
import {
  ScreenComponentSchema,
  DatasourceFieldSchema,
} from '../schemas/screen';

// ─── Template Datasource ────────────────────────────────────────────────────

export const TemplateDatasourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  fields: z.array(DatasourceFieldSchema),
  sampleEntries: z.array(z.record(z.string(), z.any())),
});

// ─── Template Node ──────────────────────────────────────────────────────────

export const TemplateNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  props: z.record(z.string(), z.any()).optional(),
  screen: z.object({
    rootComponents: z.array(ScreenComponentSchema),
    backgroundColor: z.string().optional(),
  }),
});

// ─── Template Edge ──────────────────────────────────────────────────────────

export const TemplateEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

// ─── Project Template ───────────────────────────────────────────────────────

export const ProjectTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  datasources: z.array(TemplateDatasourceSchema),
  nodes: z.array(TemplateNodeSchema),
  edges: z.array(TemplateEdgeSchema),
});
