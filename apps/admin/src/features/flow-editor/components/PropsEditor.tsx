import { useFlowStore, type OrchestraNodeData } from '../store/flowStore';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PropsEditor({
  nodeId,
  data,
}: {
  nodeId: string;
  data: OrchestraNodeData;
}) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  const handleLabelChange = (label: string) => {
    updateNodeData(nodeId, { label });
  };

  const handlePropChange = (key: string, value: string) => {
    updateNodeData(nodeId, {
      props: { ...data.props, [key]: value },
    });
  };

  const handleAddProp = () => {
    const key = prompt('Property name:');
    if (key) handlePropChange(key, '');
  };

  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Properties
      </h3>
      <div className="space-y-2">
        <div>
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input
            className="h-8 text-sm"
            value={data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
          />
        </div>
        {Object.entries(data.props)
          .filter(([key, value]) => {
            // Hide complex/internal props from the generic editor
            if (key === 'conditions') return false;
            if (key === 'screenDefinition') return false;
            if (typeof value === 'object' && value !== null) return false;
            return true;
          })
          .map(([key, value]) => (
          <div key={key}>
            <Label className="text-xs text-muted-foreground">{key}</Label>
            <Input
              className="h-8 text-sm"
              value={String(value)}
              onChange={(e) => handlePropChange(key, e.target.value)}
            />
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-primary hover:text-primary/80 p-0 h-auto"
          onClick={handleAddProp}
        >
          <Plus className="w-2.5 h-2.5" />
          Add Property
        </Button>
      </div>
    </div>
  );
}
