import type { OrchestraAction } from '@orchestra/shared';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface ListNodeProps {
  title: string;
  items: ListItem[];
  actions: OrchestraAction[];
  onAction: (action: OrchestraAction) => void;
  onItemPress: (item: ListItem) => void;
}
