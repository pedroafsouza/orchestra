import type { OrchestraAction } from '@orchestra/shared';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea';
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}

export interface FormNodeProps {
  title: string;
  fields: FormField[];
  submitLabel: string;
  values: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  onSubmit: () => void;
  actions: OrchestraAction[];
  onAction: (action: OrchestraAction) => void;
}
