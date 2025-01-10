import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from 'next-themes'
import { AppSidebar } from "@/components/share/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MobileNavbar } from "@/components/share/MobileNavbar"
import { Toaster } from "@/components/ui/sonner"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POS System",
  description: "Point of Sale System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              <div className="flex h-screen w-full">
                <AppSidebar className="hidden md:flex" />
                <SidebarInset className="w-full">
                  <div className="md:hidden">
                    <MobileNavbar />
                  </div>
                  <main className="w-full">
                    {children}
                  </main>
                </SidebarInset>
              </div>
              <Toaster />
            </SidebarProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}