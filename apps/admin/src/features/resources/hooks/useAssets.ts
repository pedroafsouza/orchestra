import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Asset, AssetCategory } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useAssets(projectId: string | undefined) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = useCallback(
    async (category?: AssetCategory, search?: string) => {
      if (!projectId) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.set('category', category);
        if (search) params.set('search', search);
        const qs = params.toString();
        const path = `/api/projects/${projectId}/assets${qs ? `?${qs}` : ''}`;
        const data = await api<Asset[]>(path);
        setAssets(data);
      } catch (err) {
        console.error('Failed to fetch assets', err);
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  const uploadAsset = useCallback(
    async (file: File, alt?: string, tags?: string[]) => {
      if (!projectId) return;
      const formData = new FormData();
      formData.append('file', file);
      if (alt) formData.append('alt', alt);
      if (tags?.length) formData.append('tags', tags.join(','));

      const res = await fetch(
        `${API_URL}/api/projects/${projectId}/assets`,
        { method: 'POST', body: formData },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      return (await res.json()) as Asset;
    },
    [projectId],
  );

  const deleteAsset = useCallback(
    async (assetId: string) => {
      if (!projectId) return;
      await api(`/api/projects/${projectId}/assets/${assetId}`, {
        method: 'DELETE',
      });
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    },
    [projectId],
  );

  const updateAsset = useCallback(
    async (assetId: string, updates: { alt?: string; tags?: string[] }) => {
      if (!projectId) return;
      const updated = await api<Asset>(
        `/api/projects/${projectId}/assets/${assetId}`,
        { method: 'PATCH', body: updates },
      );
      setAssets((prev) => prev.map((a) => (a.id === assetId ? updated : a)));
      return updated;
    },
    [projectId],
  );

  return {
    assets,
    loading,
    fetchAssets,
    uploadAsset,
    deleteAsset,
    updateAsset,
  };
}
