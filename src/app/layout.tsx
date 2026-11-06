import type { Metadata } from 'next';
import './globals.css';
import { FunnelProvider } from '@/context/FunnelContext';

export const metadata: Metadata = {
  title: 'RangeRange — Get Started',
  description: 'RangeRange Wealth Management IRA flow',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="/root-YMJ73ie_.css" />
        <link rel="stylesheet" href="/root-B0hKiacu.css" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <FunnelProvider>{children}</FunnelProvider>
      </body>
    </html>
  );
}
