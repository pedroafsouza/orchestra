import { useEffect } from 'react';
import { resolveProps } from '@orchestra/shared';
import type { OrchestraNode, OrchestraAction } from '@orchestra/shared';
import { ListNodeView } from './view';

interface Props {
  node: OrchestraNode;
  context: Record<string, any>;
  onAction: (action: OrchestraAction) => void;
}

export function ListNode({ node, context, onAction }: Props) {
  const resolved = resolveProps(node.props, { context });

  useEffect(() => {
    node.actions
      .filter((a) => a.trigger === 'onLoad')
      .forEach(onAction);
  }, [node.id]);

  const handleItemPress = (item: { id: string }) => {
    // Set selected item in context, then fire onPress actions
    const pressActions = node.actions.filter((a) => a.trigger === 'onPress');
    onAction({
      trigger: 'onPress',
      type: 'SET_CONTEXT',
      payload: { selectedItem: item },
    });
    pressActions.forEach(onAction);
  };

  return (
    <ListNodeView
      title={resolved.title || 'List'}
      items={resolved.items || []}
      actions={node.actions}
      onAction={onAction}
      onItemPress={handleItemPress}
    />
  );
}
