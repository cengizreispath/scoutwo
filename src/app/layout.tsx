import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { TRPCProvider } from '@/lib/trpc/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScoutWo - Akıllı Alışveriş Asistanı',
  description: 'Kadınlar için çoklu marka ürün arama platformu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <TRPCProvider>
          {children}
          <Toaster />
        </TRPCProvider>
      </body>
    </html>
  );
}
