import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAssets } from './hooks/useAssets';
import { AssetUploadZone } from './components/AssetUploadZone';
import { AssetFilterBar } from './components/AssetFilterBar';
import { AssetGrid } from './components/AssetGrid';
import { AssetDetailSheet } from './components/AssetDetailSheet';
import type { Asset, AssetCategory } from './types';

export function ResourcesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { assets, loading, fetchAssets, uploadAsset, deleteAsset, updateAsset } =
    useAssets(projectId);

  const [category, setCategory] = useState<AssetCategory>('all');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchAssets(category, search);
  }, [fetchAssets, category, search]);

  const handleUpload = useCallback(
    async (file: File) => {
      await uploadAsset(file);
    },
    [uploadAsset],
  );

  const handleUploadComplete = useCallback(() => {
    fetchAssets(category, search);
  }, [fetchAssets, category, search]);

  const handleDelete = useCallback(
    async (assetId: string) => {
      await deleteAsset(assetId);
      if (selectedAsset?.id === assetId) setSelectedAsset(null);
    },
    [deleteAsset, selectedAsset],
  );

  const handleUpdate = useCallback(
    async (assetId: string, updates: { alt?: string; tags?: string[] }) => {
      const updated = await updateAsset(assetId, updates);
      if (updated && selectedAsset?.id === assetId) setSelectedAsset(updated);
    },
    [updateAsset, selectedAsset],
  );

  if (loading && !assets.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-6 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <span className="font-semibold text-sm">Resources</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <AssetUploadZone onUpload={handleUpload} onUploadComplete={handleUploadComplete} />

        <AssetFilterBar
          activeCategory={category}
          search={search}
          onCategoryChange={setCategory}
          onSearchChange={setSearch}
        />

        <AssetGrid
          assets={assets}
          onSelect={setSelectedAsset}
          onDelete={handleDelete}
        />
      </main>

      {/* Detail sheet */}
      {selectedAsset && (
        <AssetDetailSheet
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
