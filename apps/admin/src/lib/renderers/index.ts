import type { ComponentRenderer } from './types';
import { basicRenderers } from './basicRenderers';
import { inputRenderers } from './inputRenderers';
import { layoutRenderers } from './layoutRenderers';
import { mediaRenderers } from './mediaRenderers';

export type { ComponentRenderContext, ComponentRenderer } from './types';

export const COMPONENT_RENDERERS: Record<string, ComponentRenderer> = {
  ...basicRenderers,
  ...inputRenderers,
  ...layoutRenderers,
  ...mediaRenderers,
};
