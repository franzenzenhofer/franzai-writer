import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { AppProviders } from '@/components/layout/app-providers';
import { OfflineManager } from '@/components/offline/offline-manager';

export const metadata: Metadata = {
  title: 'Franz AI Writer',
  description: 'Generate documents using an AI-powered, multi-step wizard.',
  manifest: '/manifest.json',
  themeColor: '#007bff',
  viewport: 'width=device-width, initial-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Franz AI Writer',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground flex flex-col">
        <AppProviders>
          <OfflineManager>
            <SiteHeader />
            <main className="flex-grow pb-16">
              {children}
            </main>
            <SiteFooter />
            <Toaster />
          </OfflineManager>
        </AppProviders>
      </body>
    </html>
  );
}
