import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { OrchestraNodeData } from '../store/flowStore';

export interface DecisionWizardProps {
  projectId: string;
  onComplete: (data: Partial<OrchestraNodeData>) => void;
  onCancel: () => void;
}

interface Condition {
  label: string;
  expression: string;
}

export function DecisionWizard({ projectId: _projectId, onComplete, onCancel }: DecisionWizardProps) {
  const [label, setLabel] = useState('Decision');
  const [conditions, setConditions] = useState<Condition[]>([
    { label: 'Option A', expression: '' },
    { label: 'Option B', expression: '' },
  ]);

  const addCondition = () => {
    setConditions([...conditions, { label: `Option ${String.fromCharCode(65 + conditions.length)}`, expression: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: 'label' | 'expression', value: string) => {
    setConditions(conditions.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const handleComplete = () => {
    onComplete({
      label,
      props: {
        conditions: conditions.map((c) => ({
          label: c.label,
          expression: c.expression || '',
        })),
      },
    });
  };

  const canComplete = label.trim().length > 0 && conditions.length >= 2 && conditions.every((c) => c.label.trim());

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Decision Node</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="decision-label" className="text-xs font-medium">Node Label</Label>
            <Input
              id="decision-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Decision"
            />
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Conditions</Label>
              <Button variant="ghost" size="sm" onClick={addCondition} className="h-7 gap-1 text-xs text-muted-foreground">
                <Plus className="w-3 h-3" />
                Add
              </Button>
            </div>

            {conditions.map((condition, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border/60">
                <div className="flex-1 space-y-2">
                  <Input
                    value={condition.label}
                    onChange={(e) => updateCondition(i, 'label', e.target.value)}
                    placeholder="Condition label"
                    className="h-8 text-sm"
                  />
                  <Input
                    value={condition.expression}
                    onChange={(e) => updateCondition(i, 'expression', e.target.value)}
                    placeholder="Expression (optional)"
                    className="h-8 text-sm text-muted-foreground"
                  />
                </div>
                {conditions.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(i)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!canComplete}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Create Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
