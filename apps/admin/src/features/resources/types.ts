export interface Asset {
  id: string;
  projectId: string;
  filename: string;
  mimeType: string;
  category: 'image' | 'video' | 'audio' | 'document';
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  tags: string[];
  url: string;
  thumbUrl?: string;
  createdAt: string;
}

export type AssetCategory = Asset['category'] | 'all';
