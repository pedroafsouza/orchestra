import { SafeAreaView, StyleSheet } from 'react-native';
import { useOrchestra } from '../src/hooks/useOrchestra';
import { NodeRenderer } from '../src/components/orchestra/NodeRenderer';

export default function OrchestraScreen() {
  const {
    currentNode,
    context,
    config,
    loading,
    error,
    executeAction,
  } = useOrchestra();

  return (
    <SafeAreaView style={styles.container}>
      <NodeRenderer
        node={currentNode}
        context={context}
        config={config}
        onAction={executeAction}
        loading={loading}
        error={error}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
