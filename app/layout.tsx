import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://taga-askai.vercel.app'),
  title: 'TAGA-asK AI - UMak Knowledge Hub',
  description: 'Verified AI knowledge assistant for University of Makati students grounded strictly in official university documents.',
  keywords: ['UMak', 'University of Makati', 'TAGA-asK AI', 'Student Assistant', 'Campus Map', 'Scholarships'],
  authors: [{ name: 'DoError!n' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TAGA-asK AI - UMak Knowledge Hub',
    description: 'Verified AI companion for University of Makati students grounded strictly in official university documents.',
    url: 'https://taga-askai.vercel.app',
    siteName: 'TAGA-asK AI',
    images: [
      {
        url: '/taga-ask-logo-dark.jpg',
        width: 1200,
        height: 630,
        alt: 'TAGA-asK AI - University of Makati AI Companion',
      },
      {
        url: '/taga-ask-logo.png',
        width: 480,
        height: 384,
        alt: 'TAGA-asK AI Logo',
      },
    ],
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TAGA-asK AI - UMak Knowledge Hub',
    description: 'Verified AI companion for University of Makati students grounded strictly in official university documents.',
    images: ['/taga-ask-logo-dark.jpg'],
  },
  icons: {
    icon: [
      { url: '/taga-ask-logo.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/taga-ask-logo.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-amber-300 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
