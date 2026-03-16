import { useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useOrchestraStore } from '../store/orchestraStore';
import type { OrchestraAction } from '@orchestra/shared';
import { evaluateCondition, resolveProps } from '@orchestra/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const CLIENT_CAPABILITIES = {
  version: '1.0.0',
  supported: ['mapbox', 'camera'],
};

const POLL_INTERVAL = 5000;

interface UseOrchestraOptions {
  projectGuid?: string;
}

export function useOrchestra(options: UseOrchestraOptions = {}) {
  const store = useOrchestraStore();
  const { projectGuid } = options;
  const flowVersionRef = useRef<number | null>(null);

  // Fetch flow on mount (and poll for updates when projectGuid is set)
  useEffect(() => {
    const endpoint = projectGuid
      ? `${API_URL}/api/flow/${projectGuid}/latest`
      : `${API_URL}/api/flow/latest`;

    async function fetchFlow(isPolling = false) {
      if (!isPolling) store.setLoading(true);
      try {
        const res = await fetch(endpoint, {
          headers: {
            'X-Client-Capabilities': JSON.stringify(
              CLIENT_CAPABILITIES.supported
            ),
            'X-App-Version': CLIENT_CAPABILITIES.version,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Only update if flow version changed (avoid unnecessary re-renders)
        if (isPolling && flowVersionRef.current === data.flow?.version) {
          return;
        }

        flowVersionRef.current = data.flow?.version ?? null;
        store.setFlow(data.flow, data.config, data.datasources);
      } catch (err) {
        if (!isPolling) {
          store.setError(
            err instanceof Error ? err.message : 'Failed to fetch flow'
          );
        }
      } finally {
        if (!isPolling) store.setLoading(false);
      }
    }

    fetchFlow();

    // Poll for updates when in preview mode
    let interval: ReturnType<typeof setInterval> | null = null;
    if (projectGuid) {
      interval = setInterval(() => fetchFlow(true), POLL_INTERVAL);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [projectGuid]);

  const executeAction = useCallback(
    async (action: OrchestraAction) => {
      const { context } = useOrchestraStore.getState();

      switch (action.type) {
        case 'NAVIGATE': {
          const targetId =
            typeof action.payload === 'string'
              ? action.payload
              : action.payload?.targetNodeId;

          // For decision nodes, check edge conditions
          const { flow, currentNodeId } = useOrchestraStore.getState();
          if (flow && currentNodeId) {
            const outEdges = flow.edges.filter(
              (e) => e.source === currentNodeId
            );
            for (const edge of outEdges) {
              if (edge.condition && evaluateCondition(edge.condition, context)) {
                store.setCurrentNode(edge.target);
                return;
              }
            }
          }

          if (targetId) {
            store.setCurrentNode(targetId);
          }
          break;
        }

        case 'SET_CONTEXT': {
          if (typeof action.payload === 'object' && action.payload !== null) {
            store.mergeContext(action.payload);
          }
          break;
        }

        case 'GET_GEO': {
          if (Platform.OS !== 'web') {
            try {
              const Location = require('expo-location');
              const { status } =
                await Location.requestForegroundPermissionsAsync();
              if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                store.mergeContext({
                  geo: {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                  },
                });
              }
            } catch {
              // Permission denied or unavailable
            }
          }
          break;
        }

        case 'API_CALL': {
          try {
            const { url, method, body } = action.payload || {};
            const resolvedUrl = resolveProps({ url }, { context }).url as string;
            const res = await fetch(resolvedUrl, {
              method: method || 'GET',
              headers: body
                ? { 'Content-Type': 'application/json' }
                : undefined,
              body: body ? JSON.stringify(resolveProps(body, { context })) : undefined,
            });
            const data = await res.json();
            store.mergeContext({ apiResponse: data });
          } catch (err) {
            store.setError('API call failed');
          }
          break;
        }
      }
    },
    [store]
  );

  return {
    flow: store.flow,
    currentNode: store.getCurrentNode(),
    context: store.context,
    config: store.config,
    datasources: store.datasources,
    loading: store.loading,
    error: store.error,
    executeAction,
    setContext: store.setContext,
    navigate: (nodeId: string) => store.setCurrentNode(nodeId),
  };
}
