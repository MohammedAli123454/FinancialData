'use client';

import { useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { QueryProvider } from '@/providers/query-provider';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <html lang="en">
      <body className={inter.variable}>
        <QueryProvider>
          {isLoading ? (
            <div className="flex justify-center items-center h-screen">
              Loading…
            </div>
          ) : (
            <div className="flex">
              {/* Only show the Sidebar if we have a user */}
              {!!user && (
                <Sidebar
                  isOpen={sidebarOpen}
                  toggleSidebar={toggleSidebar}
                />
              )}

              <main
                className="flex-1 p-4 transition-all duration-300"
                style={{
                  marginLeft: user && sidebarOpen ? '16rem' : '0',
                  width: user && sidebarOpen
                    ? 'calc(100% - 16rem)'
                    : '100%',
                }}
              >
                {children}
              </main>
            </div>
          )}
        </QueryProvider>
      </body>
    </html>
  );
}
