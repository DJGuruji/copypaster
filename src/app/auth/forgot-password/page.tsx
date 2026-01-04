'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Turnstile } from '@marsidev/react-turnstile';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      const response = await axios.post('/api/auth/forgot-password', { 
        email,
        turnstileToken 
      });
      setMessage(response.data.message);
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
        <p className="mt-2 text-sm text-[#a1a1aa]">Reset your password</p>
      </div>

      <div className="w-full max-w-[400px] space-y-6 rounded-2xl border border-[#27272a] bg-[#09090b] p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-green-300 bg-clip-text text-transparent">Forgot Password</h1>
          <p className="text-sm text-[#a1a1aa]">
            Enter your email to receive a password reset link
          </p>
        </div>
        
        {message && (
          <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-500 text-center">
            {message}
          </div>
        )}
        
        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none text-[#fafafa]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder='name@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="flex justify-center pt-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
              onSuccess={(token) => setTurnstileToken(token)}
              options={{ theme: 'dark' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-bold bg-gradient-to-r from-pink-500 to-green-300 text-[#09090b] hover:opacity-90 transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)] h-10 px-4 py-2 w-full mt-2"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="text-center text-sm text-[#a1a1aa]">
          Remember your password?{' '}
          <Link href="/auth/signin" className="text-[#fafafa] hover:text-pink-400 transition-colors hover:underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
