import { useScreenStore } from '../screenStore';
import { DEVICE_FRAMES, type DeviceFrame } from '../types';
import { ComponentPreview } from './ComponentPreview';
import { useState, useRef, useEffect } from 'react';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 800 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const framesForBreakpoint = DEVICE_FRAMES.filter(
    (f) => f.breakpoint === activeBreakpoint
  );
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const frame = framesForBreakpoint[activeFrameIndex] || framesForBreakpoint[0];

  // Dynamic scale: fit device into available space with padding for controls
  const controlsHeight = 80; // breakpoint buttons + frame variant buttons + label
  const framePadding = 32; // device bezel padding
  const availH = containerSize.h - controlsHeight;
  const availW = containerSize.w - 48; // horizontal margin
  const scale = Math.min(
    availW / (frame.width + framePadding),
    availH / (frame.height + framePadding),
    1
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center overflow-auto py-3 px-4 bg-secondary"
    >
      {/* Breakpoint selector */}
      <div className="flex gap-1 mb-2 shrink-0">
        {(['phone', 'tablet', 'desktop'] as const).map((bp) => {
          const Icon = BP_ICONS[bp];
          return (
            <Button
              key={bp}
              variant={activeBreakpoint === bp ? 'default' : 'secondary'}
              size="xs"
              onClick={() => {
                setActiveBreakpoint(bp);
                setActiveFrameIndex(0);
              }}
            >
              <Icon className="w-3 h-3 mr-1" />
              {bp.charAt(0).toUpperCase() + bp.slice(1)}
            </Button>
          );
        })}
      </div>

      {/* Frame variant selector */}
      {framesForBreakpoint.length > 1 && (
        <div className="flex gap-1 mb-2 shrink-0">
          {framesForBreakpoint.map((f, i) => (
            <Button
              key={f.name}
              variant={i === activeFrameIndex ? 'default' : 'secondary'}
              size="xs"
              className="text-[10px]"
              onClick={() => setActiveFrameIndex(i)}
            >
              {f.name} ({f.width}x{f.height})
            </Button>
          ))}
        </div>
      )}

      {/* Device frame */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div
          className="relative bg-gray-900 dark:bg-black rounded-[40px] shadow-2xl border-4 border-gray-400 dark:border-gray-600"
          style={{
            width: frame.width * scale + framePadding,
            height: frame.height * scale + framePadding,
            padding: framePadding / 2,
          }}
        >
          {frame.breakpoint === 'phone' && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 dark:bg-black rounded-b-2xl z-10" />
          )}

          <div
            className="rounded-[26px] overflow-hidden overflow-y-auto device-scrollbar"
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
      </div>

      <p className="text-[10px] text-muted-foreground mt-1 shrink-0">
        {frame.name} {'\u00B7'} {frame.width} {'\u00D7'} {frame.height}
        {scale < 1 && ` \u00B7 ${Math.round(scale * 100)}%`}
      </p>
    </div>
  );
}
