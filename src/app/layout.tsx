'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarNav } from '@/components/sidebar-nav';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthOrLegalPage = ['/login', '/terms', '/privacy'].includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>BudgetWise</title>
        <meta name="description" content="Track your expenses and manage your budget wisely." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {isAuthOrLegalPage ? (
            children
          ) : (
            <SidebarProvider>
              <Sidebar>
                <SidebarNav />
              </Sidebar>
              <SidebarRail />
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
          )}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
