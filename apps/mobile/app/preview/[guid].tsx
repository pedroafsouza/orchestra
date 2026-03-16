import { SafeAreaView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useOrchestra } from '../../src/hooks/useOrchestra';
import { NodeRenderer } from '../../src/components/orchestra/NodeRenderer';

export default function PreviewScreen() {
  const { guid } = useLocalSearchParams<{ guid: string }>();
  const {
    currentNode,
    context,
    config,
    datasources,
    loading,
    error,
    executeAction,
    navigate,
  } = useOrchestra({ projectGuid: guid });

  return (
    <SafeAreaView style={styles.container}>
      <NodeRenderer
        node={currentNode}
        context={context}
        config={config}
        datasources={datasources}
        onAction={executeAction}
        onNavigate={navigate}
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
