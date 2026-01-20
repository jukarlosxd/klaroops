import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import LogoutButton from "@/components/LogoutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KlaroOps",
  description: "Internal-first control panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900">
            <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
               <a href="/clients" className="font-bold text-xl tracking-tight">KlaroOps</a>
               <div className="flex items-center gap-4">
                 <div className="text-sm text-gray-500 hidden sm:block">Internal Control Panel</div>
                 <LogoutButton />
               </div>
            </nav>
            <main className="p-6 max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
