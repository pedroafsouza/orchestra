import { useScreenStore } from './screenStore';
import { DEVICE_FRAMES, type DeviceFrame } from './types';
import { ComponentPreview } from './ComponentPreview';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileScreen, faTabletScreenButton, faDesktop } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const BP_ICONS: Record<string, IconDefinition> = {
  phone: faMobileScreen,
  tablet: faTabletScreenButton,
  desktop: faDesktop,
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
      bg-primary-100 dark:bg-primary-900">
      {/* Breakpoint selector */}
      <div className="flex gap-1 mb-3">
        {(['phone', 'tablet', 'desktop'] as const).map((bp) => (
          <button
            key={bp}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              activeBreakpoint === bp
                ? 'bg-accent-600 text-white'
                : 'bg-white text-primary-600 hover:bg-primary-200 dark:bg-primary-700 dark:text-primary-300 dark:hover:bg-primary-600'
            }`}
            onClick={() => {
              setActiveBreakpoint(bp);
              setActiveFrameIndex(0);
            }}
          >
            <FontAwesomeIcon icon={BP_ICONS[bp]} className="w-3.5 h-3.5" />
            {bp.charAt(0).toUpperCase() + bp.slice(1)}
          </button>
        ))}
      </div>

      {/* Frame variant selector */}
      {framesForBreakpoint.length > 1 && (
        <div className="flex gap-1 mb-3">
          {framesForBreakpoint.map((f, i) => (
            <button
              key={f.name}
              className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
                i === activeFrameIndex
                  ? 'bg-primary-300 text-primary-800 dark:bg-primary-600 dark:text-white'
                  : 'bg-white text-primary-500 hover:text-primary-800 dark:bg-primary-750 dark:text-primary-400 dark:hover:text-white'
              }`}
              onClick={() => setActiveFrameIndex(i)}
            >
              {f.name} ({f.width}x{f.height})
            </button>
          ))}
        </div>
      )}

      {/* Device frame */}
      <div
        className="relative bg-gray-900 dark:bg-black rounded-[40px] shadow-2xl border-4 border-gray-400 dark:border-primary-600"
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
              <div className="flex items-center justify-center h-64 text-primary-400 dark:text-primary-500 text-sm">
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

      <p className="text-[10px] text-primary-400 dark:text-primary-500 mt-2">
        {frame.name} &middot; {frame.width} &times; {frame.height}
      </p>
    </div>
  );
}
