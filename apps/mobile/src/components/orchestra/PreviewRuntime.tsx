import { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import type { ScreenComponent, Breakpoint } from '@orchestra/shared';
import { resolveStyle } from '@/lib/resolveStyle';
import { COMPONENT_RENDERERS } from '@/lib/renderers';
import type { ComponentRenderContext } from '@/lib/renderers';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PreviewRuntimeProps {
  rootComponents: ScreenComponent[];
  backgroundColor: string;
  breakpoint: Breakpoint;
  datasourceData: Map<string, Record<string, any>[]>;
  navigationContext?: Record<string, any>;
  onNavigate: (nodeId: string, entry?: Record<string, any>) => void;
  onAction: (action: {
    type: string;
    payload: any;
    formValues: Record<string, string>;
  }) => void;
}

interface RuntimeComponentProps {
  component: ScreenComponent;
  breakpoint: Breakpoint;
  datasourceData: Map<string, Record<string, any>[]>;
  entry?: Record<string, any>;
  formValues: Record<string, string>;
  checkedValues: Record<string, boolean>;
  onFormChange: (componentId: string, value: string) => void;
  onCheckedChange: (componentId: string, value: boolean) => void;
  onNavigate: (nodeId: string, entry?: Record<string, any>) => void;
  onAction: (action: {
    type: string;
    payload: any;
    formValues: Record<string, string>;
  }) => void;
}

// ─── RuntimeComponent ───────────────────────────────────────────────────────

function RuntimeComponent({
  component,
  breakpoint,
  datasourceData,
  entry,
  formValues,
  checkedValues,
  onFormChange,
  onCheckedChange,
  onNavigate,
  onAction,
}: RuntimeComponentProps) {
  if (component.hidden) return null;

  const resolved = resolveStyle(component, breakpoint);

  const renderChildren = (
    children: ScreenComponent[] | undefined,
    childEntry?: Record<string, any>,
  ) =>
    children?.map((child) => (
      <RuntimeComponent
        key={child.id}
        component={child}
        breakpoint={breakpoint}
        datasourceData={datasourceData}
        entry={childEntry ?? entry}
        formValues={formValues}
        checkedValues={checkedValues}
        onFormChange={onFormChange}
        onCheckedChange={onCheckedChange}
        onNavigate={onNavigate}
        onAction={onAction}
      />
    ));

  const executeActions = () => {
    if (component.actions) {
      for (const action of component.actions) {
        onAction({ type: action.type, payload: action, formValues });
      }
    }
  };

  const ctx: ComponentRenderContext = {
    breakpoint,
    entry,
    resolvedStyle: resolved,
    renderChildren,
    formValues,
    checkedValues,
    onFormChange,
    onCheckedChange,
    onNavigate,
    onAction,
    executeActions,
    datasourceData,
  };

  const renderer = COMPONENT_RENDERERS[component.type];
  if (renderer) {
    return <>{renderer(component, ctx)}</>;
  }

  // ── Unknown ───────────────────────────────────────────────────────────────
  return (
    <View style={{ padding: 8 }}>
      <Text style={{ color: '#64748b', fontSize: 12 }}>[{component.type}]</Text>
    </View>
  );
}

// ─── PreviewRuntime (top-level) ─────────────────────────────────────────────

export function PreviewRuntime({
  rootComponents,
  backgroundColor,
  breakpoint,
  datasourceData,
  navigationContext,
  onNavigate,
  onAction,
}: PreviewRuntimeProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [checkedValues, setCheckedValues] = useState<Record<string, boolean>>({});

  const handleFormChange = useCallback(
    (componentId: string, value: string) => {
      setFormValues((prev) => ({ ...prev, [componentId]: value }));
    },
    [],
  );

  const handleCheckedChange = useCallback(
    (componentId: string, value: boolean) => {
      setCheckedValues((prev) => ({ ...prev, [componentId]: value }));
    },
    [],
  );

  return (
    <View style={{ backgroundColor: backgroundColor || '#0f172a', flex: 1 }}>
      {rootComponents.map((comp) => (
        <RuntimeComponent
          key={comp.id}
          component={comp}
          breakpoint={breakpoint}
          datasourceData={datasourceData}
          entry={navigationContext}
          formValues={formValues}
          checkedValues={checkedValues}
          onFormChange={handleFormChange}
          onCheckedChange={handleCheckedChange}
          onNavigate={onNavigate}
          onAction={onAction}
        />
      ))}
    </View>
  );
}
