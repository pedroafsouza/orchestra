import type { ViewStyle, TextStyle } from 'react-native';
import type { ScreenComponent, Breakpoint } from '@orchestra/shared';

export interface ComponentRenderContext {
  breakpoint: Breakpoint;
  entry?: Record<string, any>;
  resolvedStyle: ViewStyle & TextStyle;
  renderChildren: (children?: ScreenComponent[], childEntry?: Record<string, any>) => React.ReactNode;
  formValues: Record<string, string>;
  checkedValues: Record<string, boolean>;
  onFormChange: (id: string, value: string) => void;
  onCheckedChange: (id: string, value: boolean) => void;
  onNavigate: (nodeId: string, entry?: Record<string, any>) => void;
  onAction: (action: { type: string; payload: any; formValues: Record<string, string> }) => void;
  executeActions: () => void;
  datasourceData: Map<string, Record<string, any>[]>;
}

export type ComponentRenderer = (component: ScreenComponent, ctx: ComponentRenderContext) => React.ReactNode;
