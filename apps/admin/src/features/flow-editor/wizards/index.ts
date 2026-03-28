import type { NodeType } from '@orchestra/shared';
import type { OrchestraNodeData } from '../store/flowStore';
import { LandingWizard } from './LandingWizard';
import { createElement } from 'react';

interface NodeWizardRouterProps {
  nodeType: NodeType;
  projectId: string;
  onComplete: (initialData: Partial<OrchestraNodeData>) => void;
  onCancel: () => void;
}

export function NodeWizardRouter({ nodeType, projectId, onComplete, onCancel }: NodeWizardRouterProps) {
  switch (nodeType) {
    case 'landing':
      return createElement(LandingWizard, { projectId, onComplete, onCancel });
    // Future wizards: list, form, map, photo_gallery, detail, decision
    default:
      // No wizard for this type yet — add immediately with empty data
      onComplete({});
      return null;
  }
}
