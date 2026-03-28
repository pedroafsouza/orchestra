import { Film, Music, FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Asset } from '../types';
import { cn } from '@/lib/utils';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const categoryIcon: Record<string, React.ReactNode> = {
  video: <Film className="h-10 w-10 text-muted-foreground" />,
  audio: <Music className="h-10 w-10 text-muted-foreground" />,
  document: <FileText className="h-10 w-10 text-muted-foreground" />,
};

const categoryColor: Record<string, string> = {
  image: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  video: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  audio: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  document: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

interface AssetGridProps {
  assets: Asset[];
  onSelect: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
}

export function AssetGrid({ assets, onSelect, onDelete }: AssetGridProps) {
  if (!assets.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <FileText className="h-12 w-12 mb-4" />
        <p className="text-sm font-medium">No assets found</p>
        <p className="text-xs mt-1">Upload files or change the filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {assets.map((asset) => (
        <Card
          key={asset.id}
          className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-md hover:border-primary/40"
          onClick={() => onSelect(asset)}
        >
          {/* Thumbnail */}
          <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
            {asset.category === 'image' ? (
              <img
                src={asset.thumbUrl || asset.url}
                alt={asset.alt || asset.filename}
                className="h-full w-full object-cover"
              />
            ) : (
              categoryIcon[asset.category] || (
                <FileText className="h-10 w-10 text-muted-foreground" />
              )
            )}
          </div>

          {/* Info */}
          <div className="p-2 space-y-1">
            <p className="text-xs font-medium truncate" title={asset.filename}>
              {asset.filename}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {formatSize(asset.size)}
              </span>
              <Badge
                variant="secondary"
                className={cn('text-[10px] px-1.5 py-0', categoryColor[asset.category])}
              >
                {asset.category}
              </Badge>
            </div>
          </div>

          {/* Delete button on hover */}
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(asset.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Card>
      ))}
    </div>
  );
}
