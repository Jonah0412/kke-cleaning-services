import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KKE Cleaning Services',
  description: 'Professional cleaning for offices, factories, renovation sites and homes in Seremban, Negeri Sembilan.',
  icons: { icon: '/assets/images/kke-logo.png' },
  openGraph: {
    title: 'KKE Cleaning Services',
    description: 'Professional cleaning. Done properly.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'KKE Cleaning Services' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/styles.css?v=20260825-6" />
        <link rel="stylesheet" href="/assets/hero-v6.css?v=20260825-15" />
      </head>
      <body>{children}</body>
    </html>
  );
}
