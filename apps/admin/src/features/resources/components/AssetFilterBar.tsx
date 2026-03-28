import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AssetCategory } from '../types';
import { cn } from '@/lib/utils';

const categories: { value: AssetCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents' },
];

interface AssetFilterBarProps {
  activeCategory: AssetCategory;
  search: string;
  onCategoryChange: (category: AssetCategory) => void;
  onSearchChange: (search: string) => void;
}

export function AssetFilterBar({
  activeCategory,
  search,
  onCategoryChange,
  onSearchChange,
}: AssetFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-1">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'text-xs',
              activeCategory === cat.value
                ? ''
                : 'text-muted-foreground',
            )}
            onClick={() => onCategoryChange(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
