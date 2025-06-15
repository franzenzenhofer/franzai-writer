import { Inter, Libre_Baskerville, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AppProviders } from "@/components/layout/app-providers";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from 'next';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const libre_baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-libre-baskerville",
});

const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: 'Franz AI Writer',
  description: 'Generate documents using an AI-powered, multi-step wizard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          libre_baskerville.variable,
          roboto_mono.variable
        )}
      >
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
