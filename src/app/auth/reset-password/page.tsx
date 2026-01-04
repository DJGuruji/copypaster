'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password,
      });
      
      setMessage(response.data.message);
      
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-[#fafafa] p-4">
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="text-3xl font-bold tracking-tighter">
          <span className="bg-gradient-to-r from-pink-500 to-green-300 bg-clip-text text-transparent">
            CopyCat
          </span>
        </Link>
        <p className="mt-2 text-sm text-[#a1a1aa]">Create a new password</p>
      </div>

      <div className="w-full max-w-[400px] space-y-6 rounded-xl border border-[#27272a] bg-[#09090b] p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-[#a1a1aa]">
            Enter your new password below
          </p>
        </div>
        
        {message && (
          <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-500 text-center">
            {message}
            <div className="mt-2 text-xs opacity-70">Redirecting to sign in...</div>
          </div>
        )}
        
        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500 text-center">
            {error}
          </div>
        )}
        
        {token && !message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder='••••••••'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#fafafa] text-[#09090b] hover:bg-[#fafafa]/90 h-10 px-4 py-2 w-full mt-2"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        <div className="text-center text-sm text-[#a1a1aa]">
          <Link href="/auth/signin" className="text-[#fafafa] hover:underline underline-offset-4">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-[#fafafa] p-4">
        <div className="w-full max-w-[400px] rounded-xl border border-[#27272a] bg-[#09090b] p-8 shadow-2xl">
          <div className="text-center text-[#a1a1aa]">Loading...</div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
