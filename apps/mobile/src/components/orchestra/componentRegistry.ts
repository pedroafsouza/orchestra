import type { ComponentType } from 'react';
import type { OrchestraNode, OrchestraAction, NodeType } from '@orchestra/shared';

import { LandingNode } from './LandingNode';
import { ListNode } from './ListNode';
import { FormNode } from './FormNode';
import { MapNode } from './MapNode';
import { PhotoGalleryNode } from './PhotoGalleryNode';

export interface OrchestraComponentProps {
  node: OrchestraNode;
  context: Record<string, any>;
  config: { mapboxToken?: string };
  onAction: (action: OrchestraAction) => void;
}

type ComponentEntry = ComponentType<any>;

const registry: Record<NodeType, ComponentEntry> = {
  landing: LandingNode,
  list: ListNode,
  form: FormNode,
  map: MapNode,
  photo_gallery: PhotoGalleryNode,
  decision: LandingNode, // Decision nodes are logic-only; render as landing if reached
};

export function getComponent(type: NodeType): ComponentEntry | null {
  return registry[type] ?? null;
}
