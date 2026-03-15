import { useEffect } from 'react';
import { resolveProps } from '@orchestra/shared';
import type { OrchestraNode, OrchestraAction } from '@orchestra/shared';
import { LandingNodeView } from './view';

interface Props {
  node: OrchestraNode;
  context: Record<string, any>;
  onAction: (action: OrchestraAction) => void;
}

export function LandingNode({ node, context, onAction }: Props) {
  const resolved = resolveProps(node.props, { context });

  // Fire onLoad actions
  useEffect(() => {
    node.actions
      .filter((a) => a.trigger === 'onLoad')
      .forEach(onAction);
  }, [node.id]);

  return (
    <LandingNodeView
      title={resolved.title || 'Welcome'}
      subtitle={resolved.subtitle}
      imageUrl={resolved.imageUrl}
      actions={node.actions}
      onAction={onAction}
    />
  );
}
