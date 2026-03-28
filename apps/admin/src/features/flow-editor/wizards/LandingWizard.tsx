import { useState, useMemo } from 'react';
import { WizardShell } from './WizardShell';
import { WizardPhonePreview } from './WizardPhonePreview';
import { LayoutPreviewCard } from './shared/LayoutPreviewCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mountain, Columns, LayoutGrid, CircleDot, Plus, Trash2 } from 'lucide-react';
import {
  generateLandingScreen,
  getLandingLabel,
  type LandingTemplate,
  type LandingConfig,
} from './generators/generateLandingScreen';
import type { OrchestraNodeData } from '../store/flowStore';

export interface LandingWizardProps {
  projectId: string;
  onComplete: (data: Partial<OrchestraNodeData>) => void;
  onCancel: () => void;
}

const TEMPLATES: {
  id: LandingTemplate;
  label: string;
  description: string;
  icon: typeof Mountain;
  gradient: string;
}[] = [
  {
    id: 'hero-parallax',
    label: 'Hero + Parallax',
    description: 'Full-bleed hero image with overlay text',
    icon: Mountain,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    id: 'split',
    label: 'Split Layout',
    description: 'Top half image, bottom half content',
    icon: Columns,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  },
  {
    id: 'card-grid',
    label: 'Card Grid',
    description: '2-column grid of feature cards',
    icon: LayoutGrid,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
  {
    id: 'minimal',
    label: 'Minimal Logo',
    description: 'Centered logo with clean onboarding look',
    icon: CircleDot,
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  },
];

export function LandingWizard({ projectId: _projectId, onComplete, onCancel }: LandingWizardProps) {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<LandingTemplate>('hero-parallax');
  const [title, setTitle] = useState('Welcome');
  const [subtitle, setSubtitle] = useState('Your app tagline here');
  const [backgroundColor, setBackgroundColor] = useState('#0f172a');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [buttons, setButtons] = useState<{ label: string; navigateTo: string }[]>([
    { label: 'Get Started', navigateTo: '' },
  ]);

  const config: LandingConfig = useMemo(
    () => ({
      template,
      title,
      subtitle,
      backgroundColor,
      backgroundImage,
      logoUrl,
      buttons,
    }),
    [template, title, subtitle, backgroundColor, backgroundImage, logoUrl, buttons],
  );

  const screenDefinition = useMemo(() => generateLandingScreen(config), [config]);

  const handleComplete = () => {
    onComplete({
      label: getLandingLabel(template),
      props: { screenDefinition },
    });
  };

  const addButton = () => {
    setButtons([...buttons, { label: 'Button', navigateTo: '' }]);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, field: 'label' | 'navigateTo', value: string) => {
    setButtons(buttons.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  return (
    <WizardShell
      title="Landing Wizard"
      step={step}
      totalSteps={2}
      onCancel={onCancel}
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      onNext={step === 1 ? () => setStep(2) : handleComplete}
      nextLabel={step === 2 ? 'Create Node' : 'Next'}
      preview={<WizardPhonePreview screenDefinition={screenDefinition} />}
    >
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Choose a Template</h2>
            <p className="text-sm text-muted-foreground">
              Select a layout for your landing screen. You can customize it in the next step.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <LayoutPreviewCard
                key={t.id}
                icon={t.icon}
                label={t.label}
                description={t.description}
                selected={template === t.id}
                onClick={() => setTemplate(t.id)}
                gradient={t.gradient}
              />
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Customize</h2>
            <p className="text-sm text-muted-foreground">
              Configure the content for your{' '}
              <span className="font-medium text-foreground">
                {TEMPLATES.find((t) => t.id === template)?.label}
              </span>{' '}
              landing screen.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="wiz-title" className="text-xs font-medium">Title</Label>
            <Input
              id="wiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Welcome"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <Label htmlFor="wiz-subtitle" className="text-xs font-medium">Subtitle</Label>
            <Input
              id="wiz-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Your app tagline here"
            />
          </div>

          {/* Background Color */}
          <div className="space-y-1.5">
            <Label htmlFor="wiz-bgcolor" className="text-xs font-medium">Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="wiz-bgcolor"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#0f172a"
                className="flex-1"
              />
            </div>
          </div>

          {/* Template-specific fields */}
          {(template === 'hero-parallax' || template === 'split') && (
            <div className="space-y-1.5">
              <Label htmlFor="wiz-bgimage" className="text-xs font-medium">Background Image URL</Label>
              <Input
                id="wiz-bgimage"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          )}

          {template === 'minimal' && (
            <div className="space-y-1.5">
              <Label htmlFor="wiz-logo" className="text-xs font-medium">Logo URL</Label>
              <Input
                id="wiz-logo"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">CTA Buttons</Label>
              <Button variant="ghost" size="sm" onClick={addButton} className="h-7 gap-1 text-xs text-muted-foreground">
                <Plus className="w-3 h-3" />
                Add
              </Button>
            </div>
            {buttons.map((btn, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border/60">
                <div className="flex-1 space-y-2">
                  <Input
                    value={btn.label}
                    onChange={(e) => updateButton(i, 'label', e.target.value)}
                    placeholder="Button label"
                    className="h-8 text-sm"
                  />
                  <Input
                    value={btn.navigateTo}
                    onChange={(e) => updateButton(i, 'navigateTo', e.target.value)}
                    placeholder="Navigate to (node ID)"
                    className="h-8 text-sm text-muted-foreground"
                  />
                </div>
                {buttons.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeButton(i)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </WizardShell>
  );
}
