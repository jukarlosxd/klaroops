'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex w-full items-center gap-2 mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
    >
      <LogOut size={16} />
      Sign Out
    </button>
  );
}
