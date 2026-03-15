import { useScreenStore } from './screenStore';
import { DEVICE_FRAMES, type DeviceFrame } from './types';
import { ComponentPreview } from './ComponentPreview';
import { useState } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BP_ICONS: Record<string, LucideIcon> = {
  phone: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export function DevicePreview() {
  const components = useScreenStore((s) => s.components);
  const backgroundColor = useScreenStore((s) => s.backgroundColor);
  const activeBreakpoint = useScreenStore((s) => s.activeBreakpoint);
  const setActiveBreakpoint = useScreenStore((s) => s.setActiveBreakpoint);
  const selectComponent = useScreenStore((s) => s.selectComponent);

  const framesForBreakpoint = DEVICE_FRAMES.filter(
    (f) => f.breakpoint === activeBreakpoint
  );
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const frame = framesForBreakpoint[activeFrameIndex] || framesForBreakpoint[0];

  const maxH = 680;
  const maxW = 500;
  const scale = Math.min(maxW / frame.width, maxH / frame.height, 1);

  return (
    <div className="flex-1 flex flex-col items-center overflow-auto p-4
      bg-secondary">
      {/* Breakpoint selector */}
      <div className="flex gap-1 mb-3">
        {(['phone', 'tablet', 'desktop'] as const).map((bp) => {
          const Icon = BP_ICONS[bp];
          return (
            <Button
              key={bp}
              variant={activeBreakpoint === bp ? 'default' : 'secondary'}
              size="sm"
              onClick={() => {
                setActiveBreakpoint(bp);
                setActiveFrameIndex(0);
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {bp.charAt(0).toUpperCase() + bp.slice(1)}
            </Button>
          );
        })}
      </div>

      {/* Frame variant selector */}
      {framesForBreakpoint.length > 1 && (
        <div className="flex gap-1 mb-3">
          {framesForBreakpoint.map((f, i) => (
            <Button
              key={f.name}
              variant={i === activeFrameIndex ? 'default' : 'secondary'}
              size="sm"
              className="text-[10px] px-2 py-0.5 h-auto"
              onClick={() => setActiveFrameIndex(i)}
            >
              {f.name} ({f.width}x{f.height})
            </Button>
          ))}
        </div>
      )}

      {/* Device frame */}
      <div
        className="relative bg-gray-900 dark:bg-black rounded-[40px] shadow-2xl border-4 border-gray-400 dark:border-gray-600"
        style={{
          width: frame.width * scale + 32,
          height: frame.height * scale + 32,
          padding: 16,
        }}
      >
        {frame.breakpoint === 'phone' && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 dark:bg-black rounded-b-2xl z-10" />
        )}

        <div
          className="rounded-[26px] overflow-hidden overflow-y-auto"
          style={{
            width: frame.width * scale,
            height: frame.height * scale,
            backgroundColor,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) selectComponent(null);
          }}
        >
          <div
            style={{
              width: frame.width,
              height: 'auto',
              minHeight: frame.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {components.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                Add components from the palette
              </div>
            ) : (
              components.map((comp, index) => (
                <ComponentPreview
                  key={comp.id}
                  component={comp}
                  index={index}
                  breakpoint={activeBreakpoint}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2">
        {frame.name} &middot; {frame.width} &times; {frame.height}
      </p>
    </div>
  );
}
