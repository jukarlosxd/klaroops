'use client';

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
    >
      <span className="hidden md:inline">Logout</span>
      <LogOut size={16} />
    </button>
  );
}
