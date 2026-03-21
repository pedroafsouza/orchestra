import { Input } from '@/components/ui/input';
import { Section } from './Section';
import { FieldRow } from './FieldRow';
import { ColorField } from './ColorField';
import type { ComponentStyle } from '@orchestra/shared';

const selectCls = 'h-8 w-full rounded-md border border-input bg-background px-2 text-xs';

interface AppearanceSectionProps {
  currentStyle: ComponentStyle;
  updateStyle: (updates: Partial<ComponentStyle>) => void;
}

export function AppearanceSection({ currentStyle, updateStyle }: AppearanceSectionProps) {
  return (
    <Section title="Appearance">
      <ColorField label="Background" value={currentStyle.backgroundColor || ''} onChange={(v) => updateStyle({ backgroundColor: v })} />
      <ColorField label="Text color" value={currentStyle.textColor || ''} onChange={(v) => updateStyle({ textColor: v })} />

      <FieldRow label="Font size">
        <Input
          type="number"
          value={currentStyle.fontSize ?? ''}
          onChange={(e) => updateStyle({ fontSize: e.target.value === '' ? undefined : Number(e.target.value) })}
          min={8}
          max={96}
          className="h-8 px-2 text-xs"
        />
      </FieldRow>

      <FieldRow label="Weight">
        <select
          value={currentStyle.fontWeight || ''}
          onChange={(e) => updateStyle({ fontWeight: (e.target.value || undefined) as any })}
          className={selectCls}
        >
          <option value="">Default</option>
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          {['100','200','300','400','500','600','700','800','900'].map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="Align">
        <select
          value={currentStyle.textAlign || ''}
          onChange={(e) => updateStyle({ textAlign: (e.target.value || undefined) as any })}
          className={selectCls}
        >
          <option value="">Default</option>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </FieldRow>

      <FieldRow label="Opacity">
        <Input
          type="number"
          value={currentStyle.opacity ?? ''}
          onChange={(e) => updateStyle({ opacity: e.target.value === '' ? undefined : Number(e.target.value) })}
          min={0}
          max={1}
          step={0.1}
          className="h-8 px-2 text-xs"
        />
      </FieldRow>
    </Section>
  );
}
