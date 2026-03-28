import type { NodeType } from '@orchestra/shared';
import type { OrchestraNodeData } from '../store/flowStore';
import { LandingWizard } from './LandingWizard';
import { ListWizard } from './ListWizard';
import { FormWizard } from './FormWizard';
import { MapWizard } from './MapWizard';
import { GalleryWizard } from './GalleryWizard';
import { DetailWizard } from './DetailWizard';
import { DecisionWizard } from './DecisionWizard';
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
    case 'list':
      return createElement(ListWizard, { projectId, onComplete, onCancel });
    case 'form':
      return createElement(FormWizard, { projectId, onComplete, onCancel });
    case 'map':
      return createElement(MapWizard, { projectId, onComplete, onCancel });
    case 'photo_gallery':
      return createElement(GalleryWizard, { projectId, onComplete, onCancel });
    case 'detail':
      return createElement(DetailWizard, { projectId, onComplete, onCancel });
    case 'decision':
      return createElement(DecisionWizard, { projectId, onComplete, onCancel });
    default:
      // No wizard for this type yet — add immediately with empty data
      onComplete({});
      return null;
  }
}
