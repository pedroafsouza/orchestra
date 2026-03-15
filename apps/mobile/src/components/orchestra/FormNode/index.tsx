import { useState, useEffect } from 'react';
import { resolveProps } from '@orchestra/shared';
import type { OrchestraNode, OrchestraAction } from '@orchestra/shared';
import { FormNodeView } from './view';

interface Props {
  node: OrchestraNode;
  context: Record<string, any>;
  onAction: (action: OrchestraAction) => void;
}

export function FormNode({ node, context, onAction }: Props) {
  const resolved = resolveProps(node.props, { context });
  const fields = resolved.fields || [];

  // Initialize form values from defaults and context
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const field of fields) {
      init[field.key] = field.defaultValue || '';
    }
    return init;
  });

  useEffect(() => {
    node.actions
      .filter((a) => a.trigger === 'onLoad')
      .forEach(onAction);
  }, [node.id]);

  const handleFieldChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Fire onValueChange actions
    node.actions
      .filter((a) => a.trigger === 'onValueChange')
      .forEach(onAction);
  };

  const handleSubmit = () => {
    // Store form data in context
    onAction({
      trigger: 'onPress',
      type: 'SET_CONTEXT',
      payload: { formData: values },
    });
    // Then fire onPress actions
    node.actions
      .filter((a) => a.trigger === 'onPress')
      .forEach(onAction);
  };

  return (
    <FormNodeView
      title={resolved.title || 'Form'}
      fields={fields}
      submitLabel={resolved.submitLabel || 'Submit'}
      values={values}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      actions={node.actions}
      onAction={onAction}
    />
  );
}
