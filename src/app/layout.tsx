import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'AlignIQ — Goal Setting & KPI Tracking',
  description: 'Enterprise-grade AI-assisted goal setting and KPI tracking portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
