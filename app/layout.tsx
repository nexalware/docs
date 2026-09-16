import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Geist, Geist_Mono } from 'next/font/google';
import './global.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'nexalware docs',
    template: '%s · nexalware docs',
  },
  description:
    'Documentation for Nexalware, infrastructure for AI agents and your own software to act in the physical world - devices, commands, DeviceGrants, rules, schedules, telemetry, and the HTTP/WebSocket API.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:3002',
  ),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
};

export const viewport = {
  themeColor: '#0A0F0D',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen bg-fd-background text-fd-foreground font-sans antialiased">
        <RootProvider
          theme={{
            forcedTheme: 'dark',
            enableSystem: false,
            defaultTheme: 'dark',
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
