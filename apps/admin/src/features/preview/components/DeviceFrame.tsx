import { useRef, useEffect, useState, type ReactNode } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DeviceFrameProps {
  breakpoint: 'phone' | 'tablet' | 'desktop';
  backgroundColor: string;
  children: ReactNode;
}

const FRAME_SIZES = {
  phone: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

// ─── DeviceFrame ────────────────────────────────────────────────────────────

export function DeviceFrame({
  breakpoint,
  backgroundColor,
  children,
}: DeviceFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const frameSize = FRAME_SIZES[breakpoint];

  // Observe container size and compute scale to fit
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeScale = () => {
      const rect = container.getBoundingClientRect();
      // Leave some padding around the frame
      const padX = 32;
      const padY = 32;
      const availW = rect.width - padX;
      const availH = rect.height - padY;

      // For phone/tablet, also account for chrome (notch, bezel)
      const chromeY = breakpoint === 'desktop' ? 36 : 0;
      const deviceW = frameSize.width + (breakpoint === 'desktop' ? 0 : 24);
      const deviceH = frameSize.height + chromeY + (breakpoint === 'desktop' ? 0 : 24);

      const scaleX = availW / deviceW;
      const scaleY = availH / deviceH;
      setScale(Math.min(scaleX, scaleY, 1));
    };

    computeScale();

    const observer = new ResizeObserver(computeScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [breakpoint, frameSize.width, frameSize.height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
        {breakpoint === 'phone' && (
          <PhoneFrame backgroundColor={backgroundColor}>
            {children}
          </PhoneFrame>
        )}
        {breakpoint === 'tablet' && (
          <TabletFrame backgroundColor={backgroundColor}>
            {children}
          </TabletFrame>
        )}
        {breakpoint === 'desktop' && (
          <DesktopFrame backgroundColor={backgroundColor}>
            {children}
          </DesktopFrame>
        )}
      </div>
    </div>
  );
}

// ─── Phone Frame ────────────────────────────────────────────────────────────

function PhoneFrame({
  backgroundColor,
  children,
}: {
  backgroundColor: string;
  children: ReactNode;
}) {
  const size = FRAME_SIZES.phone;
  return (
    <div
      style={{
        width: size.width + 24,
        height: size.height + 24,
        borderRadius: 40,
        border: '3px solid #374151',
        backgroundColor: '#111827',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 150,
          height: 28,
          backgroundColor: '#111827',
          borderRadius: '0 0 20px 20px',
          zIndex: 10,
        }}
      >
        {/* Camera dot */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#1f2937',
          }}
        />
      </div>

      {/* Bottom home indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#374151',
          zIndex: 10,
        }}
      />

      {/* Content area */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          bottom: 12,
          borderRadius: 28,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: size.width,
            height: size.height,
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: backgroundColor || '#0f172a',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Tablet Frame ───────────────────────────────────────────────────────────

function TabletFrame({
  backgroundColor,
  children,
}: {
  backgroundColor: string;
  children: ReactNode;
}) {
  const size = FRAME_SIZES.tablet;
  return (
    <div
      style={{
        width: size.width + 24,
        height: size.height + 24,
        borderRadius: 24,
        border: '3px solid #374151',
        backgroundColor: '#111827',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}
    >
      {/* Camera dot */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#1f2937',
          zIndex: 10,
        }}
      />

      {/* Content area */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          bottom: 12,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: size.width,
            height: size.height,
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: backgroundColor || '#0f172a',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Desktop Frame ──────────────────────────────────────────────────────────

function DesktopFrame({
  backgroundColor,
  children,
}: {
  backgroundColor: string;
  children: ReactNode;
}) {
  const size = FRAME_SIZES.desktop;
  return (
    <div
      style={{
        width: size.width,
        borderRadius: 10,
        border: '2px solid #374151',
        backgroundColor: '#111827',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          height: 36,
          backgroundColor: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
          borderBottom: '1px solid #374151',
        }}
      >
        {/* Traffic lights */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#ef4444',
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#22c55e',
          }}
        />
        {/* Address bar */}
        <div
          style={{
            flex: 1,
            height: 22,
            backgroundColor: '#111827',
            borderRadius: 6,
            marginLeft: 8,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 10,
          }}
        >
          <span style={{ color: '#475569', fontSize: 11 }}>
            app.orchestra.dev
          </span>
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          width: size.width,
          height: size.height,
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: backgroundColor || '#0f172a',
        }}
      >
        {children}
      </div>
    </div>
  );
}
