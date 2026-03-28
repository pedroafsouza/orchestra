interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isComplete = step < current;
        const isCurrent = step === current;

        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-300
                ${isComplete ? 'bg-indigo-500 scale-100' : ''}
                ${isCurrent ? 'bg-indigo-500 ring-2 ring-indigo-500/30 ring-offset-1 ring-offset-background scale-110' : ''}
                ${!isComplete && !isCurrent ? 'bg-muted-foreground/25' : ''}
              `}
            />
            {i < total - 1 && (
              <div
                className={`w-8 h-px transition-colors duration-300 ${
                  isComplete ? 'bg-indigo-500' : 'bg-muted-foreground/20'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
