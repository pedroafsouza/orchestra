import type { ScreenComponent, ResponsiveStyle, Breakpoint } from '@orchestra/shared';

export type { ScreenComponent, ResponsiveStyle, Breakpoint };

export interface DeviceFrame {
  name: string;
  width: number;
  height: number;
  breakpoint: Breakpoint;
  icon: string;
}

export const DEVICE_FRAMES: DeviceFrame[] = [
  { name: 'iPhone 14', width: 375, height: 812, breakpoint: 'phone', icon: '\u{1F4F1}' },
  { name: 'iPhone 14 Plus', width: 428, height: 926, breakpoint: 'phone', icon: '\u{1F4F1}' },
  { name: 'iPad', width: 768, height: 1024, breakpoint: 'tablet', icon: '\u{1F4F1}' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, breakpoint: 'tablet', icon: '\u{1F4F1}' },
  { name: 'Desktop', width: 1280, height: 800, breakpoint: 'desktop', icon: '\u{1F5A5}' },
  { name: 'Desktop HD', width: 1440, height: 900, breakpoint: 'desktop', icon: '\u{1F5A5}' },
];
