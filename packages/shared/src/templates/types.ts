import type { DatasourceField, ScreenComponent } from '../schemas/screen';

export interface TemplateDatasource {
  /** Placeholder ID — will be remapped to a fresh ID when cloning */
  id: string;
  name: string;
  fields: DatasourceField[];
  sampleEntries: Record<string, any>[];
}

export interface TemplateNode {
  /** Placeholder ID — remapped on clone */
  id: string;
  label: string;
  type: string;
  /** Position in the diagram canvas */
  position: { x: number; y: number };
  /** Extra node props (e.g. conditions for decision nodes) */
  props?: Record<string, any>;
  screen: {
    rootComponents: ScreenComponent[];
    backgroundColor?: string;
  };
}

export interface TemplateEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  /** Edge label (e.g. condition name from a decision node) */
  label?: string;
  /** Extra data stored on the edge */
  data?: Record<string, any>;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  datasources: TemplateDatasource[];
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}
