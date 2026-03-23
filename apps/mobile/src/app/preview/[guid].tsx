import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import type { ScreenComponent, Breakpoint } from '@orchestra/shared';
import { evaluateCondition, AnalyticsTracker } from '@orchestra/shared';
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
      conditions?: { label: string; expression: string }[];
      [key: string]: any;
    };
    actions?: { trigger: string; type: string; payload: any }[];
    [key: string]: any;
  };
}

interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

interface DatasourceResponse {
  id: string;
  name: string;
  fields: any[];
  entries: Record<string, any>[];
}

interface PreviewData {
  projectId: string;
  projectName: string;
  diagram: { nodes: DiagramNode[]; edges: DiagramEdge[] };
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

  // Local datasource state (for DATASOURCE_ADD/UPDATE in preview)
  const [localDatasources, setLocalDatasources] = useState<
    Map<string, Record<string, any>[]>
  >(new Map());

  // Context for decision nodes (SET_CONTEXT values accumulate here)
  const contextRef = useRef<Record<string, any>>({});

  // Analytics tracker
  const trackerRef = useRef<AnalyticsTracker | null>(null);

  // Initialize / destroy tracker with project data
  useEffect(() => {
    if (!data) return;
    const screen = Dimensions.get('window');
    const tracker = new AnalyticsTracker({
      endpoint: `${API_BASE}/api/projects/${data.projectId}/analytics/events`,
      projectId: data.projectId,
      deviceInfo: {
        platform: Platform.OS,
        screenWidth: screen.width,
        screenHeight: screen.height,
      },
    });
    tracker.track('session_start');
    trackerRef.current = tracker;
    return () => {
      tracker.track('session_end');
      tracker.destroy();
      trackerRef.current = null;
    };
  }, [data]);

  // Track page views when current node changes
  useEffect(() => {
    if (currentNodeId && trackerRef.current) {
      trackerRef.current.setNodeId(currentNodeId);
      trackerRef.current.track('page_view', { nodeId: currentNodeId });
    }
  }, [currentNodeId]);

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

        // Initialize local datasource state
        const dsMap = new Map<string, Record<string, any>[]>();
        for (const ds of json.datasources) {
          dsMap.set(ds.id, ds.entries || []);
        }
        setLocalDatasources(dsMap);

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

  // Build datasource map from local state
  const datasourceData = useCallback((): Map<
    string,
    Record<string, any>[]
  > => {
    return new Map(localDatasources);
  }, [localDatasources]);

  // Resolve decision node — evaluate conditions and follow output edge
  const resolveDecisionNode = useCallback(
    (nodeId: string): string | null => {
      if (!data) return null;
      const node = data.diagram.nodes.find((n) => n.id === nodeId);
      if (!node || node.data.nodeType !== 'decision') return null;

      const conditions = node.data.props?.conditions || [];
      const edges = data.diagram.edges.filter((e) => e.source === nodeId);

      // Evaluate each condition in order, find the first match
      for (let i = 0; i < conditions.length; i++) {
        const cond = conditions[i];
        try {
          if (evaluateCondition(cond.expression, contextRef.current)) {
            // Find the edge for this condition (by sourceHandle or index)
            const edge = edges.find(
              (e) => e.sourceHandle === `condition-${i}`,
            ) || edges[i];
            if (edge) return edge.target;
          }
        } catch {
          // Skip malformed conditions
        }
      }

      // Fallback: use the default/last edge if no condition matched
      const defaultEdge = edges.find(
        (e) => e.sourceHandle === 'default',
      ) || edges[edges.length - 1];
      return defaultEdge?.target || null;
    },
    [data],
  );

  // Navigation handler — resolves decision nodes automatically
  const handleNavigate = useCallback(
    (nodeId: string, entry?: Record<string, any>) => {
      if (!data) return;
      const targetNode = data.diagram.nodes.find((n) => n.id === nodeId);

      // If navigating to a decision node, resolve it to the next screen
      if (targetNode?.data.nodeType === 'decision') {
        const resolvedId = resolveDecisionNode(nodeId);
        if (resolvedId) {
          // Push current screen to stack, then navigate to resolved target
          if (currentNodeId) {
            setNavStack((prev) => [
              ...prev,
              { nodeId: currentNodeId, entry: navigationContext },
            ]);
          }
          setCurrentNodeId(resolvedId);
          setNavigationContext(entry);
          return;
        }
        // Decision node couldn't resolve (no edges/conditions) — go back
        if (navStack.length > 0) {
          const prev = navStack[navStack.length - 1];
          setNavStack((s) => s.slice(0, -1));
          setCurrentNodeId(prev.nodeId);
          setNavigationContext(prev.entry);
          return;
        }
        // No nav stack either — stay on current screen
        return;
      }

      // Track navigation event
      trackerRef.current?.track('navigation', {
        nodeId: currentNodeId ?? undefined,
        metadata: { sourceNodeId: currentNodeId, targetNodeId: nodeId },
      });

      if (currentNodeId) {
        setNavStack((prev) => [
          ...prev,
          { nodeId: currentNodeId, entry: navigationContext },
        ]);
      }
      setCurrentNodeId(nodeId);
      setNavigationContext(entry);
    },
    [currentNodeId, navigationContext, data, resolveDecisionNode],
  );

  // Back navigation
  const handleBack = useCallback(() => {
    if (navStack.length === 0) return;
    const prev = navStack[navStack.length - 1];
    setNavStack((s) => s.slice(0, -1));
    setCurrentNodeId(prev.nodeId);
    setNavigationContext(prev.entry);
  }, [navStack]);

  // Action handler — supports all action types
  const handleAction = useCallback(
    (action: { type: string; payload: any; formValues: Record<string, string> }) => {
      const { type, payload, formValues } = action;

      // Track all actions
      trackerRef.current?.track(
        type === 'DATASOURCE_ADD' || type === 'DATASOURCE_UPDATE'
          ? 'datasource_action'
          : 'button_click',
        {
          nodeId: currentNodeId ?? undefined,
          componentId: payload?.componentId,
          metadata: { actionType: type, datasourceId: payload?.datasourceId },
        },
      );

      switch (type) {
        case 'NAVIGATE': {
          if (payload?.targetNodeId) {
            handleNavigate(payload.targetNodeId);
          }
          break;
        }

        case 'SET_CONTEXT': {
          if (payload?.key != null) {
            contextRef.current = {
              ...contextRef.current,
              [payload.key]: payload.value,
            };
          }
          break;
        }

        case 'DATASOURCE_ADD': {
          if (!payload?.datasourceId) break;
          const dsId = payload.datasourceId;
          const fieldMap: Record<string, string> = payload.fieldMap || {};

          // Build entry data from field map + form values
          const entryData: Record<string, any> = {};
          for (const [dsField, componentId] of Object.entries(fieldMap)) {
            entryData[dsField] = formValues[componentId] ?? '';
          }

          // Add to local datasource state
          setLocalDatasources((prev) => {
            const next = new Map(prev);
            const existing = next.get(dsId) || [];
            next.set(dsId, [...existing, entryData]);
            return next;
          });
          break;
        }

        case 'DATASOURCE_UPDATE': {
          if (!payload?.datasourceId || !payload?.field) break;
          // Update is handled via navigation context entry
          break;
        }

        case 'API_CALL': {
          // Future: make HTTP calls
          break;
        }

        case 'GET_GEO': {
          // Future: get geolocation
          break;
        }
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
