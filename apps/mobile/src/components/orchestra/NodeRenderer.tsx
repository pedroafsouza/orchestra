import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import type { OrchestraNode, OrchestraAction, NodeType } from '@orchestra/shared';
import { getComponent } from './componentRegistry';

interface Props {
  node: OrchestraNode | null;
  context: Record<string, any>;
  config: { mapboxToken?: string };
  onAction: (action: OrchestraAction) => void;
  loading: boolean;
  error: string | null;
}

export function NodeRenderer({
  node,
  context,
  config,
  onAction,
  loading,
  error,
}: Props) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading experience...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>{'\u26A0'}</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!node) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No flow loaded</Text>
      </View>
    );
  }

  const Component = getComponent(node.type as NodeType);
  if (!Component) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Unknown node type: {node.type}
        </Text>
      </View>
    );
  }

  return (
    <Component
      node={node}
      context={context}
      config={config}
      onAction={onAction}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 32,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
});
