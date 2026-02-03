'use client';

import { SessionProvider } from "next-auth/react";

// Explicitly configure basePath if needed, though usually automatic
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      // Force fetch to avoid caching issues on client side if that's contributing
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
