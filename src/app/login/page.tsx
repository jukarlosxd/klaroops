'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      // Check session to redirect based on role
      // For now, redirect to /admin/dashboard since we are focusing on admin
      // In a real scenario, we would fetch the session here or rely on middleware redirect
      router.push('/admin/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="max-w-md w-full bg-white border rounded-lg p-8 shadow-sm">
      <div className="flex justify-center mb-6">
        <div className="bg-black text-white p-3 rounded-full">
          <Lock size={24} />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-center mb-2">KlaroOps Admin</h1>
      <p className="text-gray-500 text-center mb-8 text-sm">Secure System Access</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="admin@klaroops.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        {(error || errorParam) && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {error || 'Authentication failed'}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
        >
          {loading ? 'Verifying...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
