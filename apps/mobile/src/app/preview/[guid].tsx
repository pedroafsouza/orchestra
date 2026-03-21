import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import type { ScreenComponent, Breakpoint } from '@orchestra/shared';
import { PreviewRuntime } from '@/components/orchestra/PreviewRuntime';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DiagramNode {
  id: string;
  type: string;
  data: {
    label: string;
    nodeType: string;
    props?: {
      screenDefinition?: {
        rootComponents: ScreenComponent[];
        backgroundColor?: string;
        scrollable?: boolean;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
}

interface DatasourceResponse {
  id: string;
  name: string;
  fields: any[];
  entries: Record<string, any>[];
}

interface PreviewData {
  projectName: string;
  diagram: { nodes: DiagramNode[]; edges: any[] };
  datasources: DatasourceResponse[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const API_BASE = Platform.select({
  web: 'http://localhost:3001',
  ios: 'http://localhost:3001',
  android: 'http://10.0.2.2:3001',
  default: 'http://localhost:3001',
});

// ─── Preview Screen ─────────────────────────────────────────────────────────

export default function PreviewScreen() {
  const { guid } = useLocalSearchParams<{ guid: string }>();

  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation state
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [navigationContext, setNavigationContext] = useState<
    Record<string, any> | undefined
  >();
  const [navStack, setNavStack] = useState<
    { nodeId: string; entry?: Record<string, any> }[]
  >([]);

  // Fetch preview data
  useEffect(() => {
    if (!guid) return;

    async function fetchPreview() {
      try {
        const res = await fetch(`${API_BASE}/api/preview/${guid}`);
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? 'Project not found'
              : `Error ${res.status}`,
          );
        }
        const json: PreviewData = await res.json();
        setData(json);

        // Set initial screen to first node
        if (json.diagram.nodes?.length > 0) {
          setCurrentNodeId(json.diagram.nodes[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    }

    fetchPreview();
  }, [guid]);

  // Build datasource map
  const datasourceData = useCallback((): Map<
    string,
    Record<string, any>[]
  > => {
    const map = new Map<string, Record<string, any>[]>();
    if (data?.datasources) {
      for (const ds of data.datasources) {
        map.set(ds.id, ds.entries || []);
      }
    }
    return map;
  }, [data]);

  // Navigation handler
  const handleNavigate = useCallback(
    (nodeId: string, entry?: Record<string, any>) => {
      if (currentNodeId) {
        setNavStack((prev) => [
          ...prev,
          { nodeId: currentNodeId, entry: navigationContext },
        ]);
      }
      setCurrentNodeId(nodeId);
      setNavigationContext(entry);
    },
    [currentNodeId, navigationContext],
  );

  // Back navigation
  const handleBack = useCallback(() => {
    if (navStack.length === 0) return;
    const prev = navStack[navStack.length - 1];
    setNavStack((s) => s.slice(0, -1));
    setCurrentNodeId(prev.nodeId);
    setNavigationContext(prev.entry);
  }, [navStack]);

  // Action handler
  const handleAction = useCallback(
    (action: { type: string; payload: any; formValues: Record<string, string> }) => {
      const { type, payload } = action;

      if (type === 'NAVIGATE' && payload.targetNodeId) {
        handleNavigate(payload.targetNodeId);
      }
    },
    [handleNavigate],
  );

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={s.loadingText}>Loading preview...</Text>
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <View style={s.center}>
        <Text style={s.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <Text style={s.errorText}>{error || 'No data'}</Text>
      </View>
    );
  }

  // ── Find current node ──────────────────────────────────────────────────
  const nodes = data.diagram.nodes || [];
  const currentNode = nodes.find((n) => n.id === currentNodeId) || nodes[0];
  const screen = currentNode?.data?.props?.screenDefinition;

  if (!screen) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>No screen defined for this node</Text>
      </View>
    );
  }

  const breakpoint: Breakpoint = 'phone';

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: screen.backgroundColor || '#0f172a' }]}>
      {/* Navigation header */}
      {navStack.length > 0 && (
        <TouchableOpacity onPress={handleBack} style={s.backButton}>
          <Text style={s.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>
      )}

      {/* Screen title */}
      <View style={s.titleBar}>
        <Text style={s.titleText}>{currentNode.data.label}</Text>
      </View>

      {/* Screen content */}
      {screen.scrollable !== false ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <PreviewRuntime
            rootComponents={screen.rootComponents}
            backgroundColor={screen.backgroundColor || '#0f172a'}
            breakpoint={breakpoint}
            datasourceData={datasourceData()}
            navigationContext={navigationContext}
            onNavigate={handleNavigate}
            onAction={handleAction}
          />
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <PreviewRuntime
            rootComponents={screen.rootComponents}
            backgroundColor={screen.backgroundColor || '#0f172a'}
            breakpoint={breakpoint}
            datasourceData={datasourceData()}
            navigationContext={navigationContext}
            onNavigate={handleNavigate}
            onAction={handleAction}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
  },
  errorEmoji: {
    fontSize: 32,
  },
  errorText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  titleBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  titleText: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
});
