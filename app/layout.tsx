import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
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
    default: 'iforinvoice - Simple Invoicing for Freelancers',
    template: '%s | iforinvoice',
  },
  description: 'Fast, beautiful invoicing for freelancers. Create professional invoices, manage clients, and get paid faster.',
}

export const viewport: Viewport = {
  themeColor: '#28374D',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: "bg-card border-border text-card-foreground",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
