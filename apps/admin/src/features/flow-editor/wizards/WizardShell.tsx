import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { StepIndicator } from './shared/StepIndicator';

interface WizardShellProps {
  title: string;
  step: number;
  totalSteps: number;
  children: ReactNode;
  preview?: ReactNode;
  onCancel: () => void;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function WizardShell({
  title,
  step,
  totalSteps,
  children,
  preview,
  onCancel,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
}: WizardShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-in fade-in duration-200">
      <div className="w-[98vw] h-[96vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border bg-background border-border">
        {/* Header — glassmorphic toolbar */}
        <div
          className="h-14 flex items-center justify-between px-5 shrink-0 border-b border-border/60"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.85) 100%)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground hover:text-foreground gap-1.5">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <div className="h-5 w-px bg-border" />
            <span className="text-sm font-semibold text-foreground">{title}</span>
          </div>

          <StepIndicator current={step} total={totalSteps} />

          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            )}
            {onNext && (
              <Button
                size="sm"
                onClick={onNext}
                disabled={nextDisabled}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all duration-200"
              >
                {nextLabel}
                {nextLabel !== 'Create Node' && <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Body — split layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left panel — configuration */}
          <div className="w-[40%] border-r border-border overflow-y-auto p-6 bg-background">
            {children}
          </div>

          {/* Right panel — phone preview */}
          <div className="w-[60%] flex items-center justify-center bg-secondary/50 overflow-hidden">
            {preview || (
              <div className="text-muted-foreground text-sm">Preview will appear here</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
