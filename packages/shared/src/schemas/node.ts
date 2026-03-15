import { z } from 'zod';

export const NodeType = z.enum([
  'landing',
  'list',
  'form',
  'map',
  'photo_gallery',
  'decision',
]);
export type NodeType = z.infer<typeof NodeType>;

export const ActionTrigger = z.enum(['onLoad', 'onPress', 'onValueChange']);
export type ActionTrigger = z.infer<typeof ActionTrigger>;

export const ActionType = z.enum([
  'NAVIGATE',
  'SET_CONTEXT',
  'GET_GEO',
  'API_CALL',
  'DATASOURCE_ADD',
  'DATASOURCE_UPDATE',
]);
export type ActionType = z.infer<typeof ActionType>;

export const OrchestraActionSchema = z.object({
  trigger: ActionTrigger,
  type: ActionType,
  payload: z.any(),
});
export type OrchestraAction = z.infer<typeof OrchestraActionSchema>;

export const OrchestraNodeSchema = z.object({
  id: z.string(),
  type: NodeType,
  props: z.record(z.string(), z.any()),
  actions: z.array(OrchestraActionSchema),
});
export type OrchestraNode = z.infer<typeof OrchestraNodeSchema>;
