'use client';

import { useState, useEffect } from 'react';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function SignIn() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          }
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        setError(error.message);
        return;
      }

      if (!data?.url) {
        setError('Failed to get authorization URL');
        return;
      }
      
      // Redirect to Google's authorization page
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to initiate Google sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for error parameter in URL
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      return;
    }

    // Check if we're returning from a Google sign-in attempt
    const startTime = sessionStorage.getItem('googleSignInStarted');
    if (startTime) {
      sessionStorage.removeItem('googleSignInStarted');
      
      // Check the current session
      const checkSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          window.location.href = '/';
        } else if (error) {
          setError('Failed to establish session');
        }
      };
      
      checkSession();
    }
  }, [supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-light to-accent-dark dark:from-primary-dark dark:to-secondary-dark">
      <div className="bg-primary-light dark:bg-secondary-dark px-16 py-10 rounded-xl shadow-2xl max-w-2xl w-full backdrop-blur-sm bg-opacity-95 dark:bg-opacity-90">
        <div className="flex justify-center mb-8">
          <Image 
            src="https://luminascreens.com/wp-content/uploads/2023/05/canva-photo-editor-52-2.webp" 
            alt="Lumina Logo" 
            width={200} 
            height={100} 
            priority 
            className="object-contain" 
          />
        </div>
        
        <h1 className="text-xl font-semibold text-regular-light dark:text-regular-dark mb-6 text-center">
          Sign In to Ask Lumina
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-regular-light dark:text-regular-dark mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-regular-light dark:text-regular-dark mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-tertiary-light dark:border-tertiary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark bg-primary-light dark:bg-primary-dark text-regular-light dark:text-regular-dark"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-accent-light to-accent-dark hover:from-accent-dark hover:to-accent-light text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-tertiary-light dark:border-tertiary-dark"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-primary-light dark:bg-secondary-dark text-muted-light dark:text-muted-dark">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3 border border-gray-300 mb-6"
        >
          <Image 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google logo" 
            width={20} 
            height={20} 
            className="object-contain" 
          />
          Sign in with Google
        </button>

        <p className="text-center text-sm text-muted-light dark:text-muted-dark">
          Don&apos;t have an account?{' '}
          <Link 
            href="/auth/signup" 
            className="font-semibold text-accent-light dark:text-accent-dark hover:text-accent-dark dark:hover:text-accent-light"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}