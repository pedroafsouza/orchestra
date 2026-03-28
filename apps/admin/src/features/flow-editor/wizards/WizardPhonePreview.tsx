import type { ScreenDefinition } from '@orchestra/shared';
import { ComponentPreview } from '@/features/screen-builder/components/ComponentPreview';

interface WizardPhonePreviewProps {
  screenDefinition: ScreenDefinition;
}

/**
 * A standalone phone-mockup preview that renders a ScreenDefinition
 * without depending on the screenStore. Uses ComponentPreview with
 * a temporary store override for read-only rendering.
 */
export function WizardPhonePreview({ screenDefinition }: WizardPhonePreviewProps) {
  const { rootComponents = [], backgroundColor = '#0f172a' } = screenDefinition;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
        Live Preview
      </div>

      {/* Phone shell */}
      <div
        className="relative bg-gray-900 dark:bg-black rounded-[40px] shadow-2xl border-4 border-gray-400 dark:border-gray-600"
        style={{ width: 310, height: 620, padding: 12 }}
      >
        {/* Notch */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 dark:bg-black rounded-b-2xl z-10" />

        {/* Screen */}
        <div
          className="rounded-[28px] overflow-hidden overflow-y-auto device-scrollbar w-full h-full"
          style={{ backgroundColor }}
        >
          <div style={{ width: 286, minHeight: 596 }}>
            {rootComponents.map((comp, i) => (
              <ReadOnlyComponentPreview key={comp.id} component={comp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal read-only component renderer that reuses ComponentPreview
 * from the screen builder in non-interactive mode.
 */
function ReadOnlyComponentPreview({ component, index }: { component: any; index: number }) {
  return <ComponentPreview component={component} index={index} breakpoint="phone" />;
}
