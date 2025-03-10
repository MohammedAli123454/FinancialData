// app/layout.tsx
"use client";
import { useState } from "react";
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <html lang="en">
      <body className={inter.variable}>
        <div style={{ display: 'flex' }}>
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <QueryProvider>
            <main
              style={{
                flex: 1,
                padding: '1rem',
                transition: 'margin 0.3s',
                marginLeft: sidebarOpen ? '16rem' : '4rem', // 16rem = 256px (w-64), 4rem accounts for toggle button
              }}
            >
              {children}
            </main>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
