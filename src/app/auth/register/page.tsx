'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the security check');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await axios.post('/api/auth/register', {
        name,
        email,
        password,
        turnstileToken,
      });
      
      router.push('/auth/signin?registered=true');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-[#fafafa] p-4">
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="text-3xl font-bold tracking-tighter">
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            CopyCat
          </span>
        </Link>
        <p className="mt-2 text-sm text-[#a1a1aa]">Create an account to get started</p>
      </div>

      <div className="w-full max-w-[400px] space-y-6 rounded-2xl border border-[#27272a] bg-[#09090b] p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Create an account</h1>
          <p className="text-sm text-[#a1a1aa]">
            Enter your details below to create your account
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none text-[#fafafa]">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder='John Doe'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none text-[#fafafa]">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder='name@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none text-[#fafafa]">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none text-[#fafafa]">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder='••••••••'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
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
            className="inline-flex items-center justify-center rounded-md text-sm font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-[#09090b] hover:opacity-90 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] h-10 px-4 py-2 w-full mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center text-sm text-[#a1a1aa]">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-[#fafafa] hover:text-yellow-400 transition-colors hover:underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
 