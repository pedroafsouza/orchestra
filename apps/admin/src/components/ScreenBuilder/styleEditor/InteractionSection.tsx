import { Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ActionTrigger, ActionType } from '@orchestra/shared';
import { Section } from './Section';
import { FieldRow } from './FieldRow';

const selectCls = 'h-8 w-full rounded-md border border-input bg-background px-2 text-xs';

interface InteractionSectionProps {
  selectedId: string;
  actions: any[];
  updateComponentActions: (id: string, actions: any[]) => void;
}

export function InteractionSection({ selectedId, actions, updateComponentActions }: InteractionSectionProps) {
  return (
    <Section
      title="Interaction"
      actions={
        <button
          className="p-0.5 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            const newActions = [...actions];
            newActions.push({ trigger: 'onPress', type: 'NAVIGATE', payload: {} });
            updateComponentActions(selectedId, newActions);
          }}
          title="Add event handler"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      }
    >
      <FieldRow label="Event handlers">
        <span className="text-xs text-muted-foreground">
          {actions.length || 'None'}
        </span>
      </FieldRow>

      {actions.map((action: any, idx: number) => (
        <div
          key={idx}
          className="mb-2 p-3 rounded-lg border border-border bg-secondary/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-muted-foreground">Handler #{idx + 1}</span>
            <button
              className="text-destructive hover:text-destructive/80"
              onClick={() => {
                const newActions = [...actions];
                newActions.splice(idx, 1);
                updateComponentActions(selectedId, newActions);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <FieldRow label="Trigger">
            <select
              value={action.trigger || 'onPress'}
              onChange={(e) => {
                const newActions = [...actions];
                newActions[idx] = { ...newActions[idx], trigger: e.target.value };
                updateComponentActions(selectedId, newActions);
              }}
              className={selectCls}
            >
              {ActionTrigger.options.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Type">
            <select
              value={action.type || 'NAVIGATE'}
              onChange={(e) => {
                const newActions = [...actions];
                newActions[idx] = { ...newActions[idx], type: e.target.value };
                updateComponentActions(selectedId, newActions);
              }}
              className={selectCls}
            >
              {ActionType.options.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Payload">
            <Input
              type="text"
              value={typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload || {})}
              onChange={(e) => {
                const newActions = [...actions];
                try {
                  newActions[idx] = { ...newActions[idx], payload: JSON.parse(e.target.value) };
                } catch {
                  newActions[idx] = { ...newActions[idx], payload: e.target.value };
                }
                updateComponentActions(selectedId, newActions);
              }}
              className="h-8 px-2 text-xs"
            />
          </FieldRow>
        </div>
      ))}
    </Section>
  );
}
