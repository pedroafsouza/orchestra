import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orchestra — Build native mobile apps from a prompt',
  description:
    'Describe your app, Orchestra builds it. Server-driven UI meets AI to ship native mobile experiences in minutes, not months.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
