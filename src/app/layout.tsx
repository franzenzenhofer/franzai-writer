import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { AppProviders } from '@/components/layout/app-providers';


export const metadata: Metadata = {
  title: 'Franz AI Writer',
  description: 'Generate documents using an AI-powered, multi-step wizard.',
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
          <SiteHeader />
          <main className="flex-grow pb-16">
            {children}
          </main>
          <SiteFooter />
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
