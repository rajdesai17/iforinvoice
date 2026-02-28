import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: {
    default: 'InvoiceFlow - Simple Invoicing for Freelancers',
    template: '%s | InvoiceFlow',
  },
  description: 'Fast, beautiful invoicing for freelancers. Create professional invoices, manage clients, and get paid faster.',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0a0a0b] text-white`}>
        {children}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#111113',
              border: '1px solid #1e1e21',
              color: '#ffffff',
            },
          }}
        />

      </body>
    </html>
  )
}
