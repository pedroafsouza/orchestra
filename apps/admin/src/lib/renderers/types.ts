import type { ScreenComponent, Breakpoint } from '@orchestra/shared';

export interface ComponentRenderContext {
  breakpoint: Breakpoint;
  entry?: Record<string, any>;
  resolvedStyle: React.CSSProperties;
  renderChildren: (children?: ScreenComponent[], childEntry?: Record<string, any>) => React.ReactNode;
  interactive: boolean;
  datasourceData: Map<string, Record<string, any>[]>;
  // Only available when interactive=true
  formValues: Record<string, string>;
  checkedValues: Record<string, boolean>;
  onFormChange: (id: string, value: string) => void;
  onCheckedChange: (id: string, value: boolean) => void;
  onNavigate: (nodeId: string, entry?: Record<string, any>) => void;
  onAction: (action: { type: string; payload: any; formValues: Record<string, string> }) => void;
  executeActions: () => void;
}

export type ComponentRenderer = (component: ScreenComponent, ctx: ComponentRenderContext) => React.ReactNode;
