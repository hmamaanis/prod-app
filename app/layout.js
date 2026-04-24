import './globals.css';
import { LangProvider } from '@/lib/LangContext';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';

export const metadata = {
  title: 'PROD — Production Coordination',
  description: 'AI-powered film production management for cast & crew',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PROD',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1A1A1A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* PWA — iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PROD" />
        <link rel="apple-touch-icon" href="/api/icon192" />
        <link rel="apple-touch-icon" sizes="192x192" href="/api/icon192" />
        <link rel="apple-touch-icon" sizes="512x512" href="/api/icon512" />

        {/* PWA — Android / Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1A1A1A" />

        {/* Favicon */}
        <link rel="icon" href="/api/icon192" type="image/png" sizes="192x192" />
        <link rel="shortcut icon" href="/api/icon192" />
      </head>
      <body>
        <LangProvider>
          {children}
        </LangProvider>
        {/* Register service worker — client-only, non-blocking */}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
