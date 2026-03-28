import { useState } from 'react';
import {
  X,
  Copy,
  Trash2,
  Film,
  Music,
  FileText,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Asset } from '../types';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AssetDetailSheetProps {
  asset: Asset;
  onClose: () => void;
  onUpdate: (assetId: string, updates: { alt?: string; tags?: string[] }) => Promise<void>;
  onDelete: (assetId: string) => Promise<void>;
}

export function AssetDetailSheet({
  asset,
  onClose,
  onUpdate,
  onDelete,
}: AssetDetailSheetProps) {
  const [alt, setAlt] = useState(asset.alt || '');
  const [tagsStr, setTagsStr] = useState(asset.tags.join(', '));
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onUpdate(asset.id, { alt: alt || undefined, tags });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete(asset.id);
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm truncate mr-2">{asset.filename}</h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Preview */}
        <div className="rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {asset.category === 'image' && (
            <img
              src={asset.url}
              alt={asset.alt || asset.filename}
              className="w-full object-contain max-h-72"
            />
          )}
          {asset.category === 'video' && (
            <video src={asset.url} controls className="w-full max-h-72" />
          )}
          {asset.category === 'audio' && (
            <div className="p-8 flex flex-col items-center gap-3">
              <Music className="h-12 w-12 text-muted-foreground" />
              <audio src={asset.url} controls className="w-full" />
            </div>
          )}
          {asset.category === 'document' && (
            <div className="p-12 flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="h-16 w-16" />
              <span className="text-xs">{asset.mimeType}</span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Size</span>
            <span>{formatSize(asset.size)}</span>
          </div>
          {asset.width && asset.height && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dimensions</span>
              <span>
                {asset.width} x {asset.height}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span>{asset.mimeType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <Badge variant="secondary" className="text-xs">
              {asset.category}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Editable fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-alt" className="text-xs">
              Alt Text
            </Label>
            <Input
              id="asset-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe this asset..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset-tags" className="text-xs">
              Tags (comma-separated)
            </Label>
            <Input
              id="asset-tags"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="hero, banner, dark"
            />
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleCopyUrl}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy URL'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmDelete ? 'Click again to confirm' : 'Delete Asset'}
          </Button>
        </div>
      </div>
    </div>
  );
}
