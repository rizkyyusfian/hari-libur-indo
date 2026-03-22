'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { LogIn, AlertCircle, Shield, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/10 dark:border-slate-700 p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Shield size={32} className="text-[#003049] dark:text-[#669bbc]" />
            </div>
            <h1 className="text-2xl font-bold text-[#003049] dark:text-[#669bbc]">
              Admin Login
            </h1>
            <p className="text-sm text-[#003049]/60 dark:text-gray-400 mt-2">
              Hari Libur Indo - Panel Admin
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#c1121f]/10 border border-[#c1121f]/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-[#c1121f] flex-shrink-0" size={20} />
              <p className="text-sm text-[#c1121f]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#003049] hover:bg-[#003049]/90 dark:bg-[#669bbc] dark:hover:bg-[#669bbc]/90 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-[#669bbc] hover:text-[#003049] dark:hover:text-[#669bbc] transition"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
