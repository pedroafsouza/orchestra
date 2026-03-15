import { z } from 'zod';
import { OrchestraNodeSchema } from './node';

export const OrchestraEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  condition: z.string().optional(), // e.g. "context.user_age > 18"
});
export type OrchestraEdge = z.infer<typeof OrchestraEdgeSchema>;

export const OrchestraFlowSchema = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  name: z.string(),
  entryNodeId: z.string(),
  nodes: z.array(OrchestraNodeSchema),
  edges: z.array(OrchestraEdgeSchema),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type OrchestraFlow = z.infer<typeof OrchestraFlowSchema>;
