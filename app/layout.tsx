import type { Metadata, Viewport } from 'next';
import './globals.css';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: `${site.title} — ${site.name}`,
  description: `${site.name}: ${site.role}. ${site.tagline}`,
  openGraph: {
    title: site.title,
    description: site.tagline,
    images: ['/stills/welcome.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#FBF5E9',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
