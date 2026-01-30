import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/providers/session-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Bar du Casino - Gestion des Cocktails',
    template: '%s | Bar du Casino',
  },
  description: 'Application professionnelle de gestion du bar pour le casino. Gérez vos cocktails, stocks, ingrédients et consultez les recettes en temps réel.',
  keywords: ['bar', 'casino', 'cocktails', 'gestion', 'recettes', 'ingrédients', 'stock'],
  authors: [{ name: 'Bar du Casino' }],
  creator: 'Bar du Casino',
  publisher: 'Bar du Casino',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bar Casino',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'Bar du Casino - Gestion des Cocktails',
    description: 'Application professionnelle de gestion du bar pour le casino. Gérez vos cocktails, stocks, ingrédients et consultez les recettes en temps réel.',
    siteName: 'Bar du Casino',
  },
  twitter: {
    card: 'summary',
    title: 'Bar du Casino - Gestion des Cocktails',
    description: 'Application professionnelle de gestion du bar pour le casino. Gérez vos cocktails, stocks, ingrédients et consultez les recettes en temps réel.',
    creator: '@barcasino',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
