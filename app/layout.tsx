// app/layout.tsx
"use client";
import { useState } from "react";
//import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { QueryProvider } from "@/providers/query-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <html lang="en">
      <body className={inter.variable}>
        {/* Wrap ALL providers at the root level */}
        {/* <SessionProvider
          refetchInterval={5 * 60}  // Refresh session every 5 minutes
          refetchOnWindowFocus={true}
        > */}
          <QueryProvider>
            <div className="flex">
              <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
              <main
                className="flex-1 p-4 transition-all duration-300"
                style={{
                  marginLeft: sidebarOpen ? '16rem' : '0',
                  width: sidebarOpen ? 'calc(100% - 16rem)' : '100%',
                }}
              >
                {children}
              </main>
            </div>
          </QueryProvider>
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}