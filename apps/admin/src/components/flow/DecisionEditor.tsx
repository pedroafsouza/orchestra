import { useFlowStore, type OrchestraNodeData } from '@/store/flowStore';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getConditionColor } from '@/components/DecisionNode';

interface Condition {
  label: string;
  expression: string;
}

export function DecisionEditor({
  nodeId,
  data,
}: {
  nodeId: string;
  data: OrchestraNodeData;
}) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const conditions: Condition[] = data.props?.conditions || [];

  const updateConditions = (updated: Condition[]) => {
    updateNodeData(nodeId, {
      props: { ...data.props, conditions: updated },
    });
  };

  const addCondition = () => {
    updateConditions([
      ...conditions,
      { label: `Option ${conditions.length + 1}`, expression: '' },
    ]);
  };

  const updateCondition = (index: number, partial: Partial<Condition>) => {
    const updated = conditions.map((c, i) =>
      i === index ? { ...c, ...partial } : c,
    );
    updateConditions(updated);
  };

  const removeCondition = (index: number) => {
    updateConditions(conditions.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Conditions / Branches
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">
        Add branches for each possible outcome. Connect each handle to a target node.
      </p>
      <div className="space-y-2.5">
        {conditions.map((cond, i) => (
          <div
            key={i}
            className="p-2.5 rounded-lg border bg-muted/50 space-y-1.5"
            style={{ borderColor: getConditionColor(i) }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getConditionColor(i) }}
                />
                <span className="text-xs font-medium text-foreground">
                  Branch {i + 1}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-destructive hover:text-destructive/80"
                onClick={() => removeCondition(i)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Label</Label>
              <Input
                className="h-7 text-xs"
                placeholder="e.g. Answer A"
                value={cond.label}
                onChange={(e) => updateCondition(i, { label: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Condition (optional)
              </Label>
              <Input
                className="h-7 text-xs font-mono"
                placeholder='e.g. context.answer === "A"'
                value={cond.expression}
                onChange={(e) => updateCondition(i, { expression: e.target.value })}
              />
            </div>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 p-0 h-auto"
          onClick={addCondition}
        >
          <Plus className="w-2.5 h-2.5" />
          Add Branch
        </Button>
      </div>
    </div>
  );
}
