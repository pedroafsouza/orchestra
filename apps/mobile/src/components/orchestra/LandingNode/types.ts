import type { OrchestraAction } from '@orchestra/shared';

export interface LandingNodeProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  actions: OrchestraAction[];
  onAction: (action: OrchestraAction) => void;
}
