// app/layout.tsx
"use client";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
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
                {/* Wrap everything with SessionProvider */}
                <SessionProvider>
        <div style={{ display: 'flex' }}>
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <QueryProvider>
          <main
  style={{
    flex: 1,
    padding: '1rem',
    transition: 'width 0.3s, margin-left 0.3s',
    marginLeft: sidebarOpen ? '16rem' : '0',
    width: sidebarOpen ? 'calc(100% - 16rem)' : '100%',
  }}
>
  {children}
</main>
          </QueryProvider>
        </div>
        </SessionProvider>
      </body>
    </html>
  );
}
